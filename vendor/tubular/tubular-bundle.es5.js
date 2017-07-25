'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function (angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular
     *
     * @description
     * Tubular module. Entry point to get all the Tubular functionality.
     *
     * It depends upon  {@link tubular.directives}, {@link tubular.services} and {@link tubular.models}.
     */

    angular.module('tubular', ['tubular.directives', 'tubular.services', 'tubular.models']).info({ version: '1.8.0' });
})(angular);

(function (angular) {
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
    .directive('tbGridTable', ['tubularTemplateService', '$compile', function (tubularTemplateService, $compile) {
        return {
            require: '^tbGrid',
            templateUrl: 'tbGridTable.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                columns: '=?'
            },
            controller: ['$scope', function ($scope) {
                $scope.$component = $scope.$parent.$parent.$ctrl;
                $scope.tubularDirective = 'tubular-grid-table';
            }],
            compile: function compile() {
                return {
                    pre: function pre(scope, element) {

                        function InitFromColumns() {
                            var isValid = true;

                            angular.forEach(scope.columns, function (column) {
                                return isValid = isValid && column.Name;
                            });

                            if (!isValid) {
                                throw 'Column attribute contains invalid';
                            }
                        }

                        if (scope.columns && scope.$component) {

                            InitFromColumns();

                            var headersTemplate = tubularTemplateService.generateColumnsDefinitions(scope.columns);
                            var headersContent = $compile(headersTemplate)(scope);
                            element.append('<thead><tr ng-transclude></tr></thead>');
                            element.find('tr').append(headersContent);

                            var cellsTemplate = tubularTemplateService.generateCells(scope.columns, '');
                            var cellsContent = $compile('<tbody><tr ng-repeat="row in $component.rows" row-model="row">' + cellsTemplate + '</tr></tbody>')(scope);
                            element.append(cellsContent);
                        }
                    },
                    post: function post(scope) {
                        return scope.$component.hasColumnsDefinitions = angular.isDefined(scope.columns) && angular.isDefined(scope.$component);
                    }
                };
            }
        };
    }])
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
    .directive('tbColumnDefinitions', ['tubularTemplateService', '$compile', function (tubularTemplateService, $compile) {
        return {
            require: '^tbGridTable',
            templateUrl: 'tbColumnDefinitions.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                columns: '=?'
            },
            controller: ['$scope', function ($scope) {
                $scope.$component = $scope.$parent.$parent.$component;
                $scope.tubularDirective = 'tubular-column-definitions';
            }],
            compile: function compile() {
                return {
                    pre: function pre(scope, element) {

                        function InitFromColumns() {
                            var isValid = true;

                            angular.forEach(scope.columns, function (column) {
                                return isValid = isValid && column.Name;
                            });

                            if (!isValid) {
                                throw 'Column attribute contains invalid';
                            }
                        }

                        if (scope.columns && scope.$component) {
                            InitFromColumns();
                            var template = tubularTemplateService.generateColumnsDefinitions(scope.columns);
                            var content = $compile(template)(scope);
                            element.find('tr').append(content);
                        }
                    },
                    post: function post(scope) {
                        return scope.$component.hasColumnsDefinitions = true;
                    }
                };
            }
        };
    }])
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
    .directive('tbColumn', [function () {
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
            controller: ['$scope', 'tubularColumn', function ($scope, tubularColumn) {
                $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                $scope.tubularDirective = 'tubular-column';

                $scope.sortColumn = function (multiple) {
                    return $scope.$component.sortColumn($scope.column.Name, multiple);
                };

                $scope.$watch('visible', function (val) {
                    if (angular.isDefined(val)) {
                        $scope.column.Visible = val;
                    }
                });

                $scope.$watch('label', function () {
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
            }]
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
    .directive('tbColumnHeader', [function () {
        return {
            require: '^tbColumn',
            templateUrl: 'tbColumnHeader.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: false,
            controller: ['$scope', function ($scope) {
                $scope.sortColumn = function ($event) {
                    return $scope.$parent.sortColumn($event.ctrlKey);
                };

                // this listener here is used for backwards compatibility with tbColumnHeader requiring a scope.label value on its own
                $scope.$on('tbColumn_LabelChanged', function ($event, value) {
                    return $scope.label = value;
                });
            }],
            link: function link($scope, $element) {
                if ($element.find('ng-transclude').length > 0) {
                    $element.find('span')[0].remove();
                }

                if (!$scope.$parent.column.Sortable) {
                    $element.find('a').replaceWith($element.find('a').children());
                }
            }
        };
    }])
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
    .directive('tbRowSet', [function () {

        return {
            require: '^tbGrid',
            templateUrl: 'tbRowSet.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            controller: ['$scope', function ($scope) {
                $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                $scope.tubularDirective = 'tubular-row-set';
            }]
        };
    }])
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
    .directive('tbFootSet', [function () {

        return {
            require: '^tbGrid',
            templateUrl: 'tbFootSet.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: false,
            controller: ['$scope', function ($scope) {
                $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                $scope.tubularDirective = 'tubular-foot-set';
            }]
        };
    }])
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
    .directive('tbRowTemplate', ['$timeout', function ($timeout) {
        return {
            templateUrl: 'tbRowTemplate.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                model: '=rowModel'
            },
            controller: ['$scope', function ($scope) {
                $scope.tubularDirective = 'tubular-row-template';
                $scope.fields = [];
                $scope.$component = $scope.$parent.$parent.$parent.$component;

                $scope.bindFields = function () {
                    return angular.forEach($scope.fields, function (field) {
                        return field.bindScope();
                    });
                };
            }],
            // Wait a little bit before to connect to the fields
            compile: function compile() {
                return { post: function post(scope) {
                        return $timeout(function () {
                            return scope.bindFields();
                        }, 300);
                    } };
            }
        };
    }])
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
    .directive('tbCellTemplate', [function () {

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
                $scope.getFormScope = function () {
                    return null;
                };

                if ($scope.columnName != null) {
                    var columnModel = $scope.$component.columns.filter(function (el) {
                        return el.Name === $scope.columnName;
                    });

                    if (columnModel.length > 0) {
                        $scope.column = columnModel[0];
                    }
                }
            }]
        };
    }]).directive('tbCell', [function () {

        return {
            require: '^tbRowTemplate',
            restrict: 'A',
            replace: false,
            transclude: true,
            scope: {
                columnName: '@?'
            },
            controller: ['$scope', function ($scope) {
                $scope.column = { Visible: true };
                $scope.columnName = $scope.columnName || null;
                $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;

                // TODO: Implement a form in inline editors
                $scope.getFormScope = function () {
                    return null;
                };

                if ($scope.columnName != null) {
                    var columnModel = $scope.$component.columns.filter(function (el) {
                        return el.Name === $scope.columnName;
                    });

                    if (columnModel.length > 0) {
                        $scope.column = columnModel[0];
                    }
                }
            }]
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.models
     *
     * @description
     * Tubular Models module.
     *
     * It contains model's factories to be use in {@link tubular.directives} like `tubularModel` and `tubularColumn`.
     */

    angular.module('tubular.models', []);
})(angular);

(function (angular) {
    angular.module('tubular.directives').run(['$templateCache', function ($templateCache) {
        "use strict";

        $templateCache.put("tbCheckboxField.tpl.html", "<div ng-class=\"{ 'checkbox' : $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\" class=tubular-checkbox><input type=checkbox ng-model=$ctrl.value ng-disabled=\"$ctrl.readOnly || !$ctrl.isEditing\" class=tubular-checkbox id={{$ctrl.name}} name={{$ctrl.name}}><label ng-show=$ctrl.isEditing for={{$ctrl.name}} ng-bind=$ctrl.label></label><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbDateTimeEditorBs.tpl.html", "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing>{{ $ctrl.value | date: format }}</span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><div class=input-group ng-show=$ctrl.isEditing><input uib-datepicker-popup={{$ctrl.format}} ng-model=$ctrl.dateValue class=form-control ng-required=$ctrl.required ng-readonly=$ctrl.readOnly name={{$ctrl.name}} is-open=$ctrl.open> <span class=input-group-btn><button type=button class=\"btn btn-default\" ng-click=\"$ctrl.open = !$ctrl.open\"><i class=\"fa fa-calendar\"></i></button></span></div><div uib-timepicker ng-model=$ctrl.dateValue show-seconds=true show-meridian=false></div><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbDateTimeEditorHtml5.tpl.html", "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing>{{ $ctrl.value | date: format }}</span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><input type=datetime-local ng-show=$ctrl.isEditing ng-model=$ctrl.dateValue class=form-control ng-required=$ctrl.required ng-readonly=$ctrl.readOnly name={{$ctrl.name}}> <span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbDropdownEditor.tpl.html", "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.readOnlyValue></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><select ng-options=\"{{ $ctrl.selectOptions }}\" ng-show=$ctrl.isEditing ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-disabled=$ctrl.readOnly name={{$ctrl.name}} ng-change=\"onChange({value: value})\"></select><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbNumericEditor.tpl.html", "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing>{{$ctrl.value | numberorcurrency: format }}</span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><div class=input-group ng-show=$ctrl.isEditing><div class=input-group-addon ng-hide=\"$ctrl.format == 'I'\"><i ng-class=\"{ 'fa': true, 'fa-calculator': $ctrl.format != 'C', 'fa-usd': $ctrl.format == 'C'}\"></i></div><input type=number placeholder={{$ctrl.placeholder}} ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-hide=$ctrl.readOnly step=\"{{$ctrl.step || 'any'}}\" name={{$ctrl.name}}><p class=\"form-control form-control-static text-right\" ng-show=$ctrl.readOnly>{{$ctrl.value | numberorcurrency: format}}</p></div><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbSimpleEditor.tpl.html", "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.value></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><input type={{$ctrl.editorType}} placeholder={{$ctrl.placeholder}} ng-show=$ctrl.isEditing ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-readonly=$ctrl.readOnly name={{$ctrl.name}}> <span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbTextArea.tpl.html", "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.value></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><textarea ng-show=$ctrl.isEditing placeholder={{$ctrl.placeholder}} ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-readonly=$ctrl.readOnly name={{$ctrl.name}}></textarea><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
        $templateCache.put("tbForm.tpl.html", "<form ng-transclude name={{name}}></form>");
        $templateCache.put("tbEditButton.tpl.html", "<button ng-click=$ctrl.edit() class=\"btn btn-xs btn-default\" ng-hide=$ctrl.model.$isEditing>{{:: $ctrl.caption || ('CAPTION_EDIT' | translate) }}</button>");
        $templateCache.put("tbExportButton.tpl.html", "<div class=btn-group uib-dropdown><button class=\"btn btn-info btn-sm {{::$ctrl.css}}\" uib-dropdown-toggle><span class=\"fa fa-download\"></span>&nbsp;{{:: $ctrl.caption || ('UI_EXPORTCSV' | translate)}}&nbsp;<span class=caret></span></button><ul class=dropdown-menu uib-dropdown-menu><li><a href=javascript:void(0) ng-click=$ctrl.downloadCsv($parent)>{{:: $ctrl.captionMenuCurrent || ('UI_CURRENTROWS' | translate)}}</a></li><li><a href=javascript:void(0) ng-click=$ctrl.downloadAllCsv($parent)>{{:: $ctrl.captionMenuAll || ('UI_ALLROWS' | translate)}}</a></li></ul></div>");
        $templateCache.put("tbGridPager.tpl.html", "<div class=tubular-pager><ul uib-pagination ng-disabled=$ctrl.$component.isEmpty direction-links=true first-text=&#xf049; previous-text=&#xf04a; next-text=&#xf04e; last-text=&#xf050; boundary-links=true total-items=$ctrl.$component.filteredRecordCount items-per-page=$ctrl.$component.pageSize max-size=5 ng-model=$ctrl.$component.currentPage ng-change=$ctrl.pagerPageChanged()></ul></div>");
        $templateCache.put("tbGridPagerInfo.tpl.html", "<div class=\"pager-info small\" ng-hide=$ctrl.$component.isEmpty>{{'UI_SHOWINGRECORDS' | translate: $ctrl.currentInitial:$ctrl.currentTop:$ctrl.$component.filteredRecordCount}} <span ng-show=$ctrl.filtered>{{'UI_FILTEREDRECORDS' | translate: $ctrl.$component.totalRecordCount}}</span></div>");
        $templateCache.put("tbPageSizeSelector.tpl.html", "<div class={{::$ctrl.css}}><form class=form-inline><div class=form-group><label class=small>{{:: $ctrl.caption || ('UI_PAGESIZE' | translate) }}</label>&nbsp;<select ng-model=$ctrl.$component.pageSize class=\"form-control input-sm {{::$ctrl.selectorCss}}\" ng-options=\"item for item in options\"></select></div></form></div>");
        $templateCache.put("tbPrintButton.tpl.html", "<button class=\"btn btn-default btn-sm\" ng-click=$ctrl.printGrid()><span class=\"fa fa-print\"></span>&nbsp;{{:: $ctrl.caption || ('CAPTION_PRINT' | translate)}}</button>");
        $templateCache.put("tbRemoveButton.tpl.html", "<button class=\"btn btn-danger btn-xs btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=right popover-title=\"{{ $ctrl.legend || ('UI_REMOVEROW' | translate) }}\" popover-is-open=$ctrl.isOpen popover-trigger=\"'click outsideClick'\" ng-hide=$ctrl.model.$isEditing><span ng-show=$ctrl.showIcon class={{::$ctrl.icon}}></span> <span ng-show=$ctrl.showCaption>{{:: $ctrl.caption || ('CAPTION_REMOVE' | translate) }}</span></button>");
        $templateCache.put("tbRemoveButtonPopover.tpl.html", "<div class=tubular-remove-popover><button ng-click=$ctrl.delete() class=\"btn btn-danger btn-xs\">{{:: $ctrl.caption || ('CAPTION_REMOVE' | translate) }}</button> &nbsp; <button ng-click=\"$ctrl.isOpen = false;\" class=\"btn btn-default btn-xs\">{{:: $ctrl.cancelCaption || ('CAPTION_CANCEL' | translate) }}</button></div>");
        $templateCache.put("tbSaveButton.tpl.html", "<div ng-show=model.$isEditing><button ng-click=save() class=\"btn btn-default {{:: saveCss || '' }}\" ng-disabled=!model.$valid()>{{:: saveCaption || ('CAPTION_SAVE' | translate) }}</button> <button ng-click=cancel() class=\"btn {{:: cancelCss || 'btn-default' }}\">{{:: cancelCaption || ('CAPTION_CANCEL' | translate) }}</button></div>");
        $templateCache.put("tbTextSearch.tpl.html", "<div class=tubular-grid-search><div class=\"input-group input-group-sm\"><span class=input-group-addon><i class=\"fa fa-search\"></i> </span><input type=search name=tbTextSearchInput class=form-control placeholder=\"{{:: $ctrl.placeholder || ('UI_SEARCH' | translate) }}\" maxlength=20 ng-model=$ctrl.$component.search.Text ng-model-options=\"{ debounce: 300 }\"> <span id=tb-text-search-reset-panel class=input-group-btn ng-show=\"$ctrl.$component.search.Text.length > 0\"><button id=tb-text-search-reset-button class=\"btn btn-default\" uib-tooltip=\"{{'CAPTION_CLEAR' | translate}}\" ng-click=\"$ctrl.$component.search.Text = ''\"><i class=\"fa fa-times-circle\"></i></button></span></div></div>");
        $templateCache.put("tbColumnDateTimeFilter.tpl.html", "<div class=tubular-column-menu><button class=\"btn btn-xs btn-default btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=bottom popover-title={{$ctrl.filterTitle}} popover-is-open=$ctrl.isOpen popover-trigger=\"'outsideClick'\" ng-class=\"{ 'btn-success': $ctrl.filter.HasFilter }\"><i class=\"fa fa-filter\"></i></button></div>");
        $templateCache.put("tbColumnFilter.tpl.html", "<div class=tubular-column-menu><button class=\"btn btn-xs btn-default btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=bottom popover-title={{$ctrl.filterTitle}} popover-is-open=$ctrl.isOpen popover-trigger=\"'click outsideClick'\" ng-class=\"{ 'btn-success': $ctrl.filter.HasFilter }\"><i class=\"fa fa-filter\"></i></button></div>");
        $templateCache.put("tbColumnFilterPopover.tpl.html", "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=form-control ng-options=\"key as value for (key , value) in $ctrl.filterOperators\" ng-model=$ctrl.filter.Operator ng-hide=\"$ctrl.dataType == 'boolean' || $ctrl.onlyContains\"></select>&nbsp; <input class=form-control type=search ng-model=$ctrl.filter.Text autofocus ng-keypress=$ctrl.checkEvent($event) ng-hide=\"$ctrl.dataType == 'boolean'\" placeholder=\"{{'CAPTION_VALUE' | translate}}\" ng-disabled=\"$ctrl.filter.Operator == 'None'\"><div class=text-center ng-show=\"$ctrl.dataType == 'boolean'\"><button type=button class=\"btn btn-default btn-md\" ng-disabled=\"$ctrl.filter.Text === true\" ng-click=\"$ctrl.filter.Text = true; $ctrl.filter.Operator = 'Equals';\"><i class=\"fa fa-check\"></i></button>&nbsp; <button type=button class=\"btn btn-default btn-md\" ng-disabled=\"$ctrl.filter.Text === false\" ng-click=\"$ctrl.filter.Text = false; $ctrl.filter.Operator = 'Equals';\"><i class=\"fa fa-times\"></i></button></div><input type=search class=form-control ng-model=$ctrl.filter.Argument[0] ng-keypress=$ctrl.checkEvent($event) ng-show=\"$ctrl.filter.Operator == 'Between'\"><hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
        $templateCache.put("tbColumnOptionsFilter.tpl.html", "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=\"form-control checkbox-list\" ng-options=\"item.Key as item.Label for item in $ctrl.optionsItems\" ng-model=$ctrl.filter.Argument multiple ng-disabled=\"$ctrl.dataIsLoaded == false\"></select>&nbsp;<hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
        $templateCache.put("tbColumnSelector.tpl.html", "<button class=\"btn btn-sm btn-default\" ng-click=$ctrl.openColumnsSelector() ng-bind=\"'CAPTION_SELECTCOLUMNS' | translate\"></button>");
        $templateCache.put("tbColumnSelectorDialog.tpl.html", "<div class=modal-header><h3 class=modal-title ng-bind=\"'CAPTION_SELECTCOLUMNS' | translate\"></h3></div><div class=modal-body><table class=\"table table-bordered table-responsive table-striped table-hover table-condensed\"><thead><tr><th>Visible?</th><th>Name</th></tr></thead><tbody><tr ng-repeat=\"col in Model\"><td><input type=checkbox ng-model=col.Visible ng-disabled=\"col.Visible && isInvalid()\"></td><td ng-bind=col.Label></td></tr></tbody></table></div><div class=modal-footer><button class=\"btn btn-warning\" ng-click=closePopup() ng-bind=\"'CAPTION_CLOSE' | translate\"></button></div>");
        $templateCache.put("tbCellTemplate.tpl.html", "<td ng-transclude ng-show=column.Visible data-label={{::column.Label}} style=height:auto></td>");
        $templateCache.put("tbColumnDateTimeFilterPopoverBs.tpl.html", "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=form-control ng-options=\"key as value for (key , value) in $ctrl.filterOperators\" ng-model=$ctrl.filter.Operator ng-hide=\"$ctrl.dataType == 'boolean'\"></select><div class=input-group><input class=form-control uib-datepicker-popup=MM/dd/yyyy ng-model=$ctrl.filter.Text autofocus ng-keypress=$ctrl.checkEvent($event) placeholder=\"{{'CAPTION_VALUE' | translate}}\" ng-disabled=\"$ctrl.filter.Operator == 'None'\" is-open=$ctrl.dateOpen> <span class=input-group-btn><button type=button class=\"btn btn-default\" ng-click=\"$ctrl.dateOpen = !$ctrl.dateOpen\"><i class=\"fa fa-calendar\"></i></button></span></div><hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
        $templateCache.put("tbColumnDateTimeFilterPopoverHtml5.tpl.html", "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=form-control ng-options=\"key as value for (key , value) in $ctrl.filterOperators\" ng-model=$ctrl.filter.Operator ng-hide=\"$ctrl.dataType == 'boolean'\"></select><input class=form-control type=date ng-model=$ctrl.filter.Text autofocus ng-keypress=$ctrl.checkEvent($event) placeholder=\"{{'CAPTION_VALUE' | translate}}\" ng-disabled=\"$ctrl.filter.Operator == 'None'\"> <input type=date class=form-control ng-model=$ctrl.filter.Argument[0] ng-keypress=$ctrl.checkEvent($event) ng-show=\"$ctrl.filter.Operator == 'Between'\"><hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
        $templateCache.put("tbColumnDefinitions.tpl.html", "<thead><tr ng-transclude></tr></thead>");
        $templateCache.put("tbColumnFilterButtons.tpl.html", "<div class=text-right><button class=\"btn btn-sm btn-success\" ng-click=$ctrl.currentFilter.applyFilter() ng-disabled=\"$ctrl.currentFilter.filter.Operator == 'None'\" ng-bind=\"'CAPTION_APPLY' | translate\"></button>&nbsp; <button class=\"btn btn-sm btn-danger\" ng-click=$ctrl.currentFilter.clearFilter() ng-bind=\"'CAPTION_CLEAR' | translate\"></button></div>");
        $templateCache.put("tbColumnHeader.tpl.html", "<span><a title=\"Click to sort. Press Ctrl to sort by multiple columns\" class=column-header href ng-click=sortColumn($event)><span class=column-header-default>{{ $parent.column.Label }}</span><ng-transclude></ng-transclude></a><i class=\"fa sort-icon\" ng-class=\"{'fa-long-arrow-up': $parent.column.SortDirection == 'Ascending', 'fa-long-arrow-down': $parent.column.SortDirection == 'Descending'}\">&nbsp;</i></span>");
        $templateCache.put("tbFootSet.tpl.html", "<tfoot ng-transclude></tfoot>");
        $templateCache.put("tbGrid.tpl.html", "<div><div class=tubular-overlay ng-show=\"$ctrl.showLoading && $ctrl.currentRequest != null\"><div><div class=\"fa fa-refresh fa-2x fa-spin\"></div></div></div><ng-transclude></ng-transclude></div>");
        $templateCache.put("tbGridTable.tpl.html", "<table ng-transclude class=\"table tubular-grid-table\"></table>");
        $templateCache.put("tbRowSet.tpl.html", "<tbody ng-transclude></tbody>");
        $templateCache.put("tbRowTemplate.tpl.html", "<tr ng-transclude></tr>");
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('tubular.models')
    /**
     * @ngdoc factory
     * @name tubularColumn
     * @module tubular.models
     *
     * @description
     * The `tubularColumn` factory is the base to generate a column model to use with `tbGrid`.
     */
    .factory('tubularColumn', ['dataTypes', function (dataTypes) {
        return function (columnName, options) {
            options = options || {};
            options.DataType = options.DataType || 'string';

            if (Object.values(dataTypes).indexOf(options.DataType) < 0) {
                throw 'Invalid data type: \'' + options.DataType + '\' for column \'' + columnName + '\'';
            }

            var obj = {
                Label: options.Label || (columnName || '').replace(/([a-z])([A-Z])/g, '$1 $2'),
                Name: columnName,
                Sortable: options.Sortable,
                SortOrder: parseInt(options.SortOrder) || -1,
                SortDirection: function () {
                    if (angular.isUndefined(options.SortDirection)) {
                        return 'None';
                    }

                    if (options.SortDirection.toLowerCase().indexOf('asc') === 0) {
                        return 'Ascending';
                    }

                    if (options.SortDirection.toLowerCase().indexOf('desc') === 0) {
                        return 'Descending';
                    }

                    return 'None';
                }(),
                IsKey: angular.isDefined(options.IsKey) ? options.IsKey : false,
                Searchable: angular.isDefined(options.Searchable) ? options.Searchable : false,
                Visible: options.Visible === 'false' ? false : true,
                Filter: null,
                DataType: options.DataType || 'string',
                Aggregate: options.Aggregate || 'none'
            };

            return obj;
        };
    }]);
})(angular);

(function (angular, moment) {
    'use strict';

    angular.module('tubular.models')
    /**
     * @ngdoc factory
     * @name tubularModel
     * @module tubular.models
     *
     * @description
     * The `tubularModel` factory is the base to generate a row model to use with `tbGrid` and `tbForm`.
     */
    .factory('tubularModel', ['dataTypes', function (dataTypes) {
        return function ($ctrl, data) {
            var obj = {
                $hasChanges: function $hasChanges() {
                    return obj.$fields.some(function (k) {
                        return angular.isDefined(obj.$original[k]) && obj[k] !== obj.$original[k];
                    });
                },
                $isEditing: false,
                $isNew: false,
                $key: '',
                $fields: [],
                $state: {},
                $original: {},
                $valid: function $valid() {
                    return Object.keys(obj.$state).filter(function (k) {
                        return angular.isDefined(obj.$state[k]) && !obj.$state[k].$valid();
                    }).length == 0;
                },
                $addField: function $addField(key, value, ignoreOriginal) {
                    if (obj.$fields.indexOf(key) >= 0) {
                        return;
                    }

                    obj[key] = value;
                    obj.$fields.push(key);
                    obj.$original[key] = ignoreOriginal ? undefined : value;
                },
                resetOriginal: function resetOriginal() {
                    return angular.forEach(obj.$original, function (v, k) {
                        return obj.$original[k] = obj[k];
                    });
                },
                revertChanges: function revertChanges() {
                    angular.forEach(obj, function (v, k) {
                        if (angular.isDefined(obj.$original[k])) {
                            obj[k] = obj.$original[k];
                        }
                    });

                    obj.$isEditing = false;
                }
            };

            if (!angular.isArray(data)) {
                angular.forEach(data, function (v, k) {
                    return obj.$addField(k, v);
                });
            }

            if (angular.isDefined($ctrl.columns)) {
                angular.forEach($ctrl.columns, function (col, key) {
                    var value = angular.isDefined(data[key]) ? data[key] : data[col.Name];

                    if (col.DataType === dataTypes.DATE || col.DataType === dataTypes.DATE_TIME || col.DataType === dataTypes.DATE_TIME_UTC) {
                        if (value === null || value === '' || moment(value).year() <= 1900) value = '';else value = col.DataType === dataTypes.DATE_TIME_UTC ? moment.utc(value) : moment(value);
                    }

                    obj.$addField(col.Name, value);

                    if (col.IsKey) {
                        obj.$key += value + ',';
                    }
                });
            }

            if (obj.$key.length > 1) {
                obj.$key = obj.$key.substring(0, obj.$key.length - 1);
            }

            return obj;
        };
    }]);
})(angular, moment);

(function (angular) {
    'use strict';

    var tbSimpleEditorCtrl = ['tubularEditorService', '$scope', 'translateFilter', 'filterFilter', function (tubular, $scope, translateFilter, filterFilter) {
        var $ctrl = this;

        $ctrl.validate = function () {
            if ($ctrl.regex && $ctrl.value) {
                var patt = new RegExp($ctrl.regex);

                if (patt.test($ctrl.value) === false) {
                    $ctrl.$valid = false;
                    $ctrl.state.$errors = [$ctrl.regexErrorMessage || translateFilter('EDITOR_REGEX_DOESNT_MATCH')];
                    return;
                }
            }

            if ($ctrl.match) {
                if ($ctrl.value !== $ctrl.$component.model[$ctrl.match]) {
                    var label = filterFilter($ctrl.$component.fields, { name: $ctrl.match }, true)[0].label;
                    $ctrl.$valid = false;
                    $ctrl.state.$errors = [translateFilter('EDITOR_MATCH', label)];
                    return;
                }
            }

            if ($ctrl.min && $ctrl.value) {
                if ($ctrl.value.length < parseInt($ctrl.min)) {
                    $ctrl.$valid = false;
                    $ctrl.state.$errors = [translateFilter('EDITOR_MIN_CHARS', $ctrl.min)];
                    return;
                }
            }

            if ($ctrl.max && $ctrl.value) {
                if ($ctrl.value.length > parseInt($ctrl.max)) {
                    $ctrl.$valid = false;
                    $ctrl.state.$errors = [translateFilter('EDITOR_MAX_CHARS', $ctrl.max)];
                    return;
                }
            }
        };

        $ctrl.$onInit = function () {
            return tubular.setupScope($scope, null, $ctrl, false);
        };
    }];

    angular.module('tubular.directives')
    /**
     * @ngdoc component
     * @name tbSimpleEditor
     * @module tubular.directives
     *
     * @description
     * The `tbSimpleEditor` component is the basic input to show in a grid or form.
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {string} editorType Set what HTML input type should display.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} placeholder Set the placeholder text.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {boolean} readOnly Set if the field is read-only.
     * @param {number} min Set the minimum characters.
     * @param {number} max Set the maximum characters.
     * @param {string} regex Set the regex validation text.
     * @param {string} regexErrorMessage Set the regex validation error message.
     * @param {string} match Set the field name to match values.
     * @param {string} defaultValue Set the default value.
     */
    .component('tbSimpleEditor', {
        templateUrl: 'tbSimpleEditor.tpl.html',
        bindings: {
            regex: '@?',
            regexErrorMessage: '@?',
            value: '=?',
            isEditing: '=?',
            editorType: '@',
            showLabel: '=?',
            label: '@?',
            required: '=?',
            min: '=?',
            max: '=?',
            name: '@',
            placeholder: '@?',
            readOnly: '=?',
            help: '@?',
            defaultValue: '@?',
            match: '@?'
        },
        controller: tbSimpleEditorCtrl
    });
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives')
    /**
     * @ngdoc directive
     * @name tbForm
     * @module tubular.directives
     * @restrict E
     *
     * @description
     * The `tbForm` directive is the base to create any form powered by Tubular. Define
     * `modelKey` to auto-load a record. The `serverSaveUrl` can be used to create a new or update
     * an existing record.
     *
     * Please don't bind a controller directly to the `tbForm`, Angular will throw an exception. If you want
     * to extend the form behavior put a controller in a upper node like a div.
     *
     * The `save` method can be forced to update a model against the REST service, otherwise if the Model
     * doesn't detect any change will ignore the save call.
     *
     * @param {string} serverUrl Set the HTTP URL where the data comes.
     * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
     * @param {string} serverSaveMethod Set HTTP Method to save data.
     * @param {object} model The object model to show in the form.
     * @param {string} modelKey Defines the fields to use like Keys.
     * @param {string} formName Defines the form name.
     * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
     */
    .directive('tbForm', [function () {
        return {
            templateUrl: 'tbForm.tpl.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                model: '=?',
                serverUrl: '@',
                serverSaveUrl: '@',
                serverSaveMethod: '@',
                modelKey: '@?',
                requireAuthentication: '=?',
                name: '@?formName',
                onSave: '=?',
                onError: '=?'
            },
            controller: 'tbFormController',
            compile: function compile() {
                return { post: function post(scope) {
                        return scope.finishDefinition();
                    } };
            }
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    var tbFormCounter = 0;

    angular.module('tubular.directives').controller('tbFormController', ['$scope', '$timeout', '$element', 'tubularModel', '$http', 'modelSaver', function ($scope, $timeout, $element, TubularModel, $http, modelSaver) {
        // we need this to find the parent of a field
        $scope.tubularDirective = 'tubular-form';
        $scope.fields = [];

        function getUrlWithKey() {
            var urlData = $scope.serverUrl.split('?');
            var getUrl = urlData[0] + $scope.modelKey;

            if (urlData.length > 1) {
                getUrl += '?' + urlData[1];
            }

            return getUrl;
        }

        var $ctrl = this;

        $ctrl.serverSaveMethod = $scope.serverSaveMethod || 'POST';
        $ctrl.name = $scope.name || 'tbForm' + tbFormCounter++;

        // This method is meant to provide a reference to the Angular Form
        // so we can get information about: $pristine, $dirty, $submitted, etc.
        $scope.getFormScope = function () {
            return $scope[$element.attr('name')];
        };

        // Setup require authentication
        $ctrl.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;

        $scope.cloneModel = function (model) {
            var data = {};

            angular.forEach(model, function (value, key) {
                if (key[0] !== '$') {
                    data[key] = value;
                }
            });

            $scope.model = new TubularModel($scope, data);
            $ctrl.bindFields();
        };

        $ctrl.bindFields = function () {
            return angular.forEach($scope.fields, function (field) {
                return field.bindScope();
            });
        };

        $ctrl.retrieveData = function () {
            if (angular.isDefined($scope.serverUrl)) {
                $http.get(getUrlWithKey(), { requireAuthentication: $ctrl.requireAuthentication }).then(function (response) {
                    $scope.model = new TubularModel($scope, response.data);
                    $ctrl.bindFields();
                }, function (error) {
                    return $scope.$emit('tbForm_OnConnectionError', error);
                });

                return;
            }

            if (angular.isUndefined($scope.model)) {
                $scope.model = new TubularModel($scope, {});
            }

            $ctrl.bindFields();
        };

        $scope.save = function (forceUpdate, keepData) {
            if (!$scope.model.$valid()) {
                return;
            }

            if (!forceUpdate && !$scope.model.$isNew && !$scope.model.$hasChanges()) {
                $scope.$emit('tbForm_OnSavingNoChanges', $scope);
                return;
            }

            $scope.model.$isLoading = true;

            $scope.currentRequest = modelSaver.save($scope.serverSaveUrl, $scope.serverSaveMethod, $scope.model).then(function (response) {
                if (angular.isDefined($scope.onSave)) {
                    $scope.onSave(response);
                }

                $scope.$emit('tbForm_OnSuccessfulSave', response.data, $scope);

                if (!keepData) {
                    $scope.clear();
                }

                var formScope = $scope.getFormScope();

                if (formScope) {
                    formScope.$setPristine();
                }
            }, function (error) {
                if (angular.isDefined($scope.onError)) {
                    $scope.onError(error);
                }

                $scope.$emit('tbForm_OnConnectionError', error, $scope);
            }).then(function () {
                $scope.model.$isLoading = false;
                $scope.currentRequest = null;
            });
        };

        // alias to save
        $scope.update = $scope.save;

        $scope.create = function () {
            $scope.model.$isNew = true;
            $scope.save();
        };

        $scope.cancel = function () {
            $scope.$emit('tbForm_OnCancel', $scope.model);
            $scope.clear();
        };

        $scope.clear = function () {
            angular.forEach($scope.fields, function (field) {
                if (field.resetEditor) {
                    field.resetEditor();
                } else {
                    field.value = field.defaultValue;

                    if (field.dateValue) {
                        field.dateValue = field.defaultValue;
                    }
                }
            });
        };

        $scope.finishDefinition = function () {
            var timer = $timeout(function () {
                $ctrl.retrieveData();

                if ($element.find('input').length > 0) {
                    $element.find('input')[0].focus();
                }
            }, 0);

            $scope.$emit('tbForm_OnGreetParentController', { controller: $ctrl, scope: $scope });

            $scope.$on('$destroy', function () {
                return $timeout.cancel(timer);
            });
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives')

    /**
    * @ngdoc component
    * @name tbTextSearch
    * @module tubular.directives
    *
    * @description
    * The `tbTextSearch` is visual component to enable free-text search in a grid.
    *
    * @param {number} minChars How many chars before to search, default 3.
    * @param {string} placeholder The placeholder text, defaults `UI_SEARCH` i18n resource.
    */
    .component('tbTextSearch', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbTextSearch.tpl.html',
        bindings: {
            minChars: '@?',
            placeholder: '@'
        },
        controller: 'tbTextSearchController'
    });
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives').controller('tbTextSearchController', ['$scope', function ($scope) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            $ctrl.minChars = $ctrl.minChars || 3;
            $ctrl.lastSearch = $ctrl.$component.search.Text;
        };

        $scope.$watch('$ctrl.$component.search.Text', function (val, prev) {
            if (angular.isUndefined(val) || val === prev) {
                return;
            }

            $ctrl.$component.search.Text = val;

            if ($ctrl.lastSearch && val === '') {
                search('None');
                return;
            }

            if (val === '' || val.length < $ctrl.minChars || val === $ctrl.lastSearch) {
                return;
            }

            $ctrl.lastSearch = val;
            search('Auto');
        });

        function search(operator) {
            $ctrl.$component.saveSearch();
            $ctrl.$component.search.Operator = operator;
            $ctrl.$component.retrieveData();
        }
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives')
    /**
     * @ngdoc component
     * @name tbGrid
     *
     * @description
     * The `tbGrid` directive is the base to create any grid. This is the root node where you should start
     * designing your grid. Don't need to add a `controller`.
     *
     * @param {array} gridSource Set the local data source.
     * @param {string} serverUrl Set the HTTP URL where the data comes.
     * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
     * @param {string} serverDeleteUrl Set the HTTP URL where the data will be saved.
     * @param {string} serverSaveMethod Set HTTP Method to save data.
     * @param {int} pageSize Define how many records to show in a page, default 20.
     * @param {function} onBeforeGetData Callback to execute before to get data from service.
     * @param {string} requestMethod Set HTTP Method to get data.
     * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
     * @param {string} gridName Grid's name, used to store metainfo in localstorage.
     * @param {string} editorMode Define if grid is read-only or it has editors (inline or popup).
     * @param {bool} showLoading Set if an overlay will show when it's loading data, default true.
     * @param {bool} autoRefresh Set if the grid refresh after any insertion or update, default true.
     * @param {bool} savePage Set if the grid autosave current page, default true.
     * @param {bool} savePageSize Set if the grid autosave page size, default true.
     * @param {bool} saveSearchText Set if the grid autosave search text, default true.
     * @param {bool} localPaging Set if the paging occurs in client side, default false.
     */
    .component('tbGrid', {
        templateUrl: 'tbGrid.tpl.html',
        transclude: true,
        bindings: {
            gridDatasource: '=?',
            serverUrl: '@',
            serverSaveUrl: '@',
            serverDeleteUrl: '@',
            serverSaveMethod: '@',
            pageSize: '=?',
            onBeforeGetData: '=?',
            onRowUpdated: '=?',
            onRowAdded: '=?',
            requestMethod: '@',
            requireAuthentication: '@?',
            name: '@?gridName',
            editorMode: '@?',
            showLoading: '=?',
            autoRefresh: '=?',
            savePage: '=?',
            savePageSize: '=?',
            saveSearchText: '=?',
            localPaging: '=?'
        },
        controller: 'tbGridController'
    });
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives').controller('tbGridController', ['$scope', 'tubularPopupService', 'tubularModel', '$http', 'tubularConfig', '$window', 'localPager', 'modelSaver', function ($scope, tubularPopupService, TubularModel, $http, tubularConfig, $window, localPager, modelSaver) {
        var $ctrl = this;
        var prefix = tubularConfig.localStorage.prefix();
        var storage = $window.localStorage;

        $ctrl.$onInit = function () {
            $ctrl.isInLocalMode = angular.isDefined($ctrl.gridDatasource);

            if ($ctrl.isInLocalMode && angular.isDefined($ctrl.serverUrl)) throw 'Cannot define gridDatasource and serverUrl at the same time.';

            $ctrl.tubularDirective = 'tubular-grid';

            $ctrl.name = $ctrl.name || 'tbgrid';
            $ctrl.rows = [];
            $ctrl.columns = [];

            $ctrl.savePage = angular.isUndefined($ctrl.savePage) ? true : $ctrl.savePage;
            $ctrl.currentPage = $ctrl.savePage ? parseInt(storage.getItem(prefix + $ctrl.name + '_page')) || 1 : 1;
            $ctrl.savePageSize = angular.isUndefined($ctrl.savePageSize) ? true : $ctrl.savePageSize;
            $ctrl.pageSize = $ctrl.pageSize || 20;
            $ctrl.saveSearchText = angular.isUndefined($ctrl.saveSearchText) ? true : $ctrl.saveSearchText;
            $ctrl.totalPages = 0;
            $ctrl.totalRecordCount = 0;
            $ctrl.filteredRecordCount = 0;
            $ctrl.requestedPage = $ctrl.currentPage;
            $ctrl.hasColumnsDefinitions = false;
            $ctrl.requestCounter = 0;
            $ctrl.requestMethod = $ctrl.requestMethod || 'POST';
            $ctrl.serverSaveMethod = $ctrl.serverSaveMethod || 'POST';
            $ctrl.currentRequest = null;
            $ctrl.autoSearch = $ctrl.saveSearchText ? storage.getItem(prefix + $ctrl.name + '_search') || '' : '';
            $ctrl.search = {
                Text: $ctrl.autoSearch,
                Operator: $ctrl.autoSearch === '' ? 'None' : 'Auto'
            };

            $ctrl.isEmpty = false;
            $ctrl.tempRow = new TubularModel($ctrl, {});
            $ctrl.editorMode = $ctrl.editorMode || 'none';
            $ctrl.canSaveState = false;
            $ctrl.showLoading = angular.isUndefined($ctrl.showLoading) ? true : $ctrl.showLoading;
            $ctrl.autoRefresh = angular.isUndefined($ctrl.autoRefresh) ? true : $ctrl.autoRefresh;
            $ctrl.serverDeleteUrl = $ctrl.serverDeleteUrl || $ctrl.serverSaveUrl;

            // Emit a welcome message
            $scope.$emit('tbGrid_OnGreetParentController', $ctrl);
        };

        $scope.columnWatcher = function () {
            if ($ctrl.hasColumnsDefinitions === false || $ctrl.canSaveState === false) {
                return;
            }

            storage.setItem(prefix + $ctrl.name + '_columns', angular.toJson($ctrl.columns));
        };

        $scope.$watch('$ctrl.columns', $scope.columnWatcher, true);

        $scope.serverUrlWatcher = function (newVal, prevVal) {
            if ($ctrl.hasColumnsDefinitions === false || $ctrl.currentRequest || newVal === prevVal || $ctrl.isInLocalMode) {
                return;
            }

            $ctrl.retrieveData();
        };

        $scope.$watch('$ctrl.serverUrl', $scope.serverUrlWatcher);

        $scope.gridDatasourceWatcher = function (newVal, prevVal) {
            if ($ctrl.hasColumnsDefinitions === false || $ctrl.currentRequest || newVal === prevVal || angular.isDefined($ctrl.serverUrl)) {
                return;
            }

            $ctrl.retrieveData();
        };

        $scope.$watch('$ctrl.gridDatasource', $scope.gridDatasourceWatcher);

        $scope.hasColumnsDefinitionsWatcher = function (newVal) {
            if (newVal !== true) {
                return;
            }

            $ctrl.retrieveData();
        };

        $scope.$watch('$ctrl.hasColumnsDefinitions', $scope.hasColumnsDefinitionsWatcher);

        $scope.pageSizeWatcher = function () {
            if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                if ($ctrl.savePageSize) {
                    storage.setItem(prefix + $ctrl.name + '_pageSize', $ctrl.pageSize);
                }

                $ctrl.retrieveData();
            }
        };

        $scope.$watch('$ctrl.pageSize', $scope.pageSizeWatcher);

        $scope.requestedPageWatcher = function () {
            if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                $ctrl.retrieveData();
            }
        };

        $scope.$watch('$ctrl.requestedPage', $scope.requestedPageWatcher);

        $ctrl.saveSearch = function () {
            if (!$ctrl.saveSearchText) {
                return;
            }

            if ($ctrl.search.Text === '') {
                storage.removeItem(prefix + $ctrl.name + '_search');
            } else {
                storage.setItem(prefix + $ctrl.name + '_search', $ctrl.search.Text);
            }
        };

        $ctrl.addColumn = function (item) {
            if (item.Name == null) {
                return;
            }

            if ($ctrl.hasColumnsDefinitions !== false) {
                throw 'Cannot define more columns. Column definitions have been sealed';
            }

            $ctrl.columns.push(item);
        };

        $ctrl.newRow = function (template, popup, size, data) {
            $ctrl.tempRow = new TubularModel($ctrl, data || {});
            $ctrl.tempRow.$isNew = true;
            $ctrl.tempRow.$isEditing = true;

            if (angular.isDefined(template) && angular.isDefined(popup) && popup) {
                tubularPopupService.openDialog(template, $ctrl.tempRow, $ctrl, size);
            }
        };

        $ctrl.deleteRow = function (row) {
            var urlparts = $ctrl.serverDeleteUrl.split('?');
            var url = urlparts[0] + '/' + row.$key;

            if (urlparts.length > 1) {
                url += '?' + urlparts[1];
            }

            $ctrl.currentRequest = $http.delete(url, {
                requireAuthentication: getRequiredAuthentication()
            }).then(function (response) {
                return $scope.$emit('tbGrid_OnRemove', response.data);
            }, function (error) {
                return $scope.$emit('tbGrid_OnConnectionError', error);
            }).then(function () {
                $ctrl.currentRequest = null;
                $ctrl.retrieveData();
            });
        };

        function getRequiredAuthentication() {
            return $ctrl.requireAuthentication ? $ctrl.requireAuthentication === 'true' : true;
        }

        $ctrl.remoteSave = function (row, forceUpdate) {
            if (!forceUpdate && !row.$isNew && !row.$hasChanges()) {
                row.$isEditing = false;
                return null;
            }

            $ctrl.currentRequest = modelSaver.save($ctrl.serverSaveUrl, $ctrl.serverSaveMethod, row).then(function (data) {
                $scope.$emit('tbForm_OnSuccessfulSave', data);
                row.$isLoading = false;
                row.$isEditing = false;
                $ctrl.currentRequest = null;
                $ctrl.retrieveData();

                return data;
            }, function (error) {
                $scope.$emit('tbForm_OnConnectionError', error);
                row.$isLoading = false;
                $ctrl.currentRequest = null;

                return error;
            });

            return $ctrl.currentRequest;
        };

        $ctrl.saveRow = function (row, forceUpdate) {
            if (!$ctrl.isInLocalMode) {
                return $ctrl.remoteSave(row, forceUpdate);
            }

            if (row.$isNew) {

                if (angular.isUndefined($ctrl.onRowAdded)) {
                    throw 'Define a Save Function using "onRowAdded".';
                }

                $ctrl.onRowAdded(row);
            } else {
                if (angular.isUndefined($ctrl.onRowUpdated)) {
                    throw 'Define a Save Function using "onRowUpdated".';
                }

                $ctrl.onRowUpdated(row, forceUpdate);
            }
        };

        $ctrl.verifyColumns = function () {
            var columns = angular.fromJson(storage.getItem(prefix + $ctrl.name + '_columns'));
            if (columns == null || columns === '') {
                // Nothing in settings, saving initial state
                storage.setItem(prefix + $ctrl.name + '_columns', angular.toJson($ctrl.columns));
                return;
            }

            angular.forEach(columns, function (column) {
                var filtered = $ctrl.columns.filter(function (el) {
                    return el.Name === column.Name;
                });

                if (filtered.length === 0) {
                    return;
                }

                var current = filtered[0];
                // Updates visibility by now
                current.Visible = column.Visible;

                // Update sorting
                if ($ctrl.requestCounter < 1) {
                    current.SortOrder = column.SortOrder;
                    current.SortDirection = column.SortDirection;
                }

                // Update Filters
                if (current.Filter != null && current.Filter.Text != null) {
                    return;
                }

                if (column.Filter != null && column.Filter.Text != null && column.Filter.Operator !== 'None') {
                    current.Filter = column.Filter;
                }
            });
        };

        $ctrl.getRequestObject = function (skip) {
            if (skip === -1) {
                skip = ($ctrl.requestedPage - 1) * $ctrl.pageSize;
                if (skip < 0) skip = 0;
            }

            if ($ctrl.isInLocalMode) {
                return {
                    requireAuthentication: getRequiredAuthentication(),
                    data: {
                        Count: $ctrl.requestCounter,
                        Columns: $ctrl.columns,
                        Skip: skip,
                        Take: parseInt($ctrl.pageSize),
                        Search: $ctrl.search,
                        TimezoneOffset: new Date().getTimezoneOffset()
                    }
                };
            }

            return {
                url: $ctrl.serverUrl,
                method: $ctrl.requestMethod || 'POST',
                requireAuthentication: getRequiredAuthentication(),
                data: {
                    Count: $ctrl.requestCounter,
                    Columns: $ctrl.columns,
                    Skip: skip,
                    Take: parseInt($ctrl.pageSize),
                    Search: $ctrl.search,
                    TimezoneOffset: new Date().getTimezoneOffset()
                }
            };
        };

        $ctrl.retrieveLocalData = function (request) {
            if (angular.isArray($ctrl.gridDatasource)) {
                $ctrl.currentRequest = localPager.process(request, $ctrl.gridDatasource).then($ctrl.processPayload, $ctrl.processError).then(function () {
                    return $ctrl.currentRequest = null;
                });
            }
        };

        $ctrl.retrieveRemoteDataServerside = function (request) {
            $ctrl.currentRequest = $http(request).then($ctrl.processPayload, $ctrl.processError).then(function () {
                return $ctrl.currentRequest = null;
            });
        };

        $ctrl.retrieveRemoteDataClientside = function (request) {
            $ctrl.currentRequest = $http(request).then(function (response) {
                return localPager.process(request, response.data);
            }, $ctrl.processError).then($ctrl.processPayload, $ctrl.processError).then(function () {
                return $ctrl.currentRequest = null;
            });
        };

        $ctrl.retrieveData = function () {
            // If the ServerUrl is empty skip data load
            if (!$ctrl.isInLocalMode && !$ctrl.serverUrl || $ctrl.currentRequest !== null) {
                return;
            }

            if ($ctrl.columns.length === 0) {
                throw 'You need to define at least one column';
            }

            $ctrl.canSaveState = true;
            $ctrl.verifyColumns();

            if ($ctrl.savePageSize) {
                $ctrl.pageSize = parseInt(storage.getItem(prefix + $ctrl.name + '_pageSize')) || $ctrl.pageSize;
            }

            $ctrl.pageSize = $ctrl.pageSize < 10 ? 20 : $ctrl.pageSize; // default

            var newPages = Math.ceil($ctrl.totalRecordCount / $ctrl.pageSize);
            if ($ctrl.requestedPage > newPages) $ctrl.requestedPage = newPages;

            var request = $ctrl.getRequestObject(-1);

            if (angular.isDefined($ctrl.onBeforeGetData)) {
                $ctrl.onBeforeGetData(request);
            }

            $scope.$emit('tbGrid_OnBeforeRequest', request, $ctrl);

            if ($ctrl.isInLocalMode) {
                $ctrl.retrieveLocalData(request);
            } else if ($ctrl.localPaging) {
                $ctrl.retrieveRemoteDataClientside(request);
            } else {
                $ctrl.retrieveRemoteDataServerside(request);
            }
        };

        $ctrl.processError = function (error) {
            $ctrl.requestedPage = $ctrl.currentPage;
            $scope.$emit('tbGrid_OnConnectionError', error);
        };

        $ctrl.processPayload = function (response) {
            $ctrl.requestCounter += 1;

            if (!response || !response.data || !response.data.Payload) {
                $scope.$emit('tbGrid_OnConnectionError', {
                    statusText: 'tubularGrid(' + $ctrl.$id + '): response is invalid.',
                    status: 0
                });
                return;
            }

            var data = response.data;

            $ctrl.dataSource = data;

            $ctrl.rows = data.Payload.map(function (el) {
                var model = new TubularModel($ctrl, el);

                model.editPopup = function (template, size) {
                    tubularPopupService.openDialog(template, new TubularModel($ctrl, el), $ctrl, size);
                };

                return model;
            });

            $scope.$emit('tbGrid_OnDataLoaded', $ctrl);

            $ctrl.aggregationFunctions = data.AggregationPayload;
            $ctrl.currentPage = data.CurrentPage;
            $ctrl.totalPages = data.TotalPages;
            $ctrl.totalRecordCount = data.TotalRecordCount;
            $ctrl.filteredRecordCount = data.FilteredRecordCount;
            $ctrl.isEmpty = $ctrl.filteredRecordCount === 0;

            if ($ctrl.savePage) {
                storage.setItem(prefix + $ctrl.name + '_page', $ctrl.currentPage);
            }
        };

        $ctrl.sortColumn = function (columnName, multiple) {
            var filterColumn = $ctrl.columns.filter(function (el) {
                return el.Name === columnName;
            });

            if (filterColumn.length === 0) {
                return;
            }

            var column = filterColumn[0];

            if (column.Sortable === false) {
                return;
            }

            // need to know if it's currently sorted before we reset stuff
            var currentSortDirection = column.SortDirection;
            var toBeSortDirection = currentSortDirection === 'None' ? 'Ascending' : currentSortDirection === 'Ascending' ? 'Descending' : 'None';

            // the latest sorting takes less priority than previous sorts
            if (toBeSortDirection === 'None') {
                column.SortOrder = -1;
                column.SortDirection = 'None';
            } else {
                column.SortOrder = Number.MAX_VALUE;
                column.SortDirection = toBeSortDirection;
            }

            // if it's not a multiple sorting, remove the sorting from all other columns
            if (multiple === false) {
                angular.forEach($ctrl.columns.filter(function (col) {
                    return col.Name !== columnName;
                }), function (col) {
                    col.SortOrder = -1;
                    col.SortDirection = 'None';
                });
            }

            // take the columns that actually need to be sorted in order to re-index them
            var currentlySortedColumns = $ctrl.columns.filter(function (col) {
                return col.SortOrder > 0;
            });

            // re-index the sort order
            currentlySortedColumns.sort(function (a, b) {
                return a.SortOrder === b.SortOrder ? 0 : a.SortOrder > b.SortOrder;
            });

            angular.forEach(currentlySortedColumns, function (col, index) {
                return col.SortOrder = index + 1;
            });

            $scope.$broadcast('tbGrid_OnColumnSorted');
            $ctrl.retrieveData();
        };

        $ctrl.getFullDataSource = function () {
            var request = $ctrl.getRequestObject(0);
            request.data.Take = -1;
            request.data.Search = {
                Text: '',
                Operator: 'None'
            };

            $ctrl.currentRequest = $http(request).then(function (response) {
                $ctrl.currentRequest = null;
                return response.data.Payload;
            }, function (error) {
                $scope.$emit('tbGrid_OnConnectionError', error);
                $ctrl.currentRequest = null;
            });

            return $ctrl.currentRequest;
        };

        $ctrl.visibleColumns = function () {
            return $ctrl.columns.filter(function (el) {
                return el.Visible;
            }).length;
        };
    }]);
})(angular);

(function (angular, moment) {
    'use strict';

    // Fix moment serialization

    moment.fn.toJSON = function () {
        return this.isValid() ? this.format() : null;
    };

    function canUseHtml5Date() {
        var el = angular.element('<input type="date" value=":)" />');
        return el.attr('type') === 'date' && el.val() === '';
    }

    function changeValueFn($ctrl) {
        return function (val) {
            if (angular.isUndefined(val)) {
                return;
            }

            if (angular.isString(val)) {
                $ctrl.value = val === '' || moment(val).year() <= 1900 ? '' : moment(val);
            }

            if (angular.isDefined($ctrl.dateValue)) {
                return;
            }

            if (moment.isMoment($ctrl.value)) {
                var tmpDate = $ctrl.value.toObject();
                $ctrl.dateValue = new Date(tmpDate.years, tmpDate.months, tmpDate.date, tmpDate.hours, tmpDate.minutes, tmpDate.seconds);
            } else {
                // NULL value
                $ctrl.dateValue = $ctrl.value;
            }
        };
    }

    function validateDate($ctrl, translateFilter, dateFilter) {
        if ($ctrl.min) {
            if (!angular.isDate($ctrl.min)) {
                $ctrl.min = new Date($ctrl.min);
            }

            $ctrl.$valid = $ctrl.dateValue >= $ctrl.min;

            if (!$ctrl.$valid) {
                $ctrl.state.$errors = [translateFilter('EDITOR_MIN_DATE', dateFilter($ctrl.min, $ctrl.format))];
                return;
            }
        }

        if (!$ctrl.max) {
            return;
        }

        if (!angular.isDate($ctrl.max)) {
            $ctrl.max = new Date($ctrl.max);
        }

        $ctrl.$valid = $ctrl.dateValue <= $ctrl.max;

        if (!$ctrl.$valid) {
            $ctrl.state.$errors = [translateFilter('EDITOR_MAX_DATE', dateFilter($ctrl.max, $ctrl.format))];
        }
    }

    var tbNumericEditorCtrl = ['tubularEditorService', '$scope', 'translateFilter', 'dataTypes', function (tubular, $scope, translateFilter, dataTypes) {
        var $ctrl = this;

        $ctrl.validate = function () {
            if (angular.isDefined($ctrl.min) && $ctrl.min != null && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                $ctrl.$valid = $ctrl.value >= $ctrl.min;

                if (!$ctrl.$valid) {
                    $ctrl.state.$errors = [translateFilter('EDITOR_MIN_NUMBER', $ctrl.min)];
                    return;
                }
            }

            if (angular.isDefined($ctrl.max) && $ctrl.max != null && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                $ctrl.$valid = $ctrl.value <= $ctrl.max;

                if (!$ctrl.$valid) {
                    $ctrl.state.$errors = [translateFilter('EDITOR_MAX_NUMBER', $ctrl.max)];
                }
            }
        };

        $ctrl.$onInit = function () {
            $ctrl.DataType = dataTypes.NUMERIC;
            tubular.setupScope($scope, 0, $ctrl, false);
        };
    }];

    var tbDateTimeEditorCtrl = ['$scope', '$element', 'tubularEditorService', 'translateFilter', 'dateFilter', 'dataTypes', function ($scope, $element, tubular, translateFilter, dateFilter, dataTypes) {
        var $ctrl = this;

        // This could be $onChange??
        $scope.$watch(function () {
            return $ctrl.value;
        }, changeValueFn($ctrl));

        $scope.$watch(function () {
            return $ctrl.dateValue;
        }, function (val) {
            if (angular.isDefined(val)) {
                $ctrl.value = val === '' ? '' : moment(val);
            }
        });

        $ctrl.validate = function () {
            return validateDate($ctrl, translateFilter, dateFilter);
        };

        $ctrl.$onInit = function () {
            $ctrl.DataType = dataTypes.DATE_TIME;
            tubular.setupScope($scope, $ctrl.format, $ctrl);
            $ctrl.format = $ctrl.format || 'MMM D, Y';
        };
    }];

    var tbDateEditorCtrl = ['$scope', '$element', 'tubularEditorService', 'translateFilter', 'dateFilter', 'dataTypes', function ($scope, $element, tubular, translateFilter, dateFilter, dataTypes) {
        var $ctrl = this;

        $scope.$watch(function () {
            return $ctrl.value;
        }, changeValueFn($ctrl));

        $scope.$watch(function () {
            return $ctrl.dateValue;
        }, function (val) {
            if (angular.isDefined(val)) {
                $ctrl.value = val === '' ? '' : moment(val);
            }
        });

        $ctrl.validate = function () {
            return validateDate($ctrl, translateFilter, dateFilter);
        };

        $ctrl.$onInit = function () {
            $ctrl.DataType = dataTypes.DATE;
            tubular.setupScope($scope, $ctrl.format, $ctrl);
            $ctrl.format = $ctrl.format || 'MMM D, Y'; // TODO: Add hours?
        };
    }];

    var tbDropdownEditorCtrl = ['tubularEditorService', '$scope', '$http', function (tubular, $scope, $http) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            tubular.setupScope($scope, null, $ctrl);
            $ctrl.dataIsLoaded = false;
            $ctrl.selectOptions = 'd for d in $ctrl.options';

            if (angular.isDefined($ctrl.optionLabel)) {
                $ctrl.selectOptions = 'd.' + $ctrl.optionLabel + ' for d in $ctrl.options';

                if (angular.isDefined($ctrl.optionTrack)) {
                    $ctrl.selectOptions = 'd as d.' + $ctrl.optionLabel + ' for d in $ctrl.options track by d.' + $ctrl.optionTrack;
                } else if (angular.isDefined($ctrl.optionKey)) {
                    $ctrl.selectOptions = 'd.' + $ctrl.optionKey + ' as ' + $ctrl.selectOptions;
                }
            }

            if (angular.isUndefined($ctrl.optionsUrl)) {
                return;
            }

            $scope.$watch(function () {
                return $ctrl.optionsUrl;
            }, function (val, prev) {
                if (val !== prev) {
                    $ctrl.dataIsLoaded = false;
                    $ctrl.loadData();
                }
            });

            if ($ctrl.isEditing) {
                $ctrl.loadData();
            } else {
                $scope.$watch(function () {
                    return $ctrl.isEditing;
                }, function () {
                    if ($ctrl.isEditing) {
                        $ctrl.loadData();
                    }
                });
            }
        };

        $scope.updateReadonlyValue = function () {
            $ctrl.readOnlyValue = $ctrl.value;

            if (!$ctrl.value) {
                return;
            }

            if (angular.isDefined($ctrl.optionLabel) && $ctrl.options) {
                if (angular.isDefined($ctrl.optionKey)) {
                    var filteredOption = $ctrl.options.filter(function (el) {
                        return el[$ctrl.optionKey] === $ctrl.value;
                    });

                    if (filteredOption.length > 0) {
                        $ctrl.readOnlyValue = filteredOption[0][$ctrl.optionLabel];
                    }
                } else {
                    $ctrl.readOnlyValue = $ctrl.options[$ctrl.optionLabel];
                }
            }
        };

        $scope.$watch(function () {
            return $ctrl.value;
        }, function (val) {
            $scope.$emit('tbForm_OnFieldChange', $ctrl.$component, $ctrl.name, val, $ctrl.options);
            $scope.updateReadonlyValue();
        });

        $ctrl.loadData = function () {
            if ($ctrl.dataIsLoaded) {
                return;
            }

            var value = $ctrl.value;
            $ctrl.value = '';

            $http({
                url: $ctrl.optionsUrl,
                method: $ctrl.optionsMethod || 'GET'
            }).then(function (response) {
                $ctrl.options = response.data;
                $ctrl.dataIsLoaded = true;
                // TODO: Add an attribute to define if autoselect is OK
                var possibleValue = $ctrl.options && $ctrl.options.length > 0 ? angular.isDefined($ctrl.optionKey) ? $ctrl.options[0][$ctrl.optionKey] : $ctrl.options[0] : '';
                $ctrl.value = value || $ctrl.defaultValue || possibleValue;

                // Set the field dirty
                var formScope = $ctrl.getFormField();
                if (formScope) {
                    formScope.$setDirty();
                }
            }, function (error) {
                return $scope.$emit('tbGrid_OnConnectionError', error);
            });
        };
    }];

    angular.module('tubular.directives')
    /**
     * @ngdoc component
     * @name tbNumericEditor
     * @module tubular.directives
     *
     * @description
     * The `tbNumericEditor` component is numeric input, similar to `tbSimpleEditor`
     * but can render an add-on to the input visual element.
     *
     * When you need a numeric editor but without the visual elements you can use
     * `tbSimpleEditor` with the `editorType` attribute with value `number`.
     *
     * This component uses the `TubularModel` to retrieve the model information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} placeholder Set the placeholder text.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {string} format Indicate the format to use, C for currency otherwise number.
     * @param {boolean} readOnly Set if the field is read-only.
     * @param {number} min Set the minimum value.
     * @param {number} max Set the maximum value.
     * @param {number} step Set the step setting, default 'any'.
     * @param {string} defaultValue Set the default value.
     */
    .component('tbNumericEditor', {
        templateUrl: 'tbNumericEditor.tpl.html',
        bindings: {
            value: '=?',
            isEditing: '=?',
            showLabel: '=?',
            label: '@?',
            required: '=?',
            format: '@?',
            min: '=?',
            max: '=?',
            name: '@',
            placeholder: '@?',
            readOnly: '=?',
            help: '@?',
            defaultValue: '@?',
            step: '=?'
        },
        controller: tbNumericEditorCtrl
    })
    /**
     * @ngdoc component
     * @name tbDateTimeEditor
     * @module tubular.directives
     *
     * @description
     * The `tbDateTimeEditor` component is date/time input. It uses the `datetime-local` HTML5 attribute, but if this
     * components fails it falls back to Angular UI Bootstrap Datepicker (time functionality is unavailable).
     *
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {string} format Indicate the format to use, default "yyyy-MM-dd HH:mm".
     * @param {boolean} readOnly Set if the field is read-only.
     * @param {number} min Set the minimum value.
     * @param {number} max Set the maximum value.
     * @param {string} defaultValue Set the default value.
     */
    .component('tbDateTimeEditor', {
        templateUrl: canUseHtml5Date() ? 'tbDateTimeEditorHtml5.tpl.html' : 'tbDateTimeEditorBs.tpl.html',
        bindings: {
            value: '=?',
            isEditing: '=?',
            showLabel: '=?',
            label: '@?',
            required: '=?',
            format: '@?',
            min: '=?',
            max: '=?',
            name: '@',
            readOnly: '=?',
            defaultValue: '@?',
            help: '@?'
        },
        controller: tbDateTimeEditorCtrl
    })
    /**
     * @ngdoc component
     * @name tbDateEditor
     * @module tubular.directives
     *
     * @description
     * The `tbDateEditor` component is date input. It uses the `datetime-local` HTML5 attribute, but if this
     * components fails it falls back to a Angular UI Bootstrap Datepicker.
     *
     * Similar to `tbDateTimeEditor` but without a timepicker.
     *
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {string} format Indicate the format to use, default "yyyy-MM-dd".
     * @param {boolean} readOnly Set if the field is read-only.
     * @param {number} min Set the minimum value.
     * @param {number} max Set the maximum value.
     * @param {string} defaultValue Set the default value.
     */
    .component('tbDateEditor', {
        template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">\n            <span ng-hide="$ctrl.isEditing">{{ $ctrl.value | moment: $ctrl.format }}</span>\n            <label ng-show="$ctrl.showLabel" ng-bind="$ctrl.label"></label>' + (canUseHtml5Date() ? '<input type="date" ng-show="$ctrl.isEditing" ng-model="$ctrl.dateValue" class="form-control" ' + 'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}"/>' : '<div class="input-group" ng-show="$ctrl.isEditing">' + '<input type="text" uib-datepicker-popup="{{$ctrl.format}}" ng-model="$ctrl.dateValue" class="form-control" ' + 'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}" is-open="$ctrl.open" />' + '<span class="input-group-btn">' + '<button type="button" class="btn btn-default" ng-click="$ctrl.open = !$ctrl.open"><i class="fa fa-calendar"></i></button>' + '</span>' + '</div>') + '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>\n            <span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help" ng-bind="$ctrl.help"></span>\n            </div>',
        bindings: {
            value: '=?',
            isEditing: '=?',
            showLabel: '=?',
            label: '@?',
            required: '=?',
            format: '@?',
            min: '=?',
            max: '=?',
            name: '@',
            readOnly: '=?',
            defaultValue: '@?',
            help: '@?'
        },
        controller: tbDateEditorCtrl
    })
    /**
     * @ngdoc component
     * @name tbDropdownEditor
     * @module tubular.directives
     *
     * @description
     * The `tbDropdownEditor` component is drowpdown editor, it can get information from a HTTP
     * source or it can be an object declared in the attributes.
     *
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {boolean} readOnly Set if the field is read-only.
     * @param {object} options Set the options to display.
     * @param {string} optionsUrl Set the Http URL where to retrieve the values.
     * @param {string} optionsMethod Set the Http Method where to retrieve the values.
     * @param {string} optionLabel Set the property to get the labels.
     * @param {string} optionKey Set the property to get the keys.
     * @param {string} defaultValue Set the default value.
     */
    .component('tbDropdownEditor', {
        templateUrl: 'tbDropdownEditor.tpl.html',
        bindings: {
            value: '=?',
            isEditing: '=?',
            showLabel: '=?',
            label: '@?',
            required: '=?',
            name: '@',
            readOnly: '=?',
            help: '@?',
            defaultValue: '@?',
            options: '=?',
            optionsUrl: '@',
            optionsMethod: '@?',
            optionLabel: '@?',
            optionKey: '@?',
            optionTrack: '@?',
            onChange: '&?'
        },
        controller: tbDropdownEditorCtrl
    })
    /**
     * @ngdoc directive
     * @name tbTypeaheadEditor
     * @module tubular.directives
     * @restrict E
     *
     * @description
     * The `tbTypeaheadEditor` directive is autocomplete editor, it can get information from a HTTP source or it can get them
     * from a object declared in the attributes.
     *
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {object} options Set the options to display.
     * @param {string} optionsUrl Set the Http URL where to retrieve the values.
     * @param {string} optionsMethod Set the Http Method where to retrieve the values.
     * @param {string} optionLabel Set the property to get the labels.
     * @param {string} css Set the CSS classes for the input.
     */
    .directive('tbTypeaheadEditor', ['$q', '$compile', function ($q, $compile) {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                value: '=?',
                isEditing: '=?',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                name: '@',
                placeholder: '@?',
                readOnly: '=?',
                help: '@?',
                options: '=?',
                optionsUrl: '@',
                optionsMethod: '@?',
                optionLabel: '@?',
                css: '@?'
            },
            link: function link(scope, element) {
                var template = '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid && $dirty() }">\n                            <span ng-hide="isEditing" ng-bind="value"></span>\n                            <label ng-show="showLabel" ng-bind="label"></label>\n                            <div class="input-group" ng-show="isEditing">\n                            <input ng-model="value" placeholder="{{placeholder}}" title="{{tooltip}}" autocomplete="off" \n                            class="form-control {{css}}" ng-readonly="readOnly || lastSet.indexOf(value) !== -1" uib-typeahead="' + scope.selectOptions + '" \n                            ng-required="required" name="{{name}}" /> \n                            <div class="input-group-addon" ng-hide="lastSet.indexOf(value) !== -1"><i class="fa fa-pencil"></i></div>\n                            <span class="input-group-btn" ng-show="lastSet.indexOf(value) !== -1" tabindex="-1">\n                            <button class="btn btn-default" type="button" ng-click="value = null"><i class="fa fa-times"></i>\n                            </span></div>\n                            <span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>\n                            <span class="help-block" ng-show="isEditing && help" ng-bind="help"></span>\n                            </div>';

                var linkFn = $compile(template);
                var content = linkFn(scope);
                element.append(content);
            },
            controller: ['$scope', 'tubularEditorService', '$http', function ($scope, tubular, $http) {
                tubular.setupScope($scope);
                $scope.selectOptions = 'd for d in getValues($viewValue)';
                $scope.lastSet = [];

                if ($scope.optionLabe) {
                    $scope.selectOptions = 'd as d.' + $scope.optionLabel + ' for d in getValues($viewValue)';
                }

                $scope.$watch('value', function (val) {
                    $scope.$emit('tbForm_OnFieldChange', $scope.$component, $scope.name, val, $scope.options);
                    $scope.tooltip = val;

                    if (val && $scope.optionLabel) {
                        $scope.tooltip = val[$scope.optionLabel];
                    }
                });

                $scope.getValues = function (val) {
                    if (angular.isUndefined($scope.optionsUrl)) {
                        return $q(function (resolve) {
                            $scope.lastSet = $scope.options;
                            resolve($scope.options);
                        });
                    }

                    return $http({
                        url: $scope.optionsUrl + '?search=' + val,
                        method: $scope.optionsMethod || 'GET'
                    }).then(function (response) {
                        $scope.lastSet = response.data;
                        return $scope.lastSet;
                    });
                };
            }]
        };
    }])
    /**
     * @ngdoc component
     * @name tbCheckboxField
     * @module tubular.directives
     *
     * @description
     * The `tbCheckboxField` component represents a checkbox field.
     *
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {object} checkedValue Set the checked value.
     * @param {object} uncheckedValue Set the unchecked value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} help Set the help text.
     */
    .component('tbCheckboxField', {
        templateUrl: 'tbCheckboxField.tpl.html',
        bindings: {
            value: '=?',
            isEditing: '=?',
            editorType: '@',
            showLabel: '=?',
            label: '@?',
            required: '=?',
            name: '@',
            readOnly: '=?',
            help: '@?',
            checkedValue: '=?',
            uncheckedValue: '=?'
        },
        controller: ['tubularEditorService', '$scope', function (tubular, $scope) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.required = false; // overwrite required to false always
                $ctrl.checkedValue = angular.isDefined($ctrl.checkedValue) ? $ctrl.checkedValue : true;
                $ctrl.uncheckedValue = angular.isDefined($ctrl.uncheckedValue) ? $ctrl.uncheckedValue : false;

                tubular.setupScope($scope, null, $ctrl, true);
            };
        }]
    })
    /**
     * @ngdoc component
     * @name tbTextArea
     * @module tubular.directives
     *
     * @description
     * The `tbTextArea` component represents a textarea field.
     * Similar to `tbSimpleEditor` but with a `textarea` HTML element instead of `input`.
     *
     * It uses the `TubularModel` to retrieve column or field information.
     *
     * @param {string} name Set the field name.
     * @param {object} value Set the value.
     * @param {boolean} isEditing Indicate if the field is showing editor.
     * @param {boolean} showLabel Set if the label should be display.
     * @param {string} label Set the field's label otherwise the name is used.
     * @param {string} placeholder Set the placeholder text.
     * @param {string} help Set the help text.
     * @param {boolean} required Set if the field is required.
     * @param {boolean} readOnly Set if the field is read-only.
     * @param {number} min Set the minimum characters.
     * @param {number} max Set the maximum characters.
     */
    .component('tbTextArea', {
        templateUrl: 'tbTextArea.tpl.html',
        bindings: {
            value: '=?',
            isEditing: '=?',
            showLabel: '=?',
            label: '@?',
            placeholder: '@?',
            required: '=?',
            min: '=?',
            max: '=?',
            name: '@',
            readOnly: '=?',
            help: '@?'
        },
        controller: ['tubularEditorService', '$scope', 'translateFilter', function (tubular, $scope, translateFilter) {
            var $ctrl = this;

            $ctrl.validate = function () {
                if ($ctrl.min && $ctrl.value && $ctrl.value.length < parseInt($ctrl.min)) {
                    $ctrl.$valid = false;
                    $ctrl.state.$errors = [translateFilter('EDITOR_MIN_CHARS', +$ctrl.min)];
                    return;
                }

                if ($ctrl.max && $ctrl.value && $ctrl.value.length > parseInt($ctrl.max)) {
                    $ctrl.$valid = false;
                    $ctrl.state.$errors = [translateFilter('EDITOR_MAX_CHARS', +$ctrl.max)];
                    return;
                }
            };

            $ctrl.$onInit = function () {
                return tubular.setupScope($scope, null, $ctrl, false);
            };
        }]
    });
})(angular, moment);
(function (angular) {
    'use strict';

    angular.module('tubular.directives')
    /**
     * @ngdoc component
     * @name tbColumnFilterButtons
     * @module tubular.directives
     *
     * @description
     * The `tbColumnFilterButtons` is an internal component, and it is used to show basic filtering buttons.
     */
    .component('tbColumnFilterButtons', {
        require: {
            $columnFilter: '^?tbColumnFilter',
            $columnDateTimeFilter: '^?tbColumnDateTimeFilter',
            $columnOptionsFilter: '^?tbColumnOptionsFilter'
        },
        templateUrl: 'tbColumnFilterButtons.tpl.html',
        controller: ['$scope', function ($scope) {
            var $ctrl = this;

            // Set currentFilter to either one of the parent components or for when this template is being rendered by $compile
            $ctrl.$onInit = function () {
                return $ctrl.currentFilter = $ctrl.$columnFilter || $ctrl.$columnDateTimeFilter || $ctrl.$columnOptionsFilter || $scope.$parent.$ctrl;
            };
        }]
    })
    /**
     * @ngdoc component
     * @name tbColumnSelector
     * @module tubular.directives
     *
     * @description
     * The `tbColumnSelector` is a button to show columns selector popup.
     */
    .component('tbColumnSelector', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbColumnSelector.tpl.html',
        controller: ['$uibModal', function ($modal) {
            var $ctrl = this;

            $ctrl.openColumnsSelector = function () {
                var model = $ctrl.$component.columns;

                var dialog = $modal.open({
                    templateUrl: 'tbColumnSelectorDialog.tpl.html',
                    backdropClass: 'fullHeight',
                    animation: false,
                    controller: ['$scope', function ($innerScope) {
                        $innerScope.Model = model;
                        $innerScope.isInvalid = function () {
                            return $innerScope.Model.filter(function (el) {
                                return el.Visible;
                            }).length === 1;
                        };
                        $innerScope.closePopup = dialog.close;
                    }]
                });
            };
        }]
    })
    /**
     * @ngdoc directive
     * @name tbColumnFilter
     * @module tubular.directives
     * @restrict E
     *
     * @description
     * The `tbColumnFilter` directive is a the basic filter popover. You need to define it inside a `tbColumn`.
     *
     * The parent scope will provide information about the data type.
     *
     * @param {string} title Set the popover title.
     * @param {string} text Set the search text.
     * @param {string} operator Set the initial operator, default depends on data type.
     * @param {object} argument Set the argument.
     * @param {boolean} onlyContains Set if the operator selector should show, default false.
     */
    .component('tbColumnFilter', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbColumnFilter.tpl.html',
        bindings: {
            text: '@',
            argument: '@',
            operator: '@',
            title: '@',
            onlyContains: '=?'
        },
        controller: ['$scope', 'tubularTemplateService', function ($scope, tubular) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.onlyContains = angular.isUndefined($ctrl.onlyContains) ? false : $ctrl.onlyContains;
                $ctrl.templateName = 'tbColumnFilterPopover.tpl.html';
                tubular.setupFilter($scope, $ctrl);
            };
        }]
    })
    /**
     * @ngdoc directive
     * @name tbColumnDateTimeFilter
     * @module tubular.directives
     * @restrict E
     *
     * @description
     * The `tbColumnDateTimeFilter` directive is a specific filter with Date and Time editors, instead regular inputs.
     *
     * The parent scope will provide information about the data type.
     *
     * @param {string} title Set the popover title.
     * @param {string} text Set the search text.
     * @param {object} argument Set the search object (if the search is text use text attribute).
     * @param {string} operator Set the initial operator, default depends on data type.
     */
    .component('tbColumnDateTimeFilter', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbColumnDateTimeFilter.tpl.html', // TODO: Check if can use tbColumnFilter tempalte
        bindings: {
            text: '@',
            argument: '@',
            operator: '@',
            title: '@'
        },
        controller: ['$scope', 'tubularTemplateService', function ($scope, tubular) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.templateName = tubular.tbColumnDateTimeFilterPopoverTemplateName;
                tubular.setupFilter($scope, $ctrl);
            };
        }]
    })
    /**
     * @ngdoc component
     * @name tbColumnOptionsFilter
     * @module tubular.directives
     * @restrict E
     *
     * @description
     * The `tbColumnOptionsFilter` directive is a filter with an dropdown listing all the possible values to filter.
     *
     * @param {string} title Set the popover title.
     * @param {object} argument Set the search object.
     * @param {string} operator Set the initial operator, default depends on data type.
     * @param {string} optionsUrl Set the URL to retrieve options
     */
    .component('tbColumnOptionsFilter', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbColumnFilter.tpl.html',
        bindings: {
            argument: '@',
            operator: '@',
            optionsUrl: '@',
            title: '@'
        },
        controller: ['$scope', 'tubularTemplateService', '$http', function ($scope, tubular, $http) {
            var $ctrl = this;

            $ctrl.getOptionsFromUrl = function () {
                if ($ctrl.dataIsLoaded) {
                    $scope.$apply();
                    return;
                }

                $http.get($ctrl.filter.OptionsUrl).then(function (response) {
                    $ctrl.optionsItems = response.data;
                    $ctrl.dataIsLoaded = true;
                }, function (error) {
                    return $scope.$emit('tbGrid_OnConnectionError', error);
                });
            };

            $ctrl.$onInit = function () {
                $ctrl.dataIsLoaded = false;
                $ctrl.templateName = 'tbColumnOptionsFilter.tpl.html';
                tubular.setupFilter($scope, $ctrl);
                $ctrl.getOptionsFromUrl();

                $ctrl.filter.Operator = 'Multiple';
            };
        }]
    });
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives')

    /**
     * @ngdoc component
     * @name tbRemoveButton
     * @module tubular.directives
     *
     * @description
     * The `tbRemoveButton` component is visual helper to show a Remove button with a popover to confirm the action.
     *
     * @param {object} model The row to remove.
     * @param {string} caption Set the caption to use in the button, default Remove.
     * @param {string} cancelCaption Set the caption to use in the Cancel button, default `CAPTION_REMOVE` i18n resource.
     * @param {string} legend Set the legend to warn user, default `UI_REMOVEROW` i18n resource.
     * @param {string} icon Set the CSS icon's class, the button can have only icon.
     */
    .component('tbRemoveButton', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbRemoveButton.tpl.html',
        bindings: {
            model: '=',
            caption: '@',
            cancelCaption: '@',
            legend: '@',
            icon: '@'
        },
        controller: function controller() {
            var $ctrl = this;

            $ctrl.delete = function () {
                return $ctrl.$component.deleteRow($ctrl.model);
            };

            $ctrl.$onInit = function () {
                $ctrl.showIcon = angular.isDefined($ctrl.icon);
                $ctrl.showCaption = !($ctrl.showIcon && angular.isUndefined($ctrl.caption));

                $ctrl.templateName = 'tbRemoveButtonPopover.tpl.html';
            };
        }
    })
    /**
     * @ngdoc directive
     * @name tbSaveButton
     * @module tubular.directives
     * @restrict E
     *
     * @description
     * The `tbSaveButton` directive is visual helper to show a Save button and Cancel button.
     *
     * @param {object} model The row to remove.
     * @param {boolean} isNew Set if the row is a new record.
     * @param {string} saveCaption Set the caption to use in Save the button, default Save.
     * @param {string} saveCss Add a CSS class to Save button.
     * @param {string} cancelCaption Set the caption to use in cancel the button, default Cancel.
     * @param {string} cancelCss Add a CSS class to Cancel button.
     */
    .directive('tbSaveButton', [function () {

        return {
            require: '^tbGrid',
            templateUrl: 'tbSaveButton.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {
                model: '=',
                isNew: '=?',
                saveCaption: '@',
                saveCss: '@',
                cancelCaption: '@',
                cancelCss: '@'
            },
            controller: ['$scope', function ($scope) {
                $scope.$component = $scope.$parent.$parent.$component;
                $scope.isNew = $scope.isNew || false;

                $scope.save = function () {
                    if (!$scope.model.$valid()) {
                        return;
                    }

                    $scope.model.$isNew = $scope.isNew;
                    return $scope.$component.saveRow($scope.model);
                };

                $scope.cancel = function () {
                    return $scope.model.revertChanges();
                };
            }]
        };
    }])
    /**
     * @ngdoc component
     * @name tbEditButton
     * @module tubular.directives
     *
     * @description
     * The `tbEditButton` component is visual helper to create an Edit button.
     *
     * @param {object} model The row to remove.
     * @param {string} caption Set the caption to use in the button, default Edit.
     */
    .component('tbEditButton', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbEditButton.tpl.html',
        bindings: {
            model: '=',
            caption: '@'
        },
        controller: function controller() {
            var $ctrl = this;

            $ctrl.edit = function () {
                if ($ctrl.$component.editorMode === 'popup') {
                    $ctrl.model.editPopup();
                } else {
                    $ctrl.model.$isEditing = true;
                }
            };
        }
    })
    /**
     * @ngdoc component
     * @name tbPageSizeSelector
     * @module tubular.directives
     *
     * @description
     * The `tbPageSizeSelector` component is visual helper to render a dropdown to allow user select how many rows by page.
     *
     * @param {string} caption Set the caption to use in the button, default "Page size:".
     * @param {string} css Add a CSS class to the `div` HTML element.
     * @param {string} selectorCss Add a CSS class to the `select` HTML element.
     * @param {array} options Set the page options array, default [10, 20, 50, 100].
     */
    .component('tbPageSizeSelector', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbPageSizeSelector.tpl.html',
        bindings: {
            caption: '@',
            css: '@',
            selectorCss: '@',
            options: '=?'
        },
        controller: ['$scope', function ($scope) {
            return $scope.options = angular.isDefined($scope.$ctrl.options) ? $scope.$ctrl.options : [10, 20, 50, 100];
        }]
    })
    /**
     * @ngdoc component
     * @name tbExportButton
     * @module tubular.directives
     *
     * @description
     * The `tbExportButton` component is visual helper to render a button to export grid to CSV format.
     *
     * @param {string} filename Set the export file name.
     * @param {string} css Add a CSS class to the `button` HTML element.
     * @param {string} caption Set the caption.
     * @param {string} captionMenuCurrent Set the caption.
     * @param {string} captionMenuAll Set the caption.
     */
    .component('tbExportButton', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbExportButton.tpl.html',
        bindings: {
            filename: '@',
            css: '@',
            caption: '@',
            captionMenuCurrent: '@',
            captionMenuAll: '@'
        },
        controller: ['tubularGridExportService', function (tubular) {
            var $ctrl = this;

            $ctrl.downloadCsv = function () {
                return tubular.exportGridToCsv($ctrl.filename, $ctrl.$component);
            };

            $ctrl.downloadAllCsv = function () {
                return tubular.exportAllGridToCsv($ctrl.filename, $ctrl.$component);
            };
        }]
    })
    /**
     * @ngdoc component
     * @name tbPrintButton
     * @module tubular.directives
     *
     * @description
     * The `tbPrintButton` component is visual helper to render a button to print the `tbGrid`.
     *
     * @param {string} title Set the document's title.
     * @param {string} printCss Set a stylesheet URL to attach to print mode.
     * @param {string} caption Set the caption.
     */
    .component('tbPrintButton', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbPrintButton.tpl.html',
        bindings: {
            title: '@',
            printCss: '@',
            caption: '@'
        },
        controller: ['tubularGridExportService', function (tubular) {
            var $ctrl = this;

            $ctrl.printGrid = function () {
                return tubular.printGrid($ctrl.$component, $ctrl.printCss, $ctrl.title);
            };
        }]
    });
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.directives')
    /**
     * @ngdoc component
     * @name tbGridPager
     * @module tubular.directives
     *
     * @description
     * The `tbGridPager` component generates a pager connected to the parent `tbGrid`.
     */
    .component('tbGridPager', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbGridPager.tpl.html',
        controller: ['$scope', function ($scope) {
            var $ctrl = this;

            $scope.$watch('$ctrl.$component.currentPage', function () {
                if ($ctrl.$component.currentPage !== $ctrl.$component.requestedPage) {
                    $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                }
            });

            $ctrl.pagerPageChanged = function () {
                return $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
            };
        }]
    })
    /**
     * @ngdoc component
     * @name tbGridPagerInfo
     * @module tubular.directives
     *
     * @description
     * The `tbGridPagerInfo` component shows how many records are shown in a page and total rows.
     */
    .component('tbGridPagerInfo', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbGridPagerInfo.tpl.html',
        bindings: {
            cssClass: '@?'
        },
        controller: ['$scope', function ($scope) {
            var $ctrl = this;

            $ctrl.fixCurrentTop = function () {
                $ctrl.currentTop = $ctrl.$component.pageSize * $ctrl.$component.currentPage;
                $ctrl.currentInitial = ($ctrl.$component.currentPage - 1) * $ctrl.$component.pageSize + 1;

                if ($ctrl.currentTop > $ctrl.$component.filteredRecordCount) {
                    $ctrl.currentTop = $ctrl.$component.filteredRecordCount;
                }

                if ($ctrl.currentTop < 0) {
                    $ctrl.currentTop = 0;
                }

                if ($ctrl.currentInitial < 0 || $ctrl.$component.totalRecordCount === 0) {
                    $ctrl.currentInitial = 0;
                }

                if ($ctrl.$component.pageSize > $ctrl.$component.filteredRecordCount) {
                    $ctrl.currentInitial = 1;
                    $ctrl.currentTop = $ctrl.$component.filteredRecordCount;
                }
            };

            $scope.$watch('$ctrl.$component.filteredRecordCount', function () {
                $ctrl.filtered = $ctrl.$component.totalRecordCount !== $ctrl.$component.filteredRecordCount;
                $ctrl.fixCurrentTop();
            });

            $scope.$watch('$ctrl.$component.currentPage', $ctrl.fixCurrentTop);
            $scope.$watch('$ctrl.$component.pageSize', $ctrl.fixCurrentTop);

            $ctrl.$onInit = $ctrl.fixCurrentTop;
        }]
    });
})(angular);

(function (angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.services
     *
     * @description
     * Tubular Services module.
     * It contains common services like HTTP client, filtering and printing services.
     */

    angular.module('tubular.services', ['ui.bootstrap']).config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('tubularAuthInterceptor');
        $httpProvider.interceptors.push('tubularNoCacheInterceptor');
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('tubular')
    /**
     * @ngdoc filter
     * @name errormessage
     * @kind function
     *
     * @description
     * Use `errormessage` to retrieve the friendly message possible in a HTTP Error object.
     *
     * @param {object} input Input to filter.
     * @returns {string} Formatted error message.
     */
    .filter('errormessage', function () {
        return function (input) {
            if (input && input.data && input.data.ExceptionMessage) {
                return input.data.ExceptionMessage;
            }

            return input.statusText || 'Connection Error';
        };
    });
})(angular);

(function (angular, moment) {
    'use strict';

    angular.module('tubular')

    /**
     * @ngdoc filter
     * @name moment
     * @kind function
     *
     * @description
     * `moment` is a filter to call format from moment or, if the input is a Date, call Angular's `date` filter.
     */
    .filter('moment', ['dateFilter', function (dateFilter) {
        return function (input, format) {
            return moment.isMoment(input) ? input.format(format || 'M/DD/YYYY') : dateFilter(input);
        };
    }]);
})(angular, moment);

(function (angular) {
    'use strict';

    angular.module('tubular')

    /**
     * @ngdoc filter
     * @name numberorcurrency
     * @kind function
     *
     * @description
     * `numberorcurrency` is a hack to hold `currency` and `number` in a single filter.
     */
    .filter('numberorcurrency', ['numberFilter', 'currencyFilter', function (numberFilter, currencyFilter) {
        return function (input, format, symbol, fractionSize) {
            fractionSize = fractionSize || 2;

            if (format === 'C') {
                return currencyFilter(input, symbol || '$', fractionSize);
            }

            return format === 'I' ? parseInt(input) : numberFilter(input, fractionSize);
        };
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc filter
     * @name translate
     *
     * @description
     * Translate a key to the current language
     */
    .filter('translate', ['tubularTranslate', function (tubularTranslate) {
        return function (input, param1, param2, param3, param4) {
            if (angular.isUndefined(input)) {
                return input;
            }

            var translation = tubularTranslate.translate(input).replace('{0}', param1 || '').replace('{1}', param2 || '').replace('{2}', param3 || '').replace('{3}', param4 || '');

            return translation;
        };
    }]);
})(angular);

(function (angular) {
    'use strict';
    /**
     * @ngdoc function
     * @name tubularAuthInterceptor
     * @description
     *
     * Implement a httpInterceptor to handle authorization using bearer tokens
     *
     * @constructor
     * @returns {Object} A httpInterceptor
     */

    angular.module('tubular.services').factory('tubularAuthInterceptor', ['$q', '$injector', 'tubularConfig', function ($q, $injector, tubularConfig) {

        var refreshTokenRequest = null;
        var tubularHttpName = 'tubularHttp';
        var evtInvalidAuthData = 'tbAuthentication_OnInvalidAuthenticationData';

        var service = {
            request: request,
            requestError: requestError,
            response: response,
            responseError: responseError
        };

        return service;

        function request(config) {
            // If the request ignore the authentication bypass
            if (config.requireAuthentication === false) {
                return config;
            }

            if (checkIsWhiteListedUrl(config.url)) {
                return config;
            }

            // Get the service here because otherwise, a circular dependency injection will be detected
            var tubularHttp = $injector.get(tubularHttpName);
            var webApiSettings = tubularConfig.webApi;
            config.headers = config.headers || {};

            // Handle requests going to API
            if (!checkStatic(config.url) && webApiSettings.tokenUrl() !== config.url && webApiSettings.refreshTokenUrl() !== config.url && webApiSettings.requireAuthentication()) {

                if (!tubularHttp.isAuthenticated()) {
                    return $q.reject({ error: 'User not authenticated, new login required.', status: 401, config: config });
                }

                // When using refresh tokens and bearer token has expired,
                // avoid the round trip on go directly to try refreshing the token
                if (webApiSettings.enableRefreshTokens() && tubularHttp.userData.refreshToken && tubularHttp.isBearerTokenExpired()) {
                    return $q.reject({ error: 'expired token', status: 401, config: config });
                } else {
                    config.headers.Authorization = 'Bearer ' + tubularHttp.userData.bearerToken;
                }
            }

            return config;
        }

        function checkIsWhiteListedUrl(url) {
            return tubularConfig.webApi.urlWhiteList().find(function (item) {
                return url.indexOf(item) >= 0;
            });
        }

        function checkStatic(url) {
            return (/\.(htm|html|css|js|jsx)/.test(url)
            );
        }

        function requestError(rejection) {
            return $q.reject(rejection);
        }

        function response(response) {
            return response;
        }

        function resolveRefreshToken(tubularHttp, deferred, rejection) {
            var webApiSettings = tubularConfig.webApi;

            rejection.triedRefreshTokens = true;

            if (!refreshTokenRequest) {
                refreshTokenRequest = $injector.get('$http')({
                    method: 'POST',
                    url: webApiSettings.refreshTokenUrl(),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    data: 'grant_type=refresh_token&refresh_token=' + tubularHttp.userData.refreshToken
                });
            }

            refreshTokenRequest.then(function (r) {
                refreshTokenRequest = null;
                tubularHttp.initAuth(r.data);

                if (tubularHttp.isAuthenticated()) {
                    rejection.config.headers.Authorization = 'Bearer ' + tubularHttp.userData.bearerToken;
                    $injector.get('$http')(rejection.config).then(function (resp) {
                        return deferred.resolve(resp);
                    }, function () {
                        return deferred.reject(r);
                    });
                } else {
                    deferred.reject(rejection);
                }
            }, function (response) {
                refreshTokenRequest = null;
                tubularHttp.removeAuthentication();
                deferred.reject(response);

                $injector.get('$rootScope').$emit(evtInvalidAuthData);
                return;
            });
        }

        function responseError(rejection) {
            var deferred = $q.defer();

            if (rejection.status === 401) {
                var webApiSettings = tubularConfig.webApi;

                if (webApiSettings.tokenUrl() !== rejection.config.url && webApiSettings.requireAuthentication()) {

                    var tubularHttp = $injector.get(tubularHttpName);

                    if (webApiSettings.enableRefreshTokens() && webApiSettings.refreshTokenUrl() !== rejection.config.url && tubularHttp.isBearerTokenExpired() && tubularHttp.userData.refreshToken) {
                        resolveRefreshToken(tubularHttp, deferred, rejection);
                        return deferred.promise;
                    } else {
                        tubularHttp.removeAuthentication();
                        $injector.get('$rootScope').$emit(evtInvalidAuthData);
                    }
                }
            }

            deferred.reject(rejection);

            return deferred.promise;
        }
    }]);
})(angular);

(function (angular) {
    'use strict';
    /**
     * @ngdoc function
     * @name tubularNoCacheInterceptor
     * @description
     *
     * Implement a httpInterceptor to prevent browser caching
     *
     * @constructor
     * @returns {Object} A httpInterceptor
     */

    angular.module('tubular.services').factory('tubularNoCacheInterceptor', [function () {

        return {
            request: function request(config) {

                if (config.method !== 'GET') {
                    return config;
                }

                // patterns to escape: .htm | blob: | noCache=
                var matchesEscapePatterns = /\.htm|blob:|noCache\=/.test(config.url);

                if (!matchesEscapePatterns) {
                    var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                    config.url = config.url + separator + 'noCache=' + new Date().getTime();
                }

                return config;
            }
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services').constant('dataTypes', {
        STRING: 'string',
        BOOLEAN: 'boolean',
        NUMERIC: 'numeric',
        DATE_TIME: 'datetime',
        DATE: 'date',
        DATE_TIME_UTC: 'datetimeutc'
    });
})(angular);
(function (angular, moment) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name tubularEditorService
     *
     * @description
     * The `tubularEditorService` service is a internal helper to setup any `TubularModel` with a UI.
     */
    .factory('tubularEditorService', ['translateFilter', 'dataTypes', editorService]);

    function editorService(translateFilter, dataTypes) {
        return {

            /**
             * Setups a new Editor, this functions is like a common class constructor to be used
             * with all the tubularEditors.
             */
            setupScope: setupScope
        };

        function setupScope(scope, defaultFormat, ctrl, setDirty) {
            ctrl = ctrl || scope;
            ctrl.isEditing = angular.isUndefined(ctrl.isEditing) ? true : ctrl.isEditing;
            ctrl.showLabel = ctrl.showLabel || false;
            ctrl.label = ctrl.label || (ctrl.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
            ctrl.required = ctrl.required || false;
            ctrl.readOnly = ctrl.readOnly || false;
            ctrl.format = ctrl.format || defaultFormat;
            ctrl.$valid = true;

            // This is the state API for every property in the Model
            ctrl.state = {
                $valid: function $valid() {
                    ctrl.checkValid();
                    return ctrl.state.$errors.length === 0;
                },
                $dirty: ctrl.$dirty,
                $errors: []
            };

            // Get the field reference using the Angular way
            ctrl.getFormField = function () {
                var parent = scope.$parent;

                while (parent != null) {
                    if (parent.tubularDirective === 'tubular-form') {
                        var formScope = parent.getFormScope();

                        return formScope == null ? null : formScope[scope.Name];
                    }

                    parent = parent.$parent;
                }

                return null;
            };

            ctrl.$dirty = function () {
                // Just forward the property
                var formField = ctrl.getFormField();

                return formField == null ? true : formField.$dirty;
            };

            ctrl.checkValid = function () {
                ctrl.$valid = true;
                ctrl.state.$errors = [];

                if (angular.isUndefined(ctrl.value) && ctrl.required || angular.isDate(ctrl.value) && isNaN(ctrl.value.getTime()) && ctrl.required) {
                    ctrl.$valid = false;
                    ctrl.state.$errors = [translateFilter('EDITOR_REQUIRED')];

                    if (angular.isDefined(scope.$parent.Model)) {
                        scope.$parent.Model.$state[scope.Name] = ctrl.state;
                    }

                    return;
                }

                // Check if we have a validation function, otherwise return
                if (angular.isDefined(ctrl.validate)) {
                    ctrl.validate();
                }
            };

            scope.$watch(function () {
                return ctrl.value;
            }, function (newValue, oldValue) {
                if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) {
                    return;
                }

                ctrl.$valid = true;

                // Try to match the model to the parent, if it exists
                if (angular.isDefined(scope.$parent.Model)) {
                    if (angular.isUndefined(scope.$parent.Model.$fields)) {
                        scope.$parent.Model.$fields = [];
                    }

                    if (scope.$parent.Model.$fields.indexOf(ctrl.name) !== -1) {
                        scope.$parent.Model[ctrl.name] = newValue;
                        scope.$parent.Model.$state = scope.$parent.Model.$state || [];
                        scope.$parent.Model.$state[scope.Name] = ctrl.state;
                    } else if (angular.isDefined(scope.$parent.Model.$addField)) {
                        scope.$parent.Model.$addField(ctrl.name, newValue, true);
                    }
                }

                ctrl.checkValid();
            });

            var parent = scope.$parent;

            // We try to find a Tubular Form in the parents
            while (parent != null) {
                if (parent.tubularDirective === 'tubular-form' || parent.tubularDirective === 'tubular-row-template') {

                    if (ctrl.name === null) {
                        return;
                    }

                    ctrl.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

                    scope.Name = ctrl.name;

                    ctrl.bindScope = function () {
                        scope.$parent.Model = parent.model;

                        if (angular.equals(ctrl.value, parent.model[scope.Name]) === false) {
                            if (angular.isDefined(parent.model[scope.Name])) {
                                if ((ctrl.DataType === dataTypes.DATE || ctrl.DataType === dataTypes.DATE_TIME) && parent.model[scope.Name] != null && angular.isString(parent.model[scope.Name])) {
                                    if (parent.model[scope.Name] === '' || parent.model[scope.Name] === null) {
                                        ctrl.value = parent.model[scope.Name];
                                    } else {
                                        ctrl.value = moment(parent.model[scope.Name]);
                                    }
                                } else {
                                    ctrl.value = parent.model[scope.Name];
                                }
                            }
                        }

                        scope.$watch(function () {
                            return ctrl.value;
                        }, function (value) {
                            if (value !== parent.model[scope.Name]) {
                                parent.model[scope.Name] = value;
                            }
                        });

                        scope.$watch(function () {
                            return parent.model[scope.Name];
                        }, function (value) {
                            if (value !== ctrl.value) {
                                ctrl.value = value;
                            }
                        }, true);

                        if (ctrl.value == null && ctrl.defaultValue && ctrl.defaultValue != null) {
                            if ((ctrl.DataType === dataTypes.DATE || ctrl.DataType === dataTypes.DATE_TIME) && angular.isString(ctrl.defaultValue)) {
                                ctrl.defaultValue = new Date(ctrl.defaultValue);
                            }

                            if (ctrl.DataType === dataTypes.NUMERIC && angular.isString(ctrl.defaultValue)) {
                                ctrl.defaultValue = parseFloat(ctrl.defaultValue);
                            }

                            ctrl.value = ctrl.defaultValue;
                        }

                        parent.model.$state = parent.model.$state || {};

                        // This is the state API for every property in the Model
                        parent.model.$state[scope.Name] = {
                            $valid: function $valid() {
                                ctrl.checkValid();
                                return ctrl.state.$errors.length === 0;
                            },
                            $dirty: ctrl.$dirty,
                            $errors: ctrl.state.$errors
                        };

                        if (angular.equals(ctrl.state, parent.model.$state[scope.Name]) === false) {
                            ctrl.state = parent.model.$state[scope.Name];
                        }

                        if (setDirty) {
                            var formScope = ctrl.getFormField();

                            if (formScope) {
                                formScope.$setDirty();
                            }
                        }
                    };

                    parent.fields.push(ctrl);

                    break;
                }

                parent = parent.$parent;
            }
        }
    }
})(angular, moment);

(function (angular) {
    'use strict';

    angular.module('tubular.services')

    /**
     * @ngdoc factory
     * @name tubularGridExportService
     *
     * @description
     * Use `tubularGridExportService` to export your `tbGrid` to a CSV file.
     */
    .factory('tubularGridExportService', ['$window', function ($window) {
        var service = this;

        service.saveFile = function (filename, blob) {
            var fileURL = $window.URL.createObjectURL(blob);
            var downloadLink = angular.element('<a></a>');

            downloadLink.attr('href', fileURL);
            downloadLink.attr('download', filename);
            downloadLink.attr('target', '_self');
            downloadLink[0].click();

            $window.URL.revokeObjectURL(fileURL);
        };

        return {
            exportAllGridToCsv: function exportAllGridToCsv(filename, gridScope) {
                var columns = getColumns(gridScope);
                var visibility = getColumnsVisibility(gridScope);

                gridScope.getFullDataSource().then(function (data) {
                    return service.saveFile(filename, exportToCsv(columns, data, visibility));
                });
            },

            exportGridToCsv: function exportGridToCsv(filename, gridScope) {
                if (!gridScope.dataSource || !gridScope.dataSource.Payload) {
                    return;
                }

                var columns = getColumns(gridScope);
                var visibility = getColumnsVisibility(gridScope);

                gridScope.currentRequest = {};
                service.saveFile(filename, exportToCsv(columns, gridScope.dataSource.Payload, visibility));
                gridScope.currentRequest = null;
            },

            printGrid: function printGrid(component, printCss, title) {
                component.getFullDataSource().then(function (data) {
                    var tableHtml = '<table class="table table-bordered table-striped"><thead><tr>' + component.columns.filter(function (c) {
                        return c.Visible;
                    }).reduce(function (prev, el) {
                        return prev + '<th>' + (el.Label || el.Name) + '</th>';
                    }, '') + '</tr></thead>' + ('<tbody>' + data.map(function (row) {
                        if (angular.isObject(row)) {
                            row = Object.keys(row).map(function (key) {
                                return row[key];
                            });
                        }

                        return '<tr>' + row.map(function (cell, index) {
                            if (angular.isDefined(component.columns[index]) && !component.columns[index].Visible) {
                                return '';
                            }

                            return '<td>' + cell + '</td>';
                        }).join(' ') + '</tr>';
                    }).join('  ') + '</tbody>') + '</table>';

                    var popup = $window.open('about:blank', 'Print', 'menubar=0,location=0,height=500,width=800');
                    popup.document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />');

                    if (printCss !== '') {
                        popup.document.write('<link rel="stylesheet" href="' + printCss + '" />');
                    }

                    popup.document.write('<body onload="window.print();">');
                    popup.document.write('<h1>' + title + '</h1>');
                    popup.document.write(tableHtml);
                    popup.document.write('</body>');
                    popup.document.close();
                });
            }
        };
    }]);

    function getColumns(gridScope) {
        return gridScope.columns.map(function (c) {
            return c.Label;
        });
    }

    function getColumnsVisibility(gridScope) {
        return gridScope.columns.map(function (c) {
            return c.Visible;
        });
    }

    function exportToCsv(header, rows, visibility) {
        var processRow = function processRow(row) {
            if (angular.isObject(row)) {
                row = Object.keys(row).map(function (key) {
                    return row[key];
                });
            }

            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                if (visibility[j]) {
                    var innerValue = row[j] == null ? '' : row[j].toString();

                    if (angular.isDate(row[j])) {
                        innerValue = row[j].toLocaleString();
                    }

                    var result = innerValue.replace(/"/g, '""');

                    if (result.search(/("|,|\n)/g) >= 0) {
                        result = '"' + result + '"';
                    }

                    if (j > 0) {
                        finalVal += ',';
                    }

                    finalVal += result;
                }
            }

            return finalVal + '\n';
        };

        var csvFile = '';

        if (header.length > 0) {
            csvFile += processRow(header);
        }

        angular.forEach(rows, function (row) {
            return csvFile += processRow(row);
        });

        // Add "\uFEFF" (UTF-8 BOM)
        return new Blob(['\uFEFF' + csvFile], {
            type: 'text/csv;charset=utf-8;'
        });
    }
})(angular);

(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name tubularHttp
     *
     * @description
     * Use `tubularHttp` to connect a grid or a form to a HTTP Resource. Internally this service is
     * using `$http` to make all the request.
     *
     * This service provides authentication using bearer-tokens. Based on https://bitbucket.org/david.antaramian/so-21662778-spa-authentication-example
     */
    .service('tubularHttp', ['$http', '$q', '$document', 'tubularConfig', '$window', function ($http, $q, $document, tubularConfig, $window) {
        var authData = 'auth_data';
        var prefix = tubularConfig.localStorage.prefix();
        var me = this;

        function init() {
            var savedData = angular.fromJson($window.localStorage.getItem(prefix + authData));

            if (savedData != null) {
                me.userData = savedData;
            }
        }

        function isAuthenticationExpired(expirationDate) {
            var now = new Date();
            expirationDate = new Date(expirationDate);

            return expirationDate - now <= 0;
        }

        me.userData = {
            isAuthenticated: false,
            username: '',
            bearerToken: '',
            expirationDate: null
        };

        me.isBearerTokenExpired = function () {
            return isAuthenticationExpired(me.userData.expirationDate);
        };

        me.isAuthenticated = function () {
            return me.userData.isAuthenticated && !isAuthenticationExpired(me.userData.expirationDate);
        };

        me.removeAuthentication = function () {
            $window.localStorage.removeItem(prefix + authData);
            me.userData.isAuthenticated = false;
            me.userData.username = '';
            me.userData.bearerToken = '';
            me.userData.expirationDate = null;
            me.userData.refreshToken = null;
        };

        me.authenticate = function (username, password) {
            this.removeAuthentication();

            return $http({
                method: 'POST',
                url: tubularConfig.webApi.tokenUrl(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: 'grant_type=password&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
            }).then(function (response) {
                me.initAuth(response.data, username);
                response.data.authenticated = true;

                return response.data;
            }, function (errorResponse) {
                return $q.reject(errorResponse.data);
            });
        };

        // TODO: make private this function
        me.initAuth = function (data, username) {
            me.userData.isAuthenticated = true;
            me.userData.username = data.userName || username || me.userData.username;
            me.userData.bearerToken = data.access_token;
            me.userData.expirationDate = new Date();
            me.userData.expirationDate = new Date(me.userData.expirationDate.getTime() + data.expires_in * 1000);
            me.userData.role = data.role;
            me.userData.refreshToken = data.refresh_token;

            $window.localStorage.setItem(prefix + authData, angular.toJson(me.userData));
        };

        init();
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name localPager
     *
     * @description
     * Represents a service to handle a Tubular Grid Request in client side
     */
    .service('localPager', localPager);

    localPager.$inject = ['$q', 'orderByFilter'];

    function localPager($q, orderByFilter) {
        this.process = function (request, data) {
            return $q(function (resolve) {
                if (data && data.length > 0) {
                    var totalRecords = data.length;
                    var set = data;

                    if (angular.isArray(set[0]) == false) {
                        var columnIndexes = request.data.Columns.map(function (el) {
                            return el.Name;
                        });

                        set = set.map(function (el) {
                            return columnIndexes.map(function (name) {
                                return el[name];
                            });
                        });
                    }

                    set = search(request.data, set);
                    set = filter(request.data, set);
                    set = sort(request.data, set);

                    resolve({ data: format(request.data, set, totalRecords) });
                } else {
                    resolve({ data: createEmptyResponse() });
                }
            });
        };

        function sort(request, set) {
            var sorts = request.Columns.map(function (el, index) {
                return el.SortOrder > 0 ? (el.SortDirection === 'Descending' ? '-' : '') + index : null;
            }).filter(function (el) {
                return el != null;
            });

            angular.forEach(sorts, function (sort) {
                set = orderByFilter(set, sort);
            });

            return set;
        }

        function search(request, set) {
            if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                var filters = request.Columns.map(function (el, index) {
                    return el.Searchable ? index : null;
                }).filter(function (el) {
                    return el != null;
                });

                if (filters.length > 0) {
                    var searchValue = request.Search.Text.toLocaleLowerCase();

                    return set.filter(function (value) {
                        return filters.some(function (el) {
                            return angular.isString(value[el]) && value[el].toLocaleLowerCase().indexOf(searchValue) >= 0;
                        });
                    });
                }
            }

            return set;
        }

        function filter(request, set) {
            // Get filters (only Contains)
            // TODO: Implement all operators
            var filters = request.Columns.map(function (el, index) {
                return el.Filter && el.Filter.Text ? { idx: index, text: el.Filter.Text.toLocaleLowerCase() } : null;
            }).filter(function (el) {
                return el != null;
            });

            if (filters.length === 0) {
                return set;
            }

            //This is applying OR operator to all filters and CONTAINS
            return set.filter(function (value) {
                return filters.some(function (el) {
                    // if string apply contains
                    if (angular.isString(value[el.idx]) && value[el.idx].toLocaleLowerCase().indexOf(el.text) >= 0) return true;
                    // otherwise just compare without type
                    return value[el.idx] == el.text;
                });
            });
        }

        function format(request, set, totalRecords) {
            var response = createEmptyResponse();
            response.FilteredRecordCount = set.length;
            response.TotalRecordCount = totalRecords;
            response.Payload = set.slice(request.Skip, request.Take + request.Skip);
            response.TotalPages = Math.trunc((response.FilteredRecordCount + request.Take - 1) / request.Take);

            if (response.TotalPages > 0) {
                response.CurrentPage = request.Skip / set.length + 1;
            }

            return response;
        }

        function createEmptyResponse() {
            return {
                Counter: 0,
                CurrentPage: 1,
                FilteredRecordCount: 0,
                TotalRecordCount: 0,
                Payload: [],
                TotalPages: 0
            };
        }
    }
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc factory
     * @name modelSaver
     *
     * @description
     * Use `modelSaver` to save a `tubularModel` 
     */
    .factory('modelSaver', ['$http', function ($http) {
        function addTimeZoneToUrl(url) {
            return '' + url + (url.indexOf('?') === -1 ? '?' : '&') + 'timezoneOffset=' + new Date().getTimezoneOffset();
        }

        return {

            /**
             * Save a model using the url and method
             *
             * @param {string} url
             * @param {string} method
             * @param {any} model
             */
            save: function save(url, method, model) {
                // TODO: RequiredAuthentication bypass?
                if (!url) {
                    throw 'Define a Save URL.';
                }

                model.$isLoading = true;
                var clone = angular.copy(model);
                var originalClone = angular.copy(model.$original);

                delete clone.$isEditing;
                delete clone.$original;
                delete clone.$state;
                delete clone.$valid;
                delete clone.$isLoading;
                delete clone.$isNew;
                delete clone.$fields;
                delete clone.$key;

                return $http({
                    url: model.$isNew ? addTimeZoneToUrl(url) : url,
                    method: model.$isNew ? method || 'POST' : 'PUT',
                    data: model.$isNew ? clone : {
                        Old: originalClone,
                        New: clone,
                        TimezoneOffset: new Date().getTimezoneOffset()
                    }
                });
            }
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc factory
     * @name tubularPopupService
     *
     * @description
     * Use `tubularPopupService` to show or generate popups with a `tbForm` inside.
     */
    .factory('tubularPopupService', ['$uibModal', '$rootScope', 'tubularTemplateService', function ($uibModal, $rootScope, tubularTemplateService) {

        return {
            onSuccessForm: function onSuccessForm(callback) {
                var successHandle = $rootScope.$on('tbForm_OnSuccessfulSave', callback);

                $rootScope.$on('$destroy', successHandle);
            },

            onConnectionError: function onConnectionError(callback) {
                var errorHandle = $rootScope.$on('tbForm_OnConnectionError', callback);

                $rootScope.$on('$destroy', errorHandle);
            },

            /**
             * Opens a new Popup
             *
             * @param {string} template
             * @param {object} model
             * @param {object} gridScope
             * @param {string} size
             * @returns {object} The Popup instance
             */
            openDialog: function openDialog(template, _model, _gridScope, size) {
                if (angular.isUndefined(template)) {
                    template = tubularTemplateService.generatePopup(_model);
                }

                return $uibModal.open({
                    templateUrl: template,
                    backdropClass: 'fullHeight',
                    animation: false,
                    size: size,
                    controller: 'GenericPopupController',
                    resolve: {
                        model: function model() {
                            return _model;
                        },
                        gridScope: function gridScope() {
                            return _gridScope;
                        }
                    }
                });
            }
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services').controller('GenericPopupController', ['$rootScope', '$scope', '$uibModalInstance', 'model', 'gridScope', function ($rootScope, $scope, $uibModalInstance, model, gridScope) {

        $scope.Model = model;

        $scope.savePopup = function (innerModel, forceUpdate) {
            innerModel = innerModel || $scope.Model;

            // If we have nothing to save and it's not a new record, just close
            if (!forceUpdate && !innerModel.$isNew && !innerModel.$hasChanges()) {
                $scope.closePopup();
                return null;
            }

            return gridScope.saveRow(innerModel, forceUpdate).then(function () {
                return $uibModalInstance.close();
            });
        };

        $scope.closePopup = function () {
            if (angular.isDefined($scope.Model.revertChanges)) {
                $scope.Model.revertChanges();
            }

            $uibModalInstance.close();
        };

        $scope.onSave = function () {
            $scope.closePopup();
            gridScope.retrieveData();
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name tubularTemplateService
     *
     * @description
     * Use `tubularTemplateService` to generate `tbGrid` and `tbForm` templates.
     */
    .service('tubularTemplateService', ['$templateCache', 'translateFilter', 'dataTypes', function ($templateCache, translateFilter, dataTypes) {
        var me = this;

        me.canUseHtml5Date = function () {
            var el = angular.element('<input type="date" value=":)" />');
            return el.attr('type') === 'date' && el.val() === '';
        };

        me.defaults = {
            gridOptions: {
                Pager: true,
                FreeTextSearch: true,
                PageSizeSelector: true,
                PagerInfo: true,
                ExportCsv: true,
                Mode: 'Read-Only',
                RequireAuthentication: false,
                RequestMethod: 'GET',
                GridName: 'grid'
            },
            formOptions: {
                CancelButton: true,
                SaveUrl: '',
                SaveMethod: 'POST',
                Layout: 'Simple',
                ModelKey: '',
                RequireAuthentication: false,
                dataUrl: ''
            },
            fieldsSettings: {
                tbSimpleEditor: {
                    ShowLabel: true,
                    Placeholder: true,
                    Format: false,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: true
                },
                tbNumericEditor: {
                    ShowLabel: true,
                    Placeholder: true,
                    Format: true,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: false
                },
                tbDateTimeEditor: {
                    ShowLabel: true,
                    Placeholder: false,
                    Format: true,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: false
                },
                tbDateEditor: {
                    ShowLabel: true,
                    Placeholder: false,
                    Format: true,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: false
                },
                tbDropdownEditor: {
                    ShowLabel: true,
                    Placeholder: false,
                    Format: false,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: false
                },
                tbTypeaheadEditor: {
                    ShowLabel: true,
                    Placeholder: true,
                    Format: false,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: false
                },
                tbCheckboxField: {
                    ShowLabel: false,
                    Placeholder: false,
                    Format: false,
                    Help: true,
                    Required: false,
                    ReadOnly: true,
                    EditorType: false
                },
                tbTextArea: {
                    ShowLabel: true,
                    Placeholder: true,
                    Help: true,
                    Required: true,
                    ReadOnly: true,
                    EditorType: false
                }
            }
        };

        // Loading popovers templates
        me.tbColumnDateTimeFilterPopoverTemplateName = me.canUseHtml5Date() ? 'tbColumnDateTimeFilterPopoverHtml5.tpl.html' : 'tbColumnDateTimeFilterPopoverBs.tpl.html';

        /**
         * Generates the grid's cells markup
         * @param {array} columns
         * @param {string} mode
         * @returns {string}
         */
        me.generateCells = function (columns, mode) {
            return columns.reduce(function (prev, el) {
                var editorTag = mode === 'Inline' ? el.EditorType.replace(/([A-Z])/g, function ($1) {
                    return '-' + $1.toLowerCase();
                }) : '';
                var templateExpression = el.Template || '<span ng-bind="row.' + el.Name + '"></span>';

                return prev + '\r\n\t\t<td tb-cell ng-transclude column-name="' + el.Name + '">\n                            \t\t\t' + (mode === 'Inline' ? '<' + editorTag + ' is-editing="row.$isEditing" value="row.' + el.Name + '"></' + editorTag + '>' : templateExpression) + '\n                            \t\t</td>';
            }, '');
        };

        me.generateColumnsDefinitions = function (columns) {
            return columns.reduce(function (prev, el) {
                return prev + '\n                        \t\t<tb-column name="' + el.Name + '" label="' + el.Label + '" column-type="' + el.DataType + '" sortable="' + el.Sortable + '" \n                        \t\t\tis-key="' + el.IsKey + '" searchable="' + el.Searchable + '" ' + (el.Sortable ? '\r\n\t\t\tsort-direction="' + el.SortDirection + '" sort-order="' + el.SortOrder + '" ' : ' ') + '\n                                visible="' + el.Visible + '">' + (el.Filter ? '\r\n\t\t\t<tb-column-filter></tb-column-filter>' : '') + '\n                        \t\t\t<tb-column-header><span>{{label}}</span></tb-column-header>\n                        \t\t</tb-column>';
            }, '');
        };

        /**
         * Generates a grid markup using a columns model and grids options
         * @param {array} columns
         * @param {object} options
         * @returns {string}
         */
        me.generateGrid = function (columns, options) {
            var topToolbar = '';
            var bottomToolbar = '';

            if (options.Pager) {
                topToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                bottomToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
            }

            if (options.ExportCsv) {
                topToolbar += '\r\n\t<div class="col-md-3">' + '\r\n\t\t<div class="btn-group">' + '\r\n\t\t<tb-print-button title="Tubular"></tb-print-button>' + '\r\n\t\t<tb-export-button filename="tubular.csv" css="btn-sm"></tb-export-button>' + '\r\n\t\t</div>' + '\r\n\t</div>';
            }

            if (options.FreeTextSearch) {
                topToolbar += '\r\n\t<tb-text-search class="col-md-3" css="input-sm"></tb-text-search>';
            }

            if (options.PageSizeSelector) {
                bottomToolbar += '\r\n\t<tb-page-size-selector class="col-md-3" selectorcss="input-sm"></tb-page-size-selector>';
            }

            if (options.PagerInfo) {
                bottomToolbar += '\r\n\t<tb-grid-pager-info class="col-md-3"></tb-grid-pager-info>';
            }

            var columnDefinitions = me.generateColumnsDefinitions(columns);
            var rowsDefinitions = me.generateCells(columns, options.Mode);

            return '' + ('<div class="container">' + '\r\n<tb-grid server-url="') + options.dataUrl + '" request-method="' + options.RequestMethod + '" class="row" ' + ('page-size="10" require-authentication="' + options.RequireAuthentication + '" ' + (options.Mode !== 'Read-Only' ? ' editor-mode="' + options.Mode.toLowerCase() + '"' : '') + '>' + (topToolbar === '' ? '' : '\r\n\t<div class="row">' + topToolbar + '\r\n\t</div>') + '\r\n\t<div class="row">') + '\r\n\t<div class="col-md-12">' + '\r\n\t<div class="panel panel-default panel-rounded">' + ('\r\n\t<tb-grid-table class="table-bordered">\n                        \t<tb-column-definitions>\n                        ' + columnDefinitions + '\n                        </tb-column-definitions>') + '\r\n\t<tb-row-set>' + ('\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">' + (options.Mode !== 'Read-Only' ? '\r\n\t\t<tb-cell-template>' + (options.Mode === 'Inline' ? '\r\n\t\t\t<tb-save-button model="row"></tb-save-button>' : '') + '\r\n\t\t\t<tb-edit-button model="row"></tb-edit-button>' + '\r\n\t\t</tb-cell-template>' : '') + rowsDefinitions + '\r\n\t</tb-row-template>') + ('\r\n\t</tb-row-set>\n                        \t</tb-grid-table>\n                        \t</div>\n                        \t</div>\n                        \t</div>' + (bottomToolbar === '' ? '' : '\r\n\t<div class="row">' + bottomToolbar + '\r\n\t</div>') + '\r\n</tb-grid>\n                        </div>');
        };

        me.getEditorTypeByDateType = function (dataType) {
            switch (dataType) {
                case dataTypes.DATE:
                    return 'tbDateTimeEditor';
                case dataTypes.NUMERIC:
                    return 'tbNumericEditor';
                case dataTypes.BOOLEAN:
                    return 'tbCheckboxField';
                default:
                    return 'tbSimpleEditor';
            }
        };

        /*
         * Create a columns array using a model.
         *
         * @param {object} model
         * @returns {array} The columns
         */
        me.createColumns = function (model) {
            var jsonModel = angular.isArray(model) && model.length > 0 ? model[0] : model;
            var columns = [];

            angular.forEach(Object.keys(jsonModel), function (prop) {
                var value = jsonModel[prop];

                // Ignore functions and  null value, but maybe evaluate another item if there is anymore
                if (prop[0] === '$' || angular.isFunction(value) || value == null) {
                    return;
                }

                if (angular.isNumber(value) || parseFloat(value).toString() === value) {
                    columns.push({
                        Name: prop,
                        DataType: dataTypes.NUMERIC,
                        Template: '{{row.' + prop + ' | number}}'
                    });
                } else if (angular.isDate(value) || !isNaN(new Date(value).getTime())) {
                    columns.push({ Name: prop, DataType: dataTypes.DATE, Template: '{{row.' + prop + ' | moment }}' });
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    columns.push({
                        Name: prop,
                        DataType: dataTypes.BOOLEAN,
                        Template: '{{row.' + prop + ' ? "TRUE" : "FALSE" }}'
                    });
                } else {
                    var newColumn = { Name: prop, DataType: dataTypes.STRING, Template: '{{row.' + prop + '}}' };

                    if (/e(-|)mail/ig.test(newColumn.Name)) {
                        newColumn.Template = '<a href="mailto:' + newColumn.Template + '">' + newColumn.Template + '</a>';
                    }

                    columns.push(newColumn);
                }
            });

            var firstSort = false;

            angular.forEach(columns, function (columnObj) {
                columnObj.Label = columnObj.Name.replace(/([a-z])([A-Z])/g, '$1 $2');
                columnObj.EditorType = me.getEditorTypeByDateType(columnObj.DataType);

                // Grid attributes
                columnObj.Searchable = columnObj.DataType === dataTypes.STRING;
                columnObj.Filter = true;
                columnObj.Visible = true;
                columnObj.Sortable = true;
                columnObj.IsKey = false;
                columnObj.SortOrder = 0;
                columnObj.SortDirection = '';
                // Form attributes
                columnObj.ShowLabel = true;
                columnObj.Placeholder = '';
                columnObj.Format = '';
                columnObj.Help = '';
                columnObj.Required = true;
                columnObj.ReadOnly = false;

                if (firstSort) {
                    return;
                }

                columnObj.IsKey = true;
                columnObj.SortOrder = 1;
                columnObj.SortDirection = 'Ascending';
                firstSort = true;
            });

            return columns;
        };

        me.generatePopupTemplate = function (model, title) {
            var columns = me.createColumns(model);
            title = title || 'Edit Row';

            return '<tb-form model="Model"><div class="modal-header"><h3 class="modal-title">' + title + '</h3></div>' + ('<div class="modal-body">' + me.generateFieldsArray(columns).join('') + '</div>') + '<div class="modal-footer">' + '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' + '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' + '</div>' + '</tb-form>';
        };

        me.generatePopup = function (model, title) {
            var templateName = 'temp' + new Date().getTime() + '.html';
            var template = me.generatePopupTemplate(model, title);

            $templateCache.put(templateName, template);

            return templateName;
        };

        /**
         * Generates a new form using the fields model and options
         *
         * @param {array} fields
         * @param {object} options
         * @returns {string}
         */
        me.generateForm = function (fields, options) {
            var layout = options.Layout === 'Simple' ? '' : options.Layout.toLowerCase();
            var fieldsArray = me.generateFieldsArray(fields);
            var fieldsMarkup = void 0;

            if (layout === '') {
                fieldsMarkup = fieldsArray.join('');
            } else {
                fieldsMarkup = '\r\n\t<div class="row">' + (layout === 'two-columns' ? '\r\n\t<div class="col-md-6">' + fieldsArray.filter(function (i, e) {
                    return e % 2 === 0;
                }).join('') + '\r\n\t</div>\r\n\t<div class="col-md-6">' + fieldsArray.filter(function (i, e) {
                    return e % 2 === 1;
                }).join('') + '</div>' : '\r\n\t<div class="col-md-4">' + fieldsArray.filter(function (i, e) {
                    return e % 3 === 0;
                }).join('') + '\r\n\t</div>\r\n\t<div class="col-md-4">' + fieldsArray.filter(function (i, e) {
                    return e % 3 === 1;
                }).join('') + '\r\n\t</div>\r\n\t<div class="col-md-4">' + fieldsArray.filter(function (i, e) {
                    return e % 3 === 2;
                }).join('') + '\r\n\t</div>') + '\r\n\t</div>';
            }

            return '' + ('<tb-form server-save-method="' + options.SaveMethod + '" \n                                model-key="' + options.ModelKey + '" \n                                require-authentication="' + options.RequireAuthentication + '" \n                                server-url="' + options.dataUrl + '" \n                                server-save-url="' + options.SaveUrl + '">' + '\r\n\t') + fieldsMarkup + '\r\n\t<div>' + ('\r\n\t\t<button class="btn btn-primary" ng-click="$parent.save()" ng-disabled="!$parent.model.$valid()">Save</button>' + (options.CancelButton ? '\r\n\t\t<button class="btn btn-danger" ng-click="$parent.cancel()" formnovalidate>Cancel</button>' : '') + '\r\n\t</div>') + '\r\n</tb-form>';
        };

        /**
         * Generates a array with a template for every column
         *
         * @param {array} columns
         * @returns {array}
         */
        me.generateFieldsArray = function (columns) {
            return columns.map(function (el) {
                var editorTag = el.EditorType.replace(/([A-Z])/g, function ($1) {
                    return '-' + $1.toLowerCase();
                });
                var defaults = me.defaults.fieldsSettings[el.EditorType];

                return '' + ('\r\n\t' + ('<' + editorTag + ' name="' + el.Name + '"')) + (defaults.EditorType ? '\r\n\t\teditor-type="' + el.DataType + '" ' : '') + (defaults.ShowLabel ? '\r\n\t\tlabel="' + el.Label + '" show-label="' + el.ShowLabel + '"' : '') + (defaults.Placeholder ? '\r\n\t\tplaceholder="' + el.Placeholder + '"' : '') + (defaults.Required ? '\r\n\t\trequired="' + el.Required + '"' : '') + (defaults.ReadOnly ? '\r\n\t\tread-only="' + el.ReadOnly + '"' : '') + (defaults.Format ? '\r\n\t\tformat="' + el.Format + '"' : '') + (defaults.Help ? '\r\n\t\thelp="' + el.Help + '"' : '') + '>\r\n\t' + ('</' + editorTag + '>');
            });
        };

        me.setupFilter = function ($scope, $ctrl) {
            var _filterOperators;

            var dateOps = {
                'None': translateFilter('OP_NONE'),
                'Equals': translateFilter('OP_EQUALS'),
                'NotEquals': translateFilter('OP_NOTEQUALS'),
                'Between': translateFilter('OP_BETWEEN'),
                'Gte': '>=',
                'Gt': '>',
                'Lte': '<=',
                'Lt': '<'
            };

            var filterOperators = (_filterOperators = {}, _defineProperty(_filterOperators, dataTypes.STRING, {
                'None': translateFilter('OP_NONE'),
                'Equals': translateFilter('OP_EQUALS'),
                'NotEquals': translateFilter('OP_NOTEQUALS'),
                'Contains': translateFilter('OP_CONTAINS'),
                'NotContains': translateFilter('OP_NOTCONTAINS'),
                'StartsWith': translateFilter('OP_STARTSWITH'),
                'NotStartsWith': translateFilter('OP_NOTSTARTSWITH'),
                'EndsWith': translateFilter('OP_ENDSWITH'),
                'NotEndsWith': translateFilter('OP_NOTENDSWITH')
            }), _defineProperty(_filterOperators, dataTypes.NUMERIC, {
                'None': translateFilter('OP_NONE'),
                'Equals': translateFilter('OP_EQUALS'),
                'Between': translateFilter('OP_BETWEEN'),
                'Gte': '>=',
                'Gt': '>',
                'Lte': '<=',
                'Lt': '<'
            }), _defineProperty(_filterOperators, dataTypes.DATE, dateOps), _defineProperty(_filterOperators, dataTypes.DATE_TIME, dateOps), _defineProperty(_filterOperators, dataTypes.DATE_TIME_UTC, dateOps), _defineProperty(_filterOperators, dataTypes.BOOLEAN, {
                'None': translateFilter('OP_NONE'),
                'Equals': translateFilter('OP_EQUALS'),
                'NotEquals': translateFilter('OP_NOTEQUALS')
            }), _filterOperators);

            $ctrl.filter = {
                Text: $ctrl.text || null,
                Argument: $ctrl.argument ? [$ctrl.argument] : null,
                Operator: $ctrl.operator || 'Contains',
                OptionsUrl: $ctrl.optionsUrl || null,
                HasFilter: !($ctrl.text == null || $ctrl.text === '' || angular.isUndefined($ctrl.text)),
                Name: $scope.$parent.$parent.column.Name
            };

            $ctrl.filterTitle = $ctrl.title || translateFilter('CAPTION_FILTER');

            $scope.$watch(function () {
                var c = $ctrl.$component.columns.filter(function (e) {
                    return e.Name === $ctrl.filter.Name;
                });

                return c.length !== 0 ? c[0] : null;
            }, function (val) {
                if (!val) {
                    return;
                }

                if ((val.DataType === dataTypes.DATE || val.DataType === dataTypes.DATE_TIME || val.DataType === dataTypes.DATE_TIME_UTC) && !($ctrl.filter.Text === '' || $ctrl.filter.Text == null)) {
                    $ctrl.filter.Text = new Date($ctrl.filter.Text);
                }

                if ($ctrl.filter.HasFilter !== val.Filter.HasFilter) {
                    $ctrl.filter.HasFilter = val.Filter.HasFilter;
                    $ctrl.filter.Text = val.Filter.Text;
                    $ctrl.retrieveData();
                }
            }, true);

            $ctrl.retrieveData = function () {
                var c = $ctrl.$component.columns.filter(function (e) {
                    return e.Name === $ctrl.filter.Name;
                });

                if (c.length !== 0) {
                    c[0].Filter = $ctrl.filter;
                }

                $ctrl.$component.retrieveData();
                $ctrl.close();
            };

            $ctrl.clearFilter = function () {
                if ($ctrl.filter.Operator !== 'Multiple') {
                    $ctrl.filter.Operator = 'None';
                }

                if (angular.isDefined($ctrl.onlyContains) && $ctrl.onlyContains) {
                    $ctrl.filter.Operator = 'Contains';
                }

                $ctrl.filter.Text = '';
                $ctrl.filter.Argument = [];
                $ctrl.filter.HasFilter = false;
                $ctrl.retrieveData();
            };

            $ctrl.applyFilter = function () {
                $ctrl.filter.HasFilter = true;
                $ctrl.retrieveData();
            };

            $ctrl.close = function () {
                return $ctrl.isOpen = false;
            };

            $ctrl.checkEvent = function (keyEvent) {
                if (keyEvent.which === 13) {
                    $ctrl.applyFilter();
                    keyEvent.preventDefault();
                }
            };

            var columns = $ctrl.$component.columns.filter(function (e) {
                return e.Name === $ctrl.filter.Name;
            });

            $scope.$watch('$ctrl.filter.Operator', function (val) {
                if (val === 'None') {
                    $ctrl.filter.Text = '';
                }
            });

            if (columns.length === 0) {
                return;
            }

            $scope.$watch('$ctrl.filter', function (n) {
                if (columns[0].Filter.Text !== n.Text) {
                    n.Text = columns[0].Filter.Text;

                    if (columns[0].Filter.Operator !== n.Operator) {
                        n.Operator = columns[0].Filter.Operator;
                    }
                }

                $ctrl.filter.HasFilter = columns[0].Filter.HasFilter;
            });

            columns[0].Filter = $ctrl.filter;
            $ctrl.dataType = columns[0].DataType;
            $ctrl.filterOperators = filterOperators[$ctrl.dataType];

            if ($ctrl.dataType === dataTypes.DATE || $ctrl.dataType === dataTypes.DATE_TIME || $ctrl.dataType === dataTypes.DATE_TIME_UTC) {
                $ctrl.filter.Argument = [new Date()];

                if ($ctrl.filter.Operator === 'Contains') {
                    $ctrl.filter.Operator = 'Equals';
                }
            }

            if ($ctrl.dataType === dataTypes.NUMERIC || $ctrl.dataType === dataTypes.BOOLEAN) {
                $ctrl.filter.Argument = [1];

                if ($ctrl.filter.Operator === 'Contains') {
                    $ctrl.filter.Operator = 'Equals';
                }
            }
        };
    }]);
})(angular);
(function (angular) {
    'use strict';

    angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name tubularTranslate
     *
     * @description
     * Use `tubularTranslate` to translate strings.
     */
    .service('tubularTranslate', [function () {
        var me = this;

        me.currentLanguage = 'en';
        me.defaultLanguage = 'en';

        me.translationTable = {
            'en': {
                'EDITOR_REGEX_DOESNT_MATCH': 'The field doesn\'t match the regular expression.',
                'EDITOR_REQUIRED': 'The field is required.',
                'EDITOR_MIN_CHARS': 'The field needs to be minimum {0} chars.',
                'EDITOR_MAX_CHARS': 'The field needs to be maximum {0} chars.',
                'EDITOR_MIN_NUMBER': 'The minimum number is {0}.',
                'EDITOR_MAX_NUMBER': 'The maximum number is {0}.',
                'EDITOR_MIN_DATE': 'The minimum date is {0}.',
                'EDITOR_MAX_DATE': 'The maximum date is {0}.',
                'EDITOR_MATCH': 'The field needs to match the {0} field.',
                'CAPTION_APPLY': 'Apply',
                'CAPTION_CLEAR': 'Clear',
                'CAPTION_CLOSE': 'Close',
                'CAPTION_SELECTCOLUMNS': 'Select Columns',
                'CAPTION_FILTER': 'Filter',
                'CAPTION_VALUE': 'Value',
                'CAPTION_REMOVE': 'Remove',
                'CAPTION_CANCEL': 'Cancel',
                'CAPTION_EDIT': 'Edit',
                'CAPTION_SAVE': 'Save',
                'CAPTION_PRINT': 'Print',
                'CAPTION_LOAD': 'Load',
                'CAPTION_ADD': 'Add',
                'UI_SEARCH': 'search . . .',
                'UI_PAGESIZE': 'Page size:',
                'UI_EXPORTCSV': 'Export CSV',
                'UI_CURRENTROWS': 'Current rows',
                'UI_ALLROWS': 'All rows',
                'UI_REMOVEROW': 'Do you want to delete this row?',
                'UI_SHOWINGRECORDS': 'Showing {0} to {1} of {2} records',
                'UI_FILTEREDRECORDS': '(Filtered from {0} total records)',
                'UI_HTTPERROR': 'Unable to contact server; please, try again later.',
                'UI_GENERATEREPORT': 'Generate Report',
                'UI_TWOCOLS': 'Two columns',
                'UI_ONECOL': 'One column',
                'UI_MAXIMIZE': 'Maximize',
                'UI_RESTORE': 'Restore',
                'UI_MOVEUP': 'Move Up',
                'UI_MOVEDOWN': 'Move Down',
                'UI_MOVELEFT': 'Move Left',
                'UI_MOVERIGHT': 'Move Right',
                'UI_COLLAPSE': 'Collapse',
                'UI_EXPAND': 'Expand',
                'OP_NONE': 'None',
                'OP_EQUALS': 'Equals',
                'OP_NOTEQUALS': 'Not Equals',
                'OP_CONTAINS': 'Contains',
                'OP_NOTCONTAINS': 'Not Contains',
                'OP_STARTSWITH': 'Starts With',
                'OP_NOTSTARTSWITH': 'Not Starts With',
                'OP_ENDSWITH': 'Ends With',
                'OP_NOTENDSWITH': 'Not Ends With',
                'OP_BETWEEN': 'Between'
            },
            'es': {
                'EDITOR_REGEX_DOESNT_MATCH': 'El campo no es válido contra la expresión regular.',
                'EDITOR_REQUIRED': 'El campo es requerido.',
                'EDITOR_MIN_CHARS': 'El campo requiere mínimo {0} caracteres.',
                'EDITOR_MAX_CHARS': 'El campo requiere máximo {0} caracteres.',
                'EDITOR_MIN_NUMBER': 'El número mínimo es {0}.',
                'EDITOR_MAX_NUMBER': 'El número maximo es {0}.',
                'EDITOR_MIN_DATE': 'La fecha mínima es {0}.',
                'EDITOR_MAX_DATE': 'La fecha máxima es {0}.',
                'EDITOR_MATCH': 'El campo debe de conincidir con el campo {0}.',
                'CAPTION_APPLY': 'Aplicar',
                'CAPTION_CLEAR': 'Limpiar',
                'CAPTION_CLOSE': 'Cerrar',
                'CAPTION_SELECTCOLUMNS': 'Seleccionar columnas',
                'CAPTION_FILTER': 'Filtro',
                'CAPTION_VALUE': 'Valor',
                'CAPTION_REMOVE': 'Remover',
                'CAPTION_CANCEL': 'Cancelar',
                'CAPTION_EDIT': 'Editar',
                'CAPTION_SAVE': 'Guardar',
                'CAPTION_PRINT': 'Imprimir',
                'CAPTION_LOAD': 'Cargar',
                'CAPTION_ADD': 'Agregar',
                'UI_SEARCH': 'buscar . . .',
                'UI_PAGESIZE': '# Registros:',
                'UI_EXPORTCSV': 'Exportar CSV',
                'UI_CURRENTROWS': 'Esta página',
                'UI_ALLROWS': 'Todo',
                'UI_REMOVEROW': '¿Desea eliminar el registro?',
                'UI_SHOWINGRECORDS': 'Mostrando registros {0} al {1} de {2}',
                'UI_FILTEREDRECORDS': '(De un total de {0} registros)',
                'UI_HTTPERROR': 'No se logro contactar el servidor, intente más tarde.',
                'UI_GENERATEREPORT': 'Generar Reporte',
                'UI_TWOCOLS': 'Dos columnas',
                'UI_ONECOL': 'Una columna',
                'UI_MAXIMIZE': 'Maximizar',
                'UI_RESTORE': 'Restaurar',
                'UI_MOVEUP': 'Mover Arriba',
                'UI_MOVEDOWN': 'Mover Abajo',
                'UI_MOVELEFT': 'Mover Izquierda',
                'UI_MOVERIGHT': 'Mover Derecha',
                'UI_COLLAPSE': 'Colapsar',
                'UI_EXPAND': 'Expandir',
                'OP_NONE': 'Ninguno',
                'OP_EQUALS': 'Igual',
                'OP_NOTEQUALS': 'No Igual',
                'OP_CONTAINS': 'Contiene',
                'OP_NOTCONTAINS': 'No Contiene',
                'OP_STARTSWITH': 'Comienza Con',
                'OP_NOTSTARTSWITH': 'No Comienza Con',
                'OP_ENDSWITH': 'Termina Con',
                'OP_NOTENDSWITH': 'No Termina Con',
                'OP_BETWEEN': 'Entre'
            }
        };

        // TODO: Check translationTable first
        me.setLanguage = function (language) {
            return me.currentLanguage = language;
        };

        me.addTranslation = function (language, key, value) {
            var languageTable = me.translationTable[language] || me.translationTable[me.currentLanguage] || me.translationTable[me.defaultLanguage];
            languageTable[key] = value;
        };

        me.translate = function (key) {
            var languageTable = me.translationTable[me.currentLanguage] || me.translationTable[me.defaultLanguage];

            return languageTable[key] || key;
        };
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('tubular.services').provider('tubularConfig', function () {

        var provider = this;
        provider.platform = {};
        var PLATFORM = 'platform';

        var configProperties = {
            webApi: {
                tokenUrl: PLATFORM,
                refreshTokenUrl: PLATFORM,
                enableRefreshTokens: PLATFORM,
                requireAuthentication: PLATFORM,
                baseUrl: PLATFORM,
                urlWhiteList: PLATFORM
            },
            platform: {},
            localStorage: {
                prefix: PLATFORM
            }
        };

        createConfig(configProperties, provider, '');

        // Default
        // -------------------------
        setPlatformConfig('default', {
            webApi: {
                tokenUrl: '/api/token',
                refreshTokenUrl: '/api/token',
                enableRefreshTokens: false,
                requireAuthentication: true,
                baseUrl: '/api',
                urlWhiteList: []
            },
            localStorage: {
                prefix: 'tubular.'
            }
        });

        // private: used to set platform configs
        function setPlatformConfig(platformName, platformConfigs) {
            configProperties.platform[platformName] = platformConfigs;
            provider.platform[platformName] = {};

            addConfig(configProperties, configProperties.platform[platformName]);

            createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
        }

        // add new platform configs
        function addConfig(configObj, platformObj) {
            for (var n in configObj) {
                if (n != PLATFORM && configObj.hasOwnProperty(n)) {
                    if (angular.isObject(configObj[n])) {
                        if (angular.isUndefined(platformObj[n])) {
                            platformObj[n] = {};
                        }
                        addConfig(configObj[n], platformObj[n]);
                    } else if (angular.isUndefined(platformObj[n])) {
                        platformObj[n] = null;
                    }
                }
            }
        }

        // create get/set methods for each config
        function createConfig(configObj, providerObj, platformPath) {
            angular.forEach(configObj, function (value, namespace) {

                if (angular.isObject(configObj[namespace])) {
                    // recursively drill down the config object so we can create a method for each one
                    providerObj[namespace] = {};
                    createConfig(configObj[namespace], providerObj[namespace], platformPath + '.' + namespace);
                } else {
                    // create a method for the provider/config methods that will be exposed
                    providerObj[namespace] = function (newValue) {
                        if (arguments.length) {
                            configObj[namespace] = newValue;
                            return providerObj;
                        }
                        if (configObj[namespace] == PLATFORM) {
                            // if the config is set to 'platform', then get this config's platform value
                            // var platformConfig = stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
                            // if (platformConfig || platformConfig === false) {
                            //     return platformConfig;
                            // }
                            // didnt find a specific platform config, now try the default
                            return stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
                        }
                        return configObj[namespace];
                    };
                }
            });
        }

        function stringObj(obj, str) {
            str = str.split('.');
            for (var i = 0; i < str.length; i++) {
                if (obj && angular.isDefined(obj[str[i]])) {
                    obj = obj[str[i]];
                } else {
                    return null;
                }
            }
            return obj;
        }

        provider.setPlatformConfig = setPlatformConfig;

        // private: Service definition for internal Tubular use
        provider.$get = function () {
            return provider;
        };
    });
})(angular);
