(angular => {
    'use strict';

    function validateColumns(columns) {
        let isValid = true;

        angular.forEach(columns, column => isValid = isValid && column.Name);

        if (!isValid) {
            throw 'Column attribute contains invalid';
        }
    }

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
         * @restrict A
         *
         * @description
         * The `tbGridTable` directive generate the HTML table where all the columns and rowsets can be defined.
         * `tbGridTable` requires a parent `tbGrid`.
         */
        .directive('tbGridTable', [
            'tubularTemplateService',
            '$compile',
            '$timeout',
            function (tubularTemplateService, $compile, $timeout) {
                return {
                    require: '^tbGrid',
                    restrict: 'A',
                    scope: {
                        columns: '=?'
                    },
                    link: {
                        pre: (scope, element, attributes, tbGridCtrl) => {
                            scope.tubularDirective = 'tubular-grid-table';

                            if (scope.columns && tbGridCtrl) {
                                validateColumns(scope.columns);

                                const headersTemplate = tubularTemplateService.generateColumnsDefinitions(scope.columns);
                                const headersContent = $compile(headersTemplate)(scope, undefined, {
                                    transcludeControllers: { tbGrid: { instance: tbGridCtrl } }
                                });
                                element.append('<thead><tr ng-transclude></tr></thead>');
                                element.find('tr').append(headersContent);

                                const cellsTemplate = tubularTemplateService.generateCells(scope.columns, '');
                                const cellsContent = $compile('<tbody><tr tb-row ng-repeat="row in rows" row-model="row">' + cellsTemplate + '</tr></tbody>')(scope);
                                element.append(cellsContent);
                            }
                        },
                        post: (scope, element, attributes, tbGridCtrl) => {
                            $timeout(() => tbGridCtrl.hasColumnsDefinitions = true, 500);
                        }
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumnDefinitions
         * @module tubular.directives
         * @restrict A
         *
         * @description
         * The `tbColumnDefinitions` directive is a parent node to fill with `tbColumn`.
         *
         * @param {array} columns Set an array of TubularColumn to use. Using this attribute will create a template for columns and rows overwritting any template inside.
         */
        .directive('tbColumnDefinitions', [
            'tubularTemplateService',
            '$compile',
            function (tubularTemplateService, $compile) {
                return {
                    require: '^tbGrid',
                    restrict: 'A',
                    replace: false,
                    transclude: true,
                    scope: {
                        columns: '=?'
                    },
                    compile: () => ({
                        pre: (scope, element, attributes) => {
                            scope.tubularDirective = 'tubular-column-definitions';

                            if (scope.columns) {
                                validateColumns(scope.columns);
                                const template = '<tr>' + tubularTemplateService.generateColumnsDefinitions(scope.columns) + '</tr>';
                                const content = $compile(template)(scope);
                                element.append(content);
                            }
                        }
                    })
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumn
         * @module tubular.directives
         * @restrict A
         *
         * @description
         * The `tbColumn` directive creates a column in the grid's model.
         * All the attributes are used to generate a `ColumnModel`.
         * 
         * Suggested layout:
         * <th ng-class="{sortable: column.Sortable}" ng-show="column.Visible"></th>
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
            '$compile',
            'tubularColumn',
            function ($compile, tubularColumn) {
                return {
                    require: '^tbGrid',
                    priority: 10,
                    restrict: 'A',
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
                    compile: () => ({
                        pre: (scope, element, attributes, tbGridCtrl) => {
                            scope.tubularDirective = 'tubular-column';

                            scope.column = tubularColumn(scope.name, {
                                Label: scope.label,
                                Sortable: scope.sortable,
                                SortOrder: scope.sortOrder,
                                SortDirection: scope.sortDirection,
                                IsKey: scope.isKey,
                                Searchable: scope.searchable,
                                Visible: scope.visible,
                                DataType: scope.columnType,
                                Aggregate: scope.aggregate
                            });

                            scope.sortColumn = $event => tbGridCtrl.sortColumn(scope.column.Name, $event);

                            scope.$watch('visible', val => {
                                if (angular.isDefined(val)) {
                                    scope.column.Visible = val;
                                }
                            });

                            tbGridCtrl.addColumn(scope.column);

                            if (scope.column.Sortable) {
                                var template = `<a title="Click to sort. Press Ctrl to sort by multiple columns" class="column-header" href ng-click="sortColumn($event)"><span class="column-header-default">{{column.Label}}</span></a>
                                            <i class="fa sort-icon" ng-class="{'fa-long-arrow-up': column.SortDirection == 'Ascending', 'fa-long-arrow-down': column.SortDirection == 'Descending'}">&nbsp;</i>`;

                                element.empty();
                                element.append($compile(template)(scope));
                            }
                        },
                        post: (scope, element) => {
                            if (element.children().length === 0) {
                                element.append($compile('<span>{{column.Label}}</span>')(scope));
                            }
                        }
                    })
                };
            }])
        /**
         * @ngdoc directive
         * @name tbRow
         * @module tubular.directives
         * @restrict A
         *
         * @description
         * The `tbRow` directive should be use with a `ngRepeat` to iterate all the rows or grouped rows in a rowset.
         *
         * @param {object} rowModel Set the current row, if you are using a ngRepeat you must to use the current element variable here.
         */
        .directive('tbRow', ['$timeout', function($timeout) {
            return {
                require: '^tbGrid',
                restrict: 'A',
                transclude: true,
                scope: {
                    model: '=rowModel'
                },
                link: {
                    pre: (scope, element, attributes, tbGridCtrl) => {
                        scope.tubularDirective = 'tubular-rowset';
                        scope.fields = [];

                        scope.bindFields = () => angular.forEach(scope.fields, field => field.bindScope());
                        scope.rows = tbGridCtrl.rows;
                    },
                    post: scope => $timeout(() => scope.bindFields(), 500)
                }
            };
        }])
        /**
         * @ngdoc directive
         * @name tbCell
         * @module tubular.directives
         * @restrict A
         *
         * @description
         * The `tbCell` directive represents the final table element, a cell, where it can
         * hold an in-line editor or a plain AngularJS expression related to the current element in the `ngRepeat`.
         *
         * Suggested container:
         * <td ng-transclude ng-show="column.Visible" data-label="{{::column.Label}}" style="height:auto;"></td>
         *
         * @param {string} columnName Setting the related column, by passing the name, the cell can share attributes (like visibility) with the column.
         */
        .directive('tbCell', [
            function () {

                return {
                    require: '^tbRow',
                    restrict: 'A',
                    replace: false,
                    transclude: true,
                    scope: {
                        columnName: '@?'
                    },
                    controller: ['$scope', function ($scope) {
                        $scope.column = { Visible: true };
                        $scope.columnName = $scope.columnName || null;

                        // TODO: Implement a form in inline editors
                        $scope.getFormScope = () => null;

                        if ($scope.columnName != null) {
                            // TODO: How?
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