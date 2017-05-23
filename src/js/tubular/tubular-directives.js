(angular => {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.directives
     * @module tubular.directives
     *
     * @description
     * Tubular Directives and Components module.
     *
     * It depends upon {@link tubular.services} and {@link tubular.models}.
     */
    angular.module('tubular.directives', ['tubular.models', 'tubular.services'])
        /**
         * @ngdoc directive
         * @name tbGridTable
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbGridTable` directive generate the HTML table where all the columns and rowsets can be defined.
         * `tbGridTable` requires a parent `tbGrid`.
         *
         * This directive is replace by a `table` HTML element.
         */
        .directive('tbGridTable', [
            function () {
                return {
                    require: '^tbGrid',
                    templateUrl: 'tbGridTable.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.$component = $scope.$parent.$parent.$ctrl;
                            $scope.tubularDirective = 'tubular-grid-table';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumnDefinitions
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbColumnDefinitions` directive is a parent node to fill with `tbColumn`.
         *
         * This directive is replace by a `thead` HTML element.
         *
         * @param {array} columns Set an array of TubularColumn to use. Using this attribute will create a template for columns and rows overwritting any template inside.
         */
        .directive('tbColumnDefinitions', [
            'tubularTemplateService',
            '$compile',
            function (tubularTemplateService, $compile) {
                return {
                    require: '^tbGridTable',
                    templateUrl: 'tbColumnDefinitions.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        columns: '=?'
                    },
                    controller: [
                        '$scope',
                        function ($scope) {
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column-definitions';
                        }
                    ],
                    compile: () => ({
                        pre: (scope, element) => {

                            function InitFromColumns() {
                                let isValid = true;

                                angular.forEach(scope.columns, column => isValid = isValid && column.Name);

                                if (!isValid) {
                                    throw 'Column attribute contains invalid';
                                }
                            }

                            if (scope.columns && scope.$component) {
                                InitFromColumns();
                                const template = tubularTemplateService.generateColumnsDefinitions(scope.columns);
                                const content = $compile(template)(scope);
                                element.find('tr').append(content);
                            }
                        },
                        post: scope => scope.$component.hasColumnsDefinitions = true
                    })
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumn
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbColumn` directive creates a column in the grid's model.
         * All the attributes are used to generate a `ColumnModel`.
         *
         * This directive is replace by a `th` HTML element.
         *
         * @param {string} name Set the column name.
         * @param {string} label Set the column label, if empty column's name is used.
         * @param {boolean} sortable Set if column is sortable.
         * @param {number} sortOrder Set the sorting order, -1 if you don't want to set one.
         * @param {string} sortDirection Set the sorting direction, empty for none and valid values: Ascending and Descending.
         * @param {boolean} isKey Set if column is Model's key.
         * @param {boolean} searchable Set if column is searchable.
         * @param {boolean} visible Set if column is visible.
         * @param {string} columnType Set the column data type. Values: string, numeric, date, datetime, or boolean.
         */
        .directive('tbColumn', [
            function () {
                return {
                    require: '^tbColumnDefinitions',
                    // TODO: I was not able to move to templateUrl, I need to research
                    template: '<th ng-transclude ng-class="{sortable: column.Sortable}" ng-show="column.Visible"></th>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        visible: '=',
                        label: '@',
                        name: '@',
                        sortable: '=?',
                        sortOrder: '=?',
                        isKey: '=?',
                        searchable: '=?',
                        columnType: '@?',
                        aggregate: '@?',
                        sortDirection: '@?'
                    },
                    controller: ['$scope', 'tubularColumn',
                        function ($scope, tubularColumn) {
                            $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column';

                            $scope.sortColumn = multiple => $scope.$component.sortColumn($scope.column.Name, multiple);

                            $scope.$watch('visible', val => {
                                if (angular.isDefined(val)) {
                                    $scope.column.Visible = val;
                                }
                            });

                            $scope.$watch('label', () => {
                                $scope.column.Label = $scope.label;
                                // this broadcast here is used for backwards compatibility with tbColumnHeader requiring a scope.label value on its own
                                $scope.$broadcast('tbColumn_LabelChanged', $scope.label);
                            });

                            $scope.column = tubularColumn($scope.name, {
                                Label: $scope.label,
                                Sortable: $scope.sortable,
                                SortOrder: $scope.sortOrder,
                                SortDirection: $scope.sortDirection,
                                IsKey: $scope.isKey,
                                Searchable: $scope.searchable,
                                Visible: $scope.visible,
                                DataType: $scope.columnType,
                                Aggregate: $scope.aggregate
                            });

                            $scope.$component.addColumn($scope.column);
                            $scope.label = $scope.column.Label;
                        }
                    ]
                };
            }])
        /**
         * @ngdoc directive
         * @module tubular.directives
         * @name tbColumnHeader
         * @restrict E
         *
         * @description
         * The `tbColumnHeader` directive creates a column header, and it must be inside a `tbColumn`.
         * This directive has functionality to sort the column, the `sortable` attribute is declared in the parent element.
         *
         * This directive is replace by an `a` HTML element.
         */
        .directive('tbColumnHeader', [
            function () {
                return {
                    require: '^tbColumn',
                    templateUrl: 'tbColumnHeader.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.sortColumn = $event => $scope.$parent.sortColumn($event.ctrlKey);

                            // this listener here is used for backwards compatibility with tbColumnHeader requiring a scope.label value on its own
                            $scope.$on('tbColumn_LabelChanged', ($event, value) => $scope.label = value);
                        }
                    ],
                    link: ($scope, $element) => {
                        if ($element.find('ng-transclude').length > 0) {
                            $element.find('span')[0].remove();
                        }

                        if (!$scope.$parent.column.Sortable) {
                            $element.find('a').replaceWith($element.find('a').children());
                        }
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowSet
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbRowSet` directive is used to handle any `tbRowTemplate`. You can define multiples `tbRowSet` for grouping.
         *
         * This directive is replace by an `tbody` HTML element.
         */
        .directive('tbRowSet', [
            function () {

                return {
                    require: '^tbGrid',
                    templateUrl: 'tbRowSet.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-row-set';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbFootSet
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbFootSet` directive is to handle footer.
         *
         * This directive is replace by an `tfoot` HTML element.
         */
        .directive('tbFootSet', [
            function () {

                return {
                    require: '^tbGrid',
                    templateUrl: 'tbFootSet.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-foot-set';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowTemplate
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbRowTemplate` directive should be use with a `ngRepeat` to iterate all the rows or grouped rows in a rowset.
         *
         * This directive is replace by an `tr` HTML element.
         *
         * @param {object} rowModel Set the current row, if you are using a ngRepeat you must to use the current element variable here.
         */
        .directive('tbRowTemplate', ['$timeout', $timeout => ({
            templateUrl: 'tbRowTemplate.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                model: '=rowModel'
            },
            controller: [
                '$scope', function ($scope) {
                    $scope.tubularDirective = 'tubular-rowset';
                    $scope.fields = [];
                    $scope.hasFieldsDefinitions = false;
                    $scope.$component = $scope.$parent.$parent.$parent.$component;

                    $scope.$watch('hasFieldsDefinitions', newVal => {
                        if (newVal !== true || angular.isUndefined($scope.model)) {
                            return;
                        }

                        $scope.bindFields();
                    });

                    $scope.bindFields = () => angular.forEach($scope.fields, field => field.bindScope());
                }
            ],
            // Wait a little bit before to connect to the fields
            compile: () => ({ post: scope => $timeout(() => scope.hasFieldsDefinitions = true, 300) })
        })
        ])

        /**
         * @ngdoc directive
         * @name tbCellTemplate
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbCellTemplate` directive represents the final table element, a cell, where it can
         * hold an in-line editor or a plain AngularJS expression related to the current element in the `ngRepeat`.
         *
         * This directive is replace by an `td` HTML element.
         *
         * @param {string} columnName Setting the related column, by passing the name, the cell can share attributes (like visibility) with the column.
         */
        .directive('tbCellTemplate', [
            function () {

                return {
                    require: '^tbRowTemplate',
                    templateUrl: 'tbCellTemplate.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        columnName: '@?'
                    },
                    controller: ['$scope', function ($scope) {
                        $scope.column = { Visible: true };
                        $scope.columnName = $scope.columnName || null;
                        $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;

                        // TODO: Implement a form in inline editors
                        $scope.getFormScope = () => null;

                        if ($scope.columnName != null) {
                            const columnModel = $scope.$component.columns
                                .filter(el => el.Name === $scope.columnName);

                            if (columnModel.length > 0) {
                                $scope.column = columnModel[0];
                            }
                        }
                    }
                    ]
                };
            }
        ]);
})(angular);