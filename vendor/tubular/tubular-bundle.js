(function(angular) {
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
  angular.module('tubular', ['tubular.directives', 'tubular.services', 'tubular.models'])


})(angular);

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
    angular.module('tubular.directives', ['tubular.models','tubular.services'])
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
                        '$scope', function($scope) {
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
         */
        .directive('tbColumnDefinitions', [function() {
                return {
                    require: '^tbGridTable',
                    templateUrl: 'tbColumnDefinitions.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column-definitions';
                        }
                    ],
                    compile: () => ({ post: scope => scope.$component.hasColumnsDefinitions = true })
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
                    controller: [
                        '$scope', function ($scope) {
                            $scope.column = { Label: '' };
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column';
                            $scope.label = $scope.label || ($scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');

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

                            const column = new function () {
                                this.Name = $scope.name || null;
                                this.Label = $scope.label || null;
                                this.Sortable = $scope.sortable;
                                this.SortOrder = parseInt($scope.sortOrder) || -1;
                                this.SortDirection = function () {
                                    if (angular.isUndefined($scope.sortDirection)) {
                                        return 'None';
                                    }

                                    if ($scope.sortDirection.toLowerCase().indexOf('asc') === 0) {
                                        return 'Ascending';
                                    }

                                    if ($scope.sortDirection.toLowerCase().indexOf('desc') === 0) {
                                        return 'Descending';
                                    }

                                    return 'None';
                                }();

                                this.IsKey = angular.isDefined($scope.isKey) ? $scope.isKey : false;
                                this.Searchable = angular.isDefined($scope.searchable) ? $scope.searchable : false;
                                this.Visible = $scope.visible === 'false' ? false : true;
                                this.Filter = null;
                                this.DataType = $scope.columnType || 'string';
                                this.Aggregate = $scope.aggregate || 'none';
                            };

                            $scope.$component.addColumn(column);
                            $scope.column = column;
                            $scope.label = column.Label;
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
                        '$scope', function($scope) {
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
                        '$scope', function($scope) {
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
                        '$scope', function($scope) {
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
                        '$scope', function($scope) {
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
                    compile: ()  => ({ post: scope => $timeout(() => scope.hasFieldsDefinitions = true, 300) })
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
                    controller: ['$scope', function($scope) {
                            $scope.column = { Visible: true };
                            $scope.columnName = $scope.columnName || null;
                            $scope.$component = $scope.$parent.$parent.$component;

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
(function(angular){
angular.module('tubular.directives').run(['$templateCache', function ($templateCache) {
  "use strict";
  $templateCache.put("tbCheckboxField.tpl.html",
    "<div ng-class=\"{ 'checkbox' : $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\" class=tubular-checkbox><input type=checkbox ng-model=$ctrl.value ng-disabled=\"$ctrl.readOnly || !$ctrl.isEditing\" class=tubular-checkbox id={{$ctrl.name}} name={{$ctrl.name}}><label ng-show=$ctrl.isEditing for={{$ctrl.name}} ng-bind=$ctrl.label></label><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbDropdownEditor.tpl.html",
    "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.readOnlyValue></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><select ng-options=\"{{ $ctrl.selectOptions }}\" ng-show=$ctrl.isEditing ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-disabled=$ctrl.readOnly name={{$ctrl.name}} ng-change=\"onChange({value: value})\"></select><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbNumericEditor.tpl.html",
    "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing>{{$ctrl.value | numberorcurrency: format }}</span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><div class=input-group ng-show=$ctrl.isEditing><div class=input-group-addon ng-hide=\"$ctrl.format == 'I'\"><i ng-class=\"{ 'fa': true, 'fa-calculator': $ctrl.format != 'C', 'fa-usd': $ctrl.format == 'C'}\"></i></div><input type=number placeholder={{$ctrl.placeholder}} ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-hide=$ctrl.readOnly step=\"{{$ctrl.step || 'any'}}\" name={{$ctrl.name}}><p class=\"form-control form-control-static text-right\" ng-show=$ctrl.readOnly>{{$ctrl.value | numberorcurrency: format}}</p></div><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbSimpleEditor.tpl.html",
    "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.value></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><input type={{$ctrl.editorType}} placeholder={{$ctrl.placeholder}} ng-show=$ctrl.isEditing ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-readonly=$ctrl.readOnly name={{$ctrl.name}}> <span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbTextArea.tpl.html",
    "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.value></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><textarea ng-show=$ctrl.isEditing placeholder={{$ctrl.placeholder}} ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-readonly=$ctrl.readOnly name={{$ctrl.name}}></textarea><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbForm.tpl.html",
    "<form ng-transclude name={{name}}></form>");
  $templateCache.put("tbEditButton.tpl.html",
    "<button ng-click=$ctrl.edit() class=\"btn btn-xs btn-default\" ng-hide=$ctrl.model.$isEditing>{{:: $ctrl.caption || ('CAPTION_EDIT' | translate) }}</button>");
  $templateCache.put("tbExportButton.tpl.html",
    "<div class=btn-group uib-dropdown><button class=\"btn btn-info btn-sm {{::$ctrl.css}}\" uib-dropdown-toggle><span class=\"fa fa-download\"></span>&nbsp;{{:: $ctrl.caption || ('UI_EXPORTCSV' | translate)}}&nbsp;<span class=caret></span></button><ul class=dropdown-menu uib-dropdown-menu><li><a href=javascript:void(0) ng-click=$ctrl.downloadCsv($parent)>{{:: $ctrl.captionMenuCurrent || ('UI_CURRENTROWS' | translate)}}</a></li><li><a href=javascript:void(0) ng-click=$ctrl.downloadAllCsv($parent)>{{:: $ctrl.captionMenuAll || ('UI_ALLROWS' | translate)}}</a></li></ul></div>");
  $templateCache.put("tbGridPager.tpl.html",
    "<div class=tubular-pager><ul uib-pagination ng-disabled=$ctrl.$component.isEmpty direction-links=true first-text=&#xf049; previous-text=&#xf04a; next-text=&#xf04e; last-text=&#xf050; boundary-links=true total-items=$ctrl.$component.filteredRecordCount items-per-page=$ctrl.$component.pageSize max-size=5 ng-model=$ctrl.$component.currentPage ng-change=$ctrl.pagerPageChanged()></ul></div>");
  $templateCache.put("tbGridPagerInfo.tpl.html",
    "<div class=\"pager-info small\" ng-hide=$ctrl.$component.isEmpty>{{'UI_SHOWINGRECORDS' | translate: $ctrl.currentInitial:$ctrl.currentTop:$ctrl.$component.filteredRecordCount}} <span ng-show=$ctrl.filtered>{{'UI_FILTEREDRECORDS' | translate: $ctrl.$component.totalRecordCount}}</span></div>");
  $templateCache.put("tbPageSizeSelector.tpl.html",
    "<div class={{::$ctrl.css}}><form class=form-inline><div class=form-group><label class=small>{{:: $ctrl.caption || ('UI_PAGESIZE' | translate) }}</label>&nbsp;<select ng-model=$ctrl.$component.pageSize class=\"form-control input-sm {{::$ctrl.selectorCss}}\" ng-options=\"item for item in options\"></select></div></form></div>");
  $templateCache.put("tbPrintButton.tpl.html",
    "<button class=\"btn btn-default btn-sm\" ng-click=$ctrl.printGrid()><span class=\"fa fa-print\"></span>&nbsp;{{:: $ctrl.caption || ('CAPTION_PRINT' | translate)}}</button>");
  $templateCache.put("tbRemoveButton.tpl.html",
    "<button class=\"btn btn-danger btn-xs btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=right popover-title=\"{{ $ctrl.legend || ('UI_REMOVEROW' | translate) }}\" popover-is-open=$ctrl.isOpen popover-trigger=\"'click outsideClick'\" ng-hide=$ctrl.model.$isEditing><span ng-show=$ctrl.showIcon class={{::$ctrl.icon}}></span> <span ng-show=$ctrl.showCaption>{{:: $ctrl.caption || ('CAPTION_REMOVE' | translate) }}</span></button>");
  $templateCache.put("tbRemoveButtonPopover.tpl.html",
    "<div class=tubular-remove-popover><button ng-click=$ctrl.delete() class=\"btn btn-danger btn-xs\">{{:: $ctrl.caption || ('CAPTION_REMOVE' | translate) }}</button> &nbsp; <button ng-click=\"$ctrl.isOpen = false;\" class=\"btn btn-default btn-xs\">{{:: $ctrl.cancelCaption || ('CAPTION_CANCEL' | translate) }}</button></div>");
  $templateCache.put("tbSaveButton.tpl.html",
    "<div ng-show=model.$isEditing><button ng-click=save() class=\"btn btn-default {{:: saveCss || '' }}\" ng-disabled=!model.$valid()>{{:: saveCaption || ('CAPTION_SAVE' | translate) }}</button> <button ng-click=cancel() class=\"btn {{:: cancelCss || 'btn-default' }}\">{{:: cancelCaption || ('CAPTION_CANCEL' | translate) }}</button></div>");
  $templateCache.put("tbTextSearch.tpl.html",
    "<div class=tubular-grid-search><div class=\"input-group input-group-sm\"><span class=input-group-addon><i class=\"fa fa-search\"></i> </span><input type=search name=tbTextSearchInput class=form-control placeholder=\"{{:: $ctrl.placeholder || ('UI_SEARCH' | translate) }}\" maxlength=20 ng-model=$ctrl.$component.search.Text ng-model-options=\"{ debounce: 300 }\"> <span id=tb-text-search-reset-panel class=input-group-btn ng-show=\"$ctrl.$component.search.Text.length > 0\"><button id=tb-text-search-reset-button class=\"btn btn-default\" uib-tooltip=\"{{'CAPTION_CLEAR' | translate}}\" ng-click=\"$ctrl.$component.search.Text = ''\"><i class=\"fa fa-times-circle\"></i></button></span></div></div>");
  $templateCache.put("tbColumnDateTimeFilter.tpl.html",
    "<div class=tubular-column-menu><button class=\"btn btn-xs btn-default btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=bottom popover-title={{$ctrl.filterTitle}} popover-is-open=$ctrl.isOpen popover-trigger=\"'outsideClick'\" ng-class=\"{ 'btn-success': $ctrl.filter.HasFilter }\"><i class=\"fa fa-filter\"></i></button></div>");
  $templateCache.put("tbColumnFilter.tpl.html",
    "<div class=tubular-column-menu><button class=\"btn btn-xs btn-default btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=bottom popover-title={{$ctrl.filterTitle}} popover-is-open=$ctrl.isOpen popover-trigger=\"'click outsideClick'\" ng-class=\"{ 'btn-success': $ctrl.filter.HasFilter }\"><i class=\"fa fa-filter\"></i></button></div>");
  $templateCache.put("tbColumnFilterPopover.tpl.html",
    "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=form-control ng-options=\"key as value for (key , value) in $ctrl.filterOperators\" ng-model=$ctrl.filter.Operator ng-hide=\"$ctrl.dataType == 'boolean' || $ctrl.onlyContains\"></select>&nbsp; <input class=form-control type=search ng-model=$ctrl.filter.Text autofocus ng-keypress=$ctrl.checkEvent($event) ng-hide=\"$ctrl.dataType == 'boolean'\" placeholder=\"{{'CAPTION_VALUE' | translate}}\" ng-disabled=\"$ctrl.filter.Operator == 'None'\"><div class=text-center ng-show=\"$ctrl.dataType == 'boolean'\"><button type=button class=\"btn btn-default btn-md\" ng-disabled=\"$ctrl.filter.Text === true\" ng-click=\"$ctrl.filter.Text = true; $ctrl.filter.Operator = 'Equals';\"><i class=\"fa fa-check\"></i></button>&nbsp; <button type=button class=\"btn btn-default btn-md\" ng-disabled=\"$ctrl.filter.Text === false\" ng-click=\"$ctrl.filter.Text = false; $ctrl.filter.Operator = 'Equals';\"><i class=\"fa fa-times\"></i></button></div><input type=search class=form-control ng-model=$ctrl.filter.Argument[0] ng-keypress=$ctrl.checkEvent($event) ng-show=\"$ctrl.filter.Operator == 'Between'\"><hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
  $templateCache.put("tbColumnOptionsFilter.tpl.html",
    "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=\"form-control checkbox-list\" ng-options=\"item.Key as item.Label for item in $ctrl.optionsItems\" ng-model=$ctrl.filter.Argument multiple ng-disabled=\"$ctrl.dataIsLoaded == false\"></select>&nbsp;<hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
  $templateCache.put("tbColumnSelector.tpl.html",
    "<button class=\"btn btn-sm btn-default\" ng-click=$ctrl.openColumnsSelector() ng-bind=\"'CAPTION_SELECTCOLUMNS' | translate\"></button>");
  $templateCache.put("tbColumnSelectorDialog.tpl.html",
    "<div class=modal-header><h3 class=modal-title ng-bind=\"'CAPTION_SELECTCOLUMNS' | translate\"></h3></div><div class=modal-body><table class=\"table table-bordered table-responsive table-striped table-hover table-condensed\"><thead><tr><th>Visible?</th><th>Name</th></tr></thead><tbody><tr ng-repeat=\"col in Model\"><td><input type=checkbox ng-model=col.Visible ng-disabled=\"col.Visible && isInvalid()\"></td><td ng-bind=col.Label></td></tr></tbody></table></div><div class=modal-footer><button class=\"btn btn-warning\" ng-click=closePopup() ng-bind=\"'CAPTION_CLOSE' | translate\"></button></div>");
  $templateCache.put("tbCellTemplate.tpl.html",
    "<td ng-transclude ng-show=column.Visible data-label={{::column.Label}} style=height:auto></td>");
  $templateCache.put("tbColumnDefinitions.tpl.html",
    "<thead><tr ng-transclude></tr></thead>");
  $templateCache.put("tbColumnFilterButtons.tpl.html",
    "<div class=text-right><button class=\"btn btn-sm btn-success\" ng-click=$ctrl.currentFilter.applyFilter() ng-disabled=\"$ctrl.currentFilter.filter.Operator == 'None'\" ng-bind=\"'CAPTION_APPLY' | translate\"></button>&nbsp; <button class=\"btn btn-sm btn-danger\" ng-click=$ctrl.currentFilter.clearFilter() ng-bind=\"'CAPTION_CLEAR' | translate\"></button></div>");
  $templateCache.put("tbColumnHeader.tpl.html",
    "<span><a title=\"Click to sort. Press Ctrl to sort by multiple columns\" class=column-header href ng-click=sortColumn($event)><span class=column-header-default>{{ $parent.column.Label }}</span><ng-transclude></ng-transclude></a><i class=\"fa sort-icon\" ng-class=\"{'fa-long-arrow-up': $parent.column.SortDirection == 'Ascending', 'fa-long-arrow-down': $parent.column.SortDirection == 'Descending'}\">&nbsp;</i></span>");
  $templateCache.put("tbFootSet.tpl.html",
    "<tfoot ng-transclude></tfoot>");
  $templateCache.put("tbGrid.tpl.html",
    "<div><div class=tubular-overlay ng-show=\"$ctrl.showLoading && $ctrl.currentRequest != null\"><div><div class=\"fa fa-refresh fa-2x fa-spin\"></div></div></div><ng-transclude></ng-transclude></div>");
  $templateCache.put("tbGridTable.tpl.html",
    "<table ng-transclude class=\"table tubular-grid-table\"></table>");
  $templateCache.put("tbRowSet.tpl.html",
    "<tbody ng-transclude></tbody>");
  $templateCache.put("tbRowTemplate.tpl.html",
    "<tr ng-transclude></tr>");
}]);
})(angular);

(angular => {
    'use strict';

    const tbSimpleEditorCtrl = ['tubularEditorService', '$scope', 'translateFilter', 'filterFilter',
        function (tubular, $scope, translateFilter, filterFilter) {
            const $ctrl = this;

            $ctrl.validate = () => {
                if ($ctrl.regex && $ctrl.value) {
                    const patt = new RegExp($ctrl.regex);

                    if (patt.test($ctrl.value) === false) {
                        $ctrl.$valid = false;
                        $ctrl.state.$errors = [$ctrl.regexErrorMessage || translateFilter('EDITOR_REGEX_DOESNT_MATCH')];
                        return;
                    }
                }

                if ($ctrl.match) {
                    if ($ctrl.value !== $ctrl.$component.model[$ctrl.match]) {
                        const label = filterFilter($ctrl.$component.fields, { name: $ctrl.match }, true)[0].label;
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

            $ctrl.$onInit = () => tubular.setupScope($scope, null, $ctrl, false);
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
        .component('tbSimpleEditor',
        {
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
(angular => {
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
        .directive('tbForm',
        [
            function() {
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
                        name: '@?formName'
                    },
                    controller: 'tbFormController',
                    compile: () => ({ post: scope => scope.finishDefinition() })
                };
            }
        ]);
})(angular);
(angular => {
    'use strict';
    let tbFormCounter = 0;

    angular.module('tubular.directives')
        .controller('tbFormController',
        [
            '$scope',
            '$timeout',
            '$element',
            'tubularModel',
            '$http',
            function (
                $scope,
                $timeout,
                $element,
                TubularModel,
                $http) {
                // we need this to find the parent of a field
                $scope.tubularDirective = 'tubular-form';
                $scope.hasFieldsDefinitions = false;
                $scope.fields = [];

                function getUrlWithKey() {
                    const urlData = $scope.serverUrl.split('?');
                    let getUrl = urlData[0] + $scope.modelKey;

                    if (urlData.length > 1) {
                        getUrl += `?${  urlData[1]}`;
                    }

                    return getUrl;
                }

                const $ctrl = this;

                $ctrl.serverSaveMethod = $scope.serverSaveMethod || 'POST';
                $ctrl.name = $scope.name || (`tbForm${  tbFormCounter++}`);

                // This method is meant to provide a reference to the Angular Form
                // so we can get information about: $pristine, $dirty, $submitted, etc.
                $scope.getFormScope = () => $scope[$element.attr('name')];

                // Setup require authentication
                $ctrl.requireAuthentication = angular.isUndefined($scope.requireAuthentication)
                    ? true
                    : $scope.requireAuthentication;

                $scope.$watch('hasFieldsDefinitions', newVal => {
                    if (newVal) {
                        $ctrl.retrieveData();
                    }
                });

                $scope.cloneModel = model => {
                    const data = {};

                    angular.forEach(model, (value, key) => {
                        if (key[0] !== '$') {
                            data[key] = value;
                        }
                    });

                    $scope.model = new TubularModel($scope, data);
                    $ctrl.bindFields();
                };

                $ctrl.bindFields = () => angular.forEach($scope.fields, field => field.bindScope());

                $ctrl.retrieveData = function () {
                    if (angular.isDefined($scope.serverUrl)) {
                        $http.get(getUrlWithKey(), {
                            requireAuthentication: $ctrl.requireAuthentication
                        }).then(response => {
                            $scope.model = new TubularModel($scope.model && $scope.model.$component || $scope, response.data);
                            $ctrl.bindFields();
                            $scope.model.$isNew = true;
                        }, error => $scope.$emit('tbForm_OnConnectionError', error));

                        return;
                    }

                    if (angular.isUndefined($scope.model)) {
                        $scope.model = new TubularModel($scope, {});
                    }

                    $ctrl.bindFields();
                };

                $scope.save = (forceUpdate, keepData) => {
                    if (!$scope.model.$valid()) {
                        return;
                    }

                    if (!forceUpdate && !$scope.model.$isNew && !$scope.model.$hasChanges()) {
                        $scope.$emit('tbForm_OnSavingNoChanges', $scope);
                        return;
                    }

                    $scope.model.$isLoading = true;

                    $scope.currentRequest = $http({
                        data: $scope.model,
                        url: $ctrl.serverSaveUrl,
                        method: $scope.model.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT',
                        requireAuthentication: $ctrl.requireAuthentication
                    });

                    $scope.currentRequest.then(response => {
                        const data = response.data;

                        $scope.$emit('tbForm_OnSuccessfulSave', data, $scope);

                        if (!keepData) {
                            $scope.clear();
                        }

                        const formScope = $scope.getFormScope();

                        if (formScope) {
                            formScope.$setPristine();
                        }
                    }, error => $scope.$emit('tbForm_OnConnectionError', error, $scope))
                        .then(() => {
                            $scope.model.$isLoading = false;
                            $scope.currentRequest = null;
                        });
                };

                // alias to save
                $scope.update = $scope.save;

                $scope.create = () => {
                    $scope.model.$isNew = true;
                    $scope.save();
                };

                $scope.cancel = () => {
                    $scope.$emit('tbForm_OnCancel', $scope.model);
                    $scope.clear();
                };

                $scope.clear = () => {
                    angular.forEach($scope.fields, (field) => {
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

                $scope.finishDefinition = () => {
                    const timer = $timeout(() => {
                        $scope.hasFieldsDefinitions = true;

                        if ($element.find('input').length > 0) {
                            $element.find('input')[0].focus();
                        }
                    }, 0);

                    $scope.$emit('tbForm_OnGreetParentController', { controller: $ctrl, scope: $scope });

                    $scope.$on('$destroy', () => $timeout.cancel(timer));
                };
            }
        ]);
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

    angular.module('tubular.directives')
        .controller('tbTextSearchController', [
            '$scope', function ($scope) {
                const $ctrl = this;

                $ctrl.$onInit = () => {
                    $ctrl.minChars = $ctrl.minChars || 3;
                    $ctrl.lastSearch = $ctrl.$component.search.Text;
                };

                $scope.$watch('$ctrl.$component.search.Text', (val, prev) => {
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
            }
        ]);


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
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverDeleteUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverSaveMethod Set HTTP Method to save data.
         * @param {int} pageSize Define how many records to show in a page, default 20.
         * @param {string} requestMethod Set HTTP Method to get data.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {string} gridName Grid's name, used to store metainfo in localstorage.
         * @param {string} editorMode Define if grid is read-only or it has editors (inline or popup).
         * @param {bool} showLoading Set if an overlay will show when it's loading data, default true.
         * @param {bool} autoRefresh Set if the grid refresh after any insertion or update, default true.
         * @param {bool} savePage Set if the grid autosave current page, default true.
         * @param {bool} savePageSize Set if the grid autosave page size, default true.
         * @param {bool} saveSearchText Set if the grid autosave search text, default true.
         */
        .component('tbGrid',
        {
            templateUrl: 'tbGrid.tpl.html',
            transclude: true,
            bindings: {
                serverUrl: '@',
                serverSaveUrl: '@',
                serverDeleteUrl: '@',
                serverSaveMethod: '@',
                pageSize: '=?',
                requestMethod: '@',
                requireAuthentication: '@?',
                name: '@?gridName',
                editorMode: '@?',
                showLoading: '=?',
                autoRefresh: '=?',
                savePage: '=?',
                savePageSize: '=?',
                saveSearchText: '=?'
            },
            controller: 'tbGridController'
        });
})(angular);
(angular => {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbGridController',
        [
            '$scope',
            'tubularPopupService',
            'tubularModel',
            '$http',
            '$routeParams',
            'tubularConfig',
            '$window',
            function (
                $scope,
                tubularPopupService,
                TubularModel,
                $http,
                $routeParams,
                tubularConfig,
                $window) {
                const $ctrl = this;
                const prefix = tubularConfig.localStorage.prefix();
                const storage = $window.localStorage;

                $ctrl.$onInit = () => {
                    $ctrl.tubularDirective = 'tubular-grid';

                    $ctrl.name = $ctrl.name || 'tbgrid';
                    $ctrl.columns = [];
                    $ctrl.rows = [];

                    $ctrl.savePage = angular.isUndefined($ctrl.savePage) ? true : $ctrl.savePage;
                    $ctrl.currentPage = $ctrl.savePage ? (parseInt(storage.getItem(`${prefix + $ctrl.name  }_page`)) || 1) : 1;
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
                    $ctrl.autoSearch = $routeParams.param ||
                        ($ctrl.saveSearchText ? (storage.getItem(`${prefix + $ctrl.name  }_search`) || '') : '');
                    $ctrl.search = {
                        Text: $ctrl.autoSearch,
                        Operator: $ctrl.autoSearch === '' ? 'None' : 'Auto'
                    };

                    $ctrl.isEmpty = false;
                    $ctrl.tempRow = new TubularModel($ctrl, {});
                    $ctrl.requireAuthentication = $ctrl.requireAuthentication ? ($ctrl.requireAuthentication === 'true') : true;
                    $ctrl.editorMode = $ctrl.editorMode || 'none';
                    $ctrl.canSaveState = false;
                    $ctrl.showLoading = angular.isUndefined($ctrl.showLoading) ? true : $ctrl.showLoading;
                    $ctrl.autoRefresh = angular.isUndefined($ctrl.autoRefresh) ? true : $ctrl.autoRefresh;
                    $ctrl.serverDeleteUrl = $ctrl.serverDeleteUrl || $ctrl.serverSaveUrl;

                    // Emit a welcome message
                    $scope.$emit('tbGrid_OnGreetParentController', $ctrl);
                };

                $scope.columnWatcher = () => {
                    if ($ctrl.hasColumnsDefinitions === false || $ctrl.canSaveState === false) {
                        return;
                    }

                    storage.setItem(`${prefix + $ctrl.name  }_columns`, angular.toJson($ctrl.columns));
                };

                $scope.$watch('$ctrl.columns', $scope.columnWatcher, true);

                $scope.serverUrlWatcher = (newVal, prevVal) => {
                    if ($ctrl.hasColumnsDefinitions === false || $ctrl.currentRequest || newVal === prevVal) {
                        return;
                    }

                    $ctrl.retrieveData();
                };

                $scope.$watch('$ctrl.serverUrl', $scope.serverUrlWatcher);

                $scope.hasColumnsDefinitionsWatcher = newVal => {
                    if (newVal !== true) {
                        return;
                    }

                    $ctrl.retrieveData();
                };

                $scope.$watch('$ctrl.hasColumnsDefinitions', $scope.hasColumnsDefinitionsWatcher);

                $scope.pageSizeWatcher =  () => {
                    if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                        if ($ctrl.savePageSize) {
                            storage.setItem(`${prefix + $ctrl.name  }_pageSize`, $ctrl.pageSize);
                        }

                        $ctrl.retrieveData();
                    }
                };

                $scope.$watch('$ctrl.pageSize', $scope.pageSizeWatcher);

                $scope.requestedPageWatcher = () => {
                    if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                        $ctrl.retrieveData();
                    }
                };

                $scope.$watch('$ctrl.requestedPage', $scope.requestedPageWatcher);

                $ctrl.saveSearch = () => {
                    if (!$ctrl.saveSearchText) {
                        return;
                    }

                    if ($ctrl.search.Text === '') {
                        storage.removeItem(`${prefix + $ctrl.name  }_search`);
                    } else {
                        storage.setItem(`${prefix + $ctrl.name  }_search`, $ctrl.search.Text);
                    }
                };

                $ctrl.addColumn = item => {
                    if (item.Name == null){
                        return;
                    }

                    if ($ctrl.hasColumnsDefinitions !== false) {
                        throw 'Cannot define more columns. Column definitions have been sealed';
                    }

                    $ctrl.columns.push(item);
                };

                $ctrl.newRow = (template, popup, size, data) => {
                    $ctrl.tempRow = new TubularModel($ctrl, data || {});
                    $ctrl.tempRow.$isNew = true;
                    $ctrl.tempRow.$isEditing = true;
                    $ctrl.tempRow.$component = $ctrl;

                    if (angular.isDefined(template) && angular.isDefined(popup) && popup) {
                        tubularPopupService.openDialog(template, $ctrl.tempRow, $ctrl, size);
                    }
                };

                $ctrl.deleteRow = row => {
                    const urlparts = $ctrl.serverDeleteUrl.split('?');
                    let url = `${urlparts[0]  }/${  row.$key}`;

                    if (urlparts.length > 1) {
                        url += `?${  urlparts[1]}`;
                    }

                    $ctrl.currentRequest = $http.delete(url, {
                        requireAuthentication: $ctrl.requireAuthentication
                    })
                    .then(response => $scope.$emit('tbGrid_OnRemove', response.data),
                        error => $scope.$emit('tbGrid_OnConnectionError', error))
                    .then(() => {
                        $ctrl.currentRequest = null;
                        $ctrl.retrieveData();
                    });
                };

                function addTimeZoneToUrl(url) {
                    return `${url +
                        (url.indexOf('?') === -1 ? '?' : '&')
                        }timezoneOffset=${
                        new Date().getTimezoneOffset()}`;
                }

                $ctrl.saveRow = (row, forceUpdate) => {
                    if (!$ctrl.serverSaveUrl) {
                        throw 'Define a Save URL.';
                    }

                    if (!forceUpdate && !row.$isNew && !row.$hasChanges()) {
                        row.$isEditing = false;
                        return null;
                    }

                    row.$isLoading = true;
                    const component = row.$component;
                    row.$component = null;
                    const clone = angular.copy(row);
                    row.$component = component;

                    const originalClone = angular.copy(row.$original);

                    delete clone.$isEditing;
                    delete clone.$original;
                    delete clone.$state;
                    delete clone.$valid;
                    delete clone.$component;
                    delete clone.$isLoading;
                    delete clone.$isNew;

                    $ctrl.currentRequest = $http({
                        url: row.$isNew ? addTimeZoneToUrl($ctrl.serverSaveUrl) : $ctrl.serverSaveUrl,
                        method: row.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT',
                        data: row.$isNew ? clone : {
                            Old: originalClone,
                            New: clone,
                            TimezoneOffset: new Date().getTimezoneOffset()
                        }
                    });

                    $ctrl.currentRequest.then(data => {
                        $scope.$emit('tbForm_OnSuccessfulSave', data);
                        row.$isLoading = false;
                        row.$isEditing = false;
                        $ctrl.currentRequest = null;
                        $ctrl.retrieveData();
                        
                        return data;
                    }, error => {
                        $scope.$emit('tbForm_OnConnectionError', error);
                        row.$isLoading = false;
                        $ctrl.currentRequest = null;

                        return error;
                    });

                    return $ctrl.currentRequest;
                };

                $ctrl.verifyColumns = () => {
                    const columns = angular.fromJson(storage.getItem(`${prefix + $ctrl.name  }_columns`));
                    if (columns == null || columns === '') {
                        // Nothing in settings, saving initial state
                        storage.setItem(`${prefix + $ctrl.name  }_columns`, angular.toJson($ctrl.columns));
                        return;
                    }

                    angular.forEach(columns, column => {
                            const filtered = $ctrl.columns.filter(el => el.Name === column.Name);

                            if (filtered.length === 0) {
                                return;
                            }

                            const current = filtered[0];
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

                            if (column.Filter != null &&
                                column.Filter.Text != null &&
                                column.Filter.Operator !== 'None') {
                                current.Filter = column.Filter;
                            }
                        });
                };

                $ctrl.getRequestObject = skip => {
                    if (skip === -1) {
                        skip = ($ctrl.requestedPage - 1) * $ctrl.pageSize;
                        if (skip < 0) skip = 0;
                    }

                    return {
                        url: $ctrl.serverUrl,
                        method: $ctrl.requestMethod || 'POST',
                        requireAuthentication: $ctrl.requireAuthentication,
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

                $ctrl.retrieveData = () => {
                    // If the ServerUrl is empty skip data load
                    if (!$ctrl.serverUrl || $ctrl.currentRequest !== null) {
                        return;
                    }

                    $ctrl.canSaveState = true;
                    $ctrl.verifyColumns();

                    if ($ctrl.savePageSize) {
                        $ctrl.pageSize = (parseInt(storage.getItem(`${prefix + $ctrl.name  }_pageSize`)) || $ctrl.pageSize);
                    }

                    $ctrl.pageSize = $ctrl.pageSize < 10 ? 20 : $ctrl.pageSize; // default

                    const newPages = Math.ceil($ctrl.totalRecordCount / $ctrl.pageSize);
                    if ($ctrl.requestedPage > newPages) $ctrl.requestedPage = newPages;

                    const request = $ctrl.getRequestObject(-1);

                    $scope.$emit('tbGrid_OnBeforeRequest', request, $ctrl);

                    $ctrl.currentRequest = $http(request);

                    $ctrl.currentRequest.then($ctrl.processPayload, error => {
                        $ctrl.requestedPage = $ctrl.currentPage;
                        $scope.$emit('tbGrid_OnConnectionError', error);
                    }).then(() => $ctrl.currentRequest = null);
                };

                $ctrl.processPayload = response => {
                    $ctrl.requestCounter += 1;

                    if (!response || !response.data) {
                        $scope.$emit('tbGrid_OnConnectionError',
                            {
                                statusText: 'Data is empty',
                                status: 0
                            });

                        return;
                    }

                    const data = response.data;

                    $ctrl.dataSource = data;

                    if (!data.Payload) {
                        $scope.$emit('tbGrid_OnConnectionError', `tubularGrid(${$ctrl.$id}): response is invalid.`);
                        return;
                    }

                    $ctrl.rows = data.Payload.map(el => {
                        const model = new TubularModel($ctrl, el);
                        model.$component = $ctrl;

                        model.editPopup = (template, size) => {
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
                        storage.setItem(`${prefix + $ctrl.name  }_page`, $ctrl.currentPage);
                    }
                };

                $ctrl.sortColumn = (columnName, multiple) => {
                    const filterColumn = $ctrl.columns.filter(el => el.Name === columnName);

                    if (filterColumn.length === 0) {
                        return;
                    }

                    const column = filterColumn[0];

                    if (column.Sortable === false) {
                        return;
                    }

                    // need to know if it's currently sorted before we reset stuff
                    const currentSortDirection = column.SortDirection;
                    const toBeSortDirection = currentSortDirection === 'None'
                        ? 'Ascending'
                        : currentSortDirection === 'Ascending' ? 'Descending' : 'None';

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
                        angular.forEach($ctrl.columns.filter(col => col.Name !== columnName),
                            col => {
                                col.SortOrder = -1;
                                col.SortDirection = 'None';
                            });
                    }

                    // take the columns that actually need to be sorted in order to re-index them
                    const currentlySortedColumns = $ctrl.columns.filter(col => col.SortOrder > 0);

                    // re-index the sort order
                    currentlySortedColumns.sort((a, b) => a.SortOrder === b.SortOrder ? 0 : a.SortOrder > b.SortOrder);

                    angular.forEach(currentlySortedColumns, (col, index) => col.SortOrder = index + 1);

                    $scope.$broadcast('tbGrid_OnColumnSorted');
                    $ctrl.retrieveData();
                };

                $ctrl.getFullDataSource = () => {
                    const request = $ctrl.getRequestObject(0);
                    request.data.Take = -1;
                    request.data.Search = {
                        Text: '',
                        Operator: 'None'
                    };

                    return $http(request)
                        .then(response => response.data.Payload,
                            error => $scope.$emit('tbGrid_OnConnectionError', error))
                        .then(() => $ctrl.currentRequest = null);
                };

                $ctrl.visibleColumns = () => $ctrl.columns.filter(el => el.Visible).length;
            }
        ]);
})(angular);

((angular, moment) => {
    'use strict';

    // Fix moment serialization
    moment.fn.toJSON = function () { return this.isValid() ? this.format() : null };

    function canUseHtml5Date() {
        const el = angular.element('<input type="date" value=":)" />');
        return el.attr('type') === 'date' && el.val() === '';
    }

    function changeValueFn($ctrl) {
        return val => {
            if (angular.isUndefined(val)) {
                return;
            }

            if (angular.isString(val)) {
                $ctrl.value = (val === '' || moment(val).year() <= 1900) ? '' : moment(val);
            }

            if (angular.isDefined($ctrl.dateValue)) {
                return;
            }

            if (moment.isMoment($ctrl.value)) {
                const tmpDate = $ctrl.value.toObject();
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

    const tbNumericEditorCtrl = ['tubularEditorService', '$scope', 'translateFilter', function (tubular, $scope, translateFilter) {
        const $ctrl = this;

        $ctrl.validate = () => {
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

        $ctrl.$onInit = () => {
            $ctrl.DataType = 'numeric';
            tubular.setupScope($scope, 0, $ctrl, false);
        };
    }
    ];

    const tbDateTimeEditorCtrl = ['$scope', '$element', 'tubularEditorService', 'translateFilter', 'dateFilter',
        function ($scope, $element, tubular, translateFilter, dateFilter) {
            const $ctrl = this;

            // This could be $onChange??
            $scope.$watch(() => $ctrl.value, changeValueFn($ctrl));

            $scope.$watch(() => $ctrl.dateValue, val => {
                if (angular.isDefined(val)) {
                    $ctrl.value = val === '' ? '' : moment(val);
                }
            });

            $ctrl.validate = () => validateDate($ctrl, translateFilter, dateFilter);

            $ctrl.$onInit = () => {
                $ctrl.DataType = 'datetime';
                tubular.setupScope($scope, $ctrl.format, $ctrl);
                $ctrl.format = $ctrl.format || 'MMM D, Y';
            };
        }
    ];

    const tbDateEditorCtrl = [
        '$scope',
        '$element',
        'tubularEditorService',
        'translateFilter',
        'dateFilter',
        function (
            $scope,
            $element,
            tubular,
            translateFilter,
            dateFilter) {
            const $ctrl = this;

            $scope.$watch(() => $ctrl.value, changeValueFn($ctrl));

            $scope.$watch(() => $ctrl.dateValue, val => {
                if (angular.isDefined(val)) {
                    $ctrl.value = val === '' ? '' : moment(val);
                }
            });

            $ctrl.validate = () => validateDate($ctrl, translateFilter, dateFilter);

            $ctrl.$onInit = () => {
                $ctrl.DataType = 'date';
                tubular.setupScope($scope, $ctrl.format, $ctrl);
                $ctrl.format = $ctrl.format || 'MMM D, Y'; // TODO: Add hours?
            };
        }
    ];

    const tbDropdownEditorCtrl = ['tubularEditorService', '$scope', '$http', function (tubular, $scope, $http) {
        const $ctrl = this;

        $ctrl.$onInit = () => {
            tubular.setupScope($scope, null, $ctrl);
            $ctrl.dataIsLoaded = false;
            $ctrl.selectOptions = 'd for d in $ctrl.options';

            if (angular.isDefined($ctrl.optionLabel)) {
                $ctrl.selectOptions = `d.${$ctrl.optionLabel} for d in $ctrl.options`;

                if (angular.isDefined($ctrl.optionTrack)) {
                    $ctrl.selectOptions = `d as d.${$ctrl.optionLabel} for d in $ctrl.options track by d.${$ctrl.optionTrack}`;
                } else if (angular.isDefined($ctrl.optionKey)) {
                    $ctrl.selectOptions = `d.${$ctrl.optionKey} as ${$ctrl.selectOptions}`;
                }
            }

            if (angular.isUndefined($ctrl.optionsUrl)) {
                return;
            }

            $scope.$watch(() => $ctrl.optionsUrl, (val, prev) => {
                if (val !== prev) {
                    $ctrl.dataIsLoaded = false;
                    $ctrl.loadData();
                }
            });

            if ($ctrl.isEditing) {
                $ctrl.loadData();
            } else {
                $scope.$watch(() => $ctrl.isEditing, () => {
                    if ($ctrl.isEditing) {
                        $ctrl.loadData();
                    }
                });
            }
        };

        $scope.updateReadonlyValue = () => {
            $ctrl.readOnlyValue = $ctrl.value;

            if (!$ctrl.value) {
                return;
            }

            if (angular.isDefined($ctrl.optionLabel) && $ctrl.options) {
                if (angular.isDefined($ctrl.optionKey)) {
                    const filteredOption = $ctrl.options
                        .filter(el => el[$ctrl.optionKey] === $ctrl.value);

                    if (filteredOption.length > 0) {
                        $ctrl.readOnlyValue = filteredOption[0][$ctrl.optionLabel];
                    }
                } else {
                    $ctrl.readOnlyValue = $ctrl.options[$ctrl.optionLabel];
                }
            }
        };

        $scope.$watch(() => $ctrl.value, val => {
            $scope.$emit('tbForm_OnFieldChange', $ctrl.$component, $ctrl.name, val, $ctrl.options);
            $scope.updateReadonlyValue();
        });

        $ctrl.loadData = () => {
            if ($ctrl.dataIsLoaded) {
                return;
            }

            const value = $ctrl.value;
            $ctrl.value = '';

            $http({
                url: $ctrl.optionsUrl,
                method: $ctrl.optionsMethod || 'GET'
            }).then(response => {
                $ctrl.options = response.data;
                $ctrl.dataIsLoaded = true;
                // TODO: Add an attribute to define if autoselect is OK
                const possibleValue = $ctrl.options && $ctrl.options.length > 0 ?
                    angular.isDefined($ctrl.optionKey) ? $ctrl.options[0][$ctrl.optionKey] : $ctrl.options[0]
                    : '';
                $ctrl.value = value || $ctrl.defaultValue || possibleValue;

                // Set the field dirty
                const formScope = $ctrl.getFormField();
                if (formScope) {
                    formScope.$setDirty();
                }
            }, error => $scope.$emit('tbGrid_OnConnectionError', error));
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
            template: `<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">
            <span ng-hide="$ctrl.isEditing">{{ $ctrl.value | date: format }}</span>
            <label ng-show="$ctrl.showLabel" ng-bind="$ctrl.label"></label>${
            canUseHtml5Date() ?
                `<input type="datetime-local" ng-show="$ctrl.isEditing" ng-model="$ctrl.dateValue" class="form-control" 
                ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}"/>` :
                `<div class="input-group" ng-show="$ctrl.isEditing">
                <input type="text" uib-datepicker-popup="{{$ctrl.format}}" ng-model="$ctrl.dateValue" class="form-control" 
                ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}" is-open="$ctrl.open" />
                <span class="input-group-btn">
                <button type="button" class="btn btn-default" ng-click="$ctrl.open = !$ctrl.open"><i class="fa fa-calendar"></i></button>
                </span></div>
                <div uib-timepicker ng-model="$ctrl.dateValue"  show-seconds="true" show-meridian="false"></div>`
            }<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>
            <span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help" ng-bind="$ctrl.help"></span>
            </div>`,
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
            template: `<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">
            <span ng-hide="$ctrl.isEditing">{{ $ctrl.value | moment: $ctrl.format }}</span>
            <label ng-show="$ctrl.showLabel" ng-bind="$ctrl.label"></label>${
            canUseHtml5Date() ?
                '<input type="date" ng-show="$ctrl.isEditing" ng-model="$ctrl.dateValue" class="form-control" ' +
                'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}"/>' :
                '<div class="input-group" ng-show="$ctrl.isEditing">' +
                '<input type="text" uib-datepicker-popup="{{$ctrl.format}}" ng-model="$ctrl.dateValue" class="form-control" ' +
                'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}" is-open="$ctrl.open" />' +
                '<span class="input-group-btn">' +
                '<button type="button" class="btn btn-default" ng-click="$ctrl.open = !$ctrl.open"><i class="fa fa-calendar"></i></button>' +
                '</span>' +
                '</div>'
            }<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>
            <span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help" ng-bind="$ctrl.help"></span>
            </div>`,
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
        .directive('tbTypeaheadEditor', [
            '$q', '$compile', function ($q, $compile) {

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
                    link: function (scope, element) {
                        const template = `<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid && $dirty() }">
                            <span ng-hide="isEditing" ng-bind="value"></span>
                            <label ng-show="showLabel" ng-bind="label"></label>
                            <div class="input-group" ng-show="isEditing">
                            <input ng-model="value" placeholder="{{placeholder}}" title="{{tooltip}}" autocomplete="off" 
                            class="form-control {{css}}" ng-readonly="readOnly || lastSet.indexOf(value) !== -1" uib-typeahead="${scope.selectOptions}" 
                            ng-required="required" name="{{name}}" /> 
                            <div class="input-group-addon" ng-hide="lastSet.indexOf(value) !== -1"><i class="fa fa-pencil"></i></div>
                            <span class="input-group-btn" ng-show="lastSet.indexOf(value) !== -1" tabindex="-1">
                            <button class="btn btn-default" type="button" ng-click="value = null"><i class="fa fa-times"></i>
                            </span></div>
                            <span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>
                            <span class="help-block" ng-show="isEditing && help" ng-bind="help"></span>
                            </div>`;

                        const linkFn = $compile(template);
                        const content = linkFn(scope);
                        element.append(content);
                    },
                    controller: [
                        '$scope',
                        'tubularEditorService',
                        '$http',
                        function (
                            $scope,
                            tubular,
                            $http) {
                            tubular.setupScope($scope);
                            $scope.selectOptions = 'd for d in getValues($viewValue)';
                            $scope.lastSet = [];

                            if ($scope.optionLabe) {
                                $scope.selectOptions = `d as d.${$scope.optionLabel} for d in getValues($viewValue)`;
                            }

                            $scope.$watch('value', val => {
                                $scope.$emit('tbForm_OnFieldChange', $scope.$component, $scope.name, val, $scope.options);
                                $scope.tooltip = val;

                                if (val && $scope.optionLabel) {
                                    $scope.tooltip = val[$scope.optionLabel];
                                }
                            });

                            $scope.getValues = val => {
                                if (angular.isUndefined($scope.optionsUrl)) {
                                    return $q(resolve => {
                                        $scope.lastSet = $scope.options;
                                        resolve($scope.options);
                                    });
                                }

                                return $http({
                                    url: `${$scope.optionsUrl}?search=${val}`,
                                    method: $scope.optionsMethod || 'GET'
                                }).then(response => {
                                    $scope.lastSet = response.data;
                                    return $scope.lastSet;
                                });
                            };
                        }
                    ]
                };
            }
        ])
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
            controller: [
                'tubularEditorService',
                '$scope',
                function (
                    tubular,
                    $scope) {
                    const $ctrl = this;

                    $ctrl.$onInit = () => {
                        $ctrl.required = false; // overwrite required to false always
                        $ctrl.checkedValue = angular.isDefined($ctrl.checkedValue) ? $ctrl.checkedValue : true;
                        $ctrl.uncheckedValue = angular.isDefined($ctrl.uncheckedValue) ? $ctrl.uncheckedValue : false;

                        tubular.setupScope($scope, null, $ctrl, true);
                    };
                }
            ]
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
            controller: [
                'tubularEditorService',
                '$scope',
                'translateFilter',
                function (
                    tubular,
                    $scope,
                    translateFilter) {
                    const $ctrl = this;

                    $ctrl.validate = () => {
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

                    $ctrl.$onInit = () => tubular.setupScope($scope, null, $ctrl, false);
                }
            ]
        });
})(angular, moment);
(angular => {
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
                const $ctrl = this;

                // Set currentFilter to either one of the parent components or for when this template is being rendered by $compile
                $ctrl.$onInit = () => $ctrl.currentFilter = $ctrl.$columnFilter || $ctrl.$columnDateTimeFilter || $ctrl.$columnOptionsFilter || $scope.$parent.$ctrl;
            }
            ]
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
                const $ctrl = this;

                $ctrl.openColumnsSelector = () => {
                    const model = $ctrl.$component.columns;

                    const dialog = $modal.open({
                        templateUrl: 'tbColumnSelectorDialog.tpl.html',
                        backdropClass: 'fullHeight',
                        animation: false,
                        controller: [
                            '$scope', function ($innerScope) {
                                $innerScope.Model = model;
                                $innerScope.isInvalid = () => $innerScope.Model.filter(el => el.Visible).length === 1;
                                $innerScope.closePopup = dialog.close;
                            }
                        ]
                    });
                };
            }
            ]
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
            controller: [
                '$scope', 'tubularTemplateService', function ($scope, tubular) {
                    const $ctrl = this;

                    $ctrl.$onInit = () => {
                        $ctrl.onlyContains = angular.isUndefined($ctrl.onlyContains) ? false : $ctrl.onlyContains;
                        $ctrl.templateName = 'tbColumnFilterPopover.tpl.html';
                        tubular.setupFilter($scope, $ctrl);
                    };
                }
            ]
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
            controller: [
                '$scope', 'tubularTemplateService', function ($scope, tubular) {
                    const $ctrl = this;

                    $ctrl.$onInit = () => {
                        $ctrl.templateName = tubular.tbColumnDateTimeFilterPopoverTemplateName;
                        tubular.setupFilter($scope, $ctrl);
                    };
                }
            ]
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
            controller: [
                '$scope', 'tubularTemplateService', '$http', function ($scope, tubular, $http) {
                    const $ctrl = this;

                    $ctrl.getOptionsFromUrl = () => {
                        if ($ctrl.dataIsLoaded) {
                            $scope.$apply();
                            return;
                        }

                        $http.get($ctrl.filter.OptionsUrl).then(response => {
                            $ctrl.optionsItems = response.data;
                            $ctrl.dataIsLoaded = true;
                        }, error => $scope.$emit('tbGrid_OnConnectionError', error));
                    };

                    $ctrl.$onInit = () => {
                        $ctrl.dataIsLoaded = false;
                        $ctrl.templateName = 'tbColumnOptionsFilter.tpl.html';
                        tubular.setupFilter($scope, $ctrl);
                        $ctrl.getOptionsFromUrl();

                        $ctrl.filter.Operator = 'Multiple';
                    };
                }
            ]
        });
})(angular);
(angular => {
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
            controller: function () {
                const $ctrl = this;

                $ctrl.delete = () => $ctrl.$component.deleteRow($ctrl.model);

                $ctrl.$onInit = () => {
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
        .directive('tbSaveButton', [
            function () {

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
                    controller: [
                        '$scope', function ($scope) {
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.isNew = $scope.isNew || false;

                            $scope.save = () => {
                                if (!$scope.model.$valid()) {
                                    return;
                                }

                                $scope.model.$isNew = $scope.isNew;
                                return $scope.$component.saveRow($scope.model);
                            };

                            $scope.cancel = () => $scope.model.revertChanges();
                        }
                    ]
                };
            }
        ])
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
            controller: function () {
                const $ctrl = this;

                $ctrl.edit = () => {
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
            controller: [
                '$scope', $scope => $scope.options = angular.isDefined($scope.$ctrl.options) ? $scope.$ctrl.options : [10, 20, 50, 100]
            ]
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
                const $ctrl = this;

                $ctrl.downloadCsv = () => tubular.exportGridToCsv($ctrl.filename, $ctrl.$component);

                $ctrl.downloadAllCsv = () => tubular.exportAllGridToCsv($ctrl.filename, $ctrl.$component);
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
                const $ctrl = this;

                $ctrl.printGrid = () => tubular.printGrid($ctrl.$component, $ctrl.printCss, $ctrl.title);
            }]
        });
})(angular);
(angular => {
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
                $component : '^tbGrid'
            },
            templateUrl: 'tbGridPager.tpl.html',
            controller: ['$scope', function($scope) {
                    const $ctrl = this;

                    $scope.$watch('$ctrl.$component.currentPage', () => {
                        if ($ctrl.$component.currentPage !== $ctrl.$component.requestedPage) {
                            $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                        }
                    });

                    $ctrl.pagerPageChanged = () => $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                }
            ]
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
            controller: [
                '$scope', function($scope) {
                    const $ctrl = this;

                    $ctrl.fixCurrentTop = () => {
                        $ctrl.currentTop = $ctrl.$component.pageSize * $ctrl.$component.currentPage;
                        $ctrl.currentInitial = (($ctrl.$component.currentPage - 1) * $ctrl.$component.pageSize) + 1;

                        if ($ctrl.currentTop > $ctrl.$component.filteredRecordCount) {
                            $ctrl.currentTop = $ctrl.$component.filteredRecordCount;
                        }

                        if ($ctrl.currentTop < 0) {
                            $ctrl.currentTop = 0;
                        }

                        if ($ctrl.currentInitial < 0 || $ctrl.$component.totalRecordCount === 0) {
                            $ctrl.currentInitial = 0;
                        }

                        if ($ctrl.$component.pageSize > $ctrl.$component.filteredRecordCount)
                        {
                            $ctrl.currentInitial = 1;
                            $ctrl.currentTop = $ctrl.$component.filteredRecordCount;
                        }
                    };

                    $scope.$watch('$ctrl.$component.filteredRecordCount', () => {
                        $ctrl.filtered = $ctrl.$component.totalRecordCount !== $ctrl.$component.filteredRecordCount;
                        $ctrl.fixCurrentTop();
                    });

                    $scope.$watch('$ctrl.$component.currentPage', $ctrl.fixCurrentTop);
                    $scope.$watch('$ctrl.$component.pageSize', $ctrl.fixCurrentTop);

                    $ctrl.$onInit = $ctrl.fixCurrentTop;
                }
            ]
        });
})(angular);
(function (angular, moment) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.models
     *
     * @description
     * Tubular Models module.
     *
     * It contains model's factories to be use in {@link tubular.directives} like `tubularModel` and `tubularGridColumnModel`.
     */
    angular.module('tubular.models', [])
        /**
         * @ngdoc factory
         * @name tubularModel
         * @module tubular.models
         *
         * @description
         * The `tubularModel` factory is the base to generate a row model to use with `tbGrid` and `tbForm`.
         */
        .factory('tubularModel', [function() {
            return function($ctrl, data) {
                let obj = {
                    $hasChanges: () => obj.$fields.some(k => angular.isDefined(obj.$original[k]) && obj[k] !== obj.$original[k]),
                    $isEditing: false,
                    $isNew: false,
                    $key: '',
                    $fields: [],
                    $state: {},
                    $original: {},
                    $valid: () => Object.keys(obj.$state).filter(k => angular.isDefined(obj.$state[k]) && !obj.$state[k].$valid()).length == 0,
                    $addField: (key, value, ignoreOriginal) => {
                        if (obj.$fields.indexOf(key) >= 0) {
                            return;
                        }

                        obj[key] = value;
                        obj.$fields.push(key);
                        obj.$original[key] = ignoreOriginal ? undefined : value;
                    },
                    resetOriginal: () => angular.forEach(obj.$original, (v, k) => obj.$original[k] = obj[k]),
                    revertChanges: () => {
                        angular.forEach(obj, (v, k) => {
                            if (angular.isDefined(obj.$original[k])) {
                                obj[k] = obj.$original[k];
                            }
                        });

                        obj.$isEditing = false;
                    }
                };

                if (!angular.isArray(data)) {
                    angular.forEach(data, (v,k) => obj.$addField(k, v));
                }

                if (angular.isDefined($ctrl.columns)) {
                    angular.forEach($ctrl.columns, (col, key) => {
                        let value = angular.isDefined(data[key]) ? data[key] : data[col.Name];

                        if (col.DataType === 'date' || col.DataType === 'datetime' || col.DataType === 'datetimeutc') {
                            if (value === null || value === '' || moment(value).year() <= 1900)
                                value = '';
                            else
                                value = col.DataType === 'datetimeutc' ? moment.utc(value) : moment(value);
                        }

                        obj.$addField(col.Name, value);

                        if (col.IsKey) {
                            obj.$key += `${value},`;
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


(function(angular) {
'use strict';


/**
 * @ngdoc module
 * @name tubular.services
 *
 * @description
 * Tubular Services module.
 * It contains common services like HTTP client, filtering and printing services.
 */
angular.module('tubular.services', ['ui.bootstrap'])
  .config([
    '$httpProvider',
    ($httpProvider) => {
      $httpProvider.interceptors.push('tubularAuthInterceptor');
      $httpProvider.interceptors.push('tubularNoCacheInterceptor');
    }
  ])


})(angular);

(function(angular) {
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
    .filter('errormessage', function() {
      return input => {
        if (input && input.data && input.data.ExceptionMessage) {
          return input.data.ExceptionMessage;
        }

        return input.statusText || 'Connection Error';
      };
    })
})(angular);

(function(angular, moment) {
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
    .filter('moment', [
      'dateFilter',
      function(dateFilter) {
        return (input, format) => moment.isMoment(input) ? input.format(format || 'M/DD/YYYY') : dateFilter(input);
      }
    ]);
})(angular, moment);

(function(angular) {
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
    .filter('numberorcurrency', [
      'numberFilter',
      'currencyFilter',
      function(numberFilter, currencyFilter) {
        return (input, format, symbol, fractionSize) => {
          fractionSize = fractionSize || 2;

          if (format === 'C') {
            return currencyFilter(input, symbol || '$', fractionSize);
          }

          return format === 'I' ? parseInt(input) : numberFilter(input, fractionSize);
        };
      }
    ])
})(angular);

(function(angular) {
  'use strict';

  angular.module('tubular.services')
    /**
     * @ngdoc filter
     * @name translate
     *
     * @description
     * Translate a key to the current language
     */
    .filter('translate', ['tubularTranslate', function(tubularTranslate) {
        return function(input, param1, param2, param3, param4) {
          if (angular.isUndefined(input)) {
            return input;
          }

          let translation = tubularTranslate.translate(input)
              .replace('{0}', param1 || '')
              .replace('{1}', param2 || '')
              .replace('{2}', param3 || '')
              .replace('{3}', param4 || '');

            return translation;
        };
      }
    ]);
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
    angular.module('tubular.services')
        .factory('tubularAuthInterceptor', ['$q', '$injector', 'tubularConfig', function ($q, $injector, tubularConfig) {

            let authRequestRunning = null;
            const tubularHttpName = 'tubularHttp';

            const service = {
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

                // Get the service here because otherwise, a circular dependency injection will be detected
                const tubularHttp = $injector.get(tubularHttpName);
                const webApiSettings = tubularConfig.webApi;

                config.headers = config.headers || {};

                // Handle requests going to API
                if (!checkStatic(config.url) && webApiSettings.tokenUrl() !== config.url &&
                    webApiSettings.requireAuthentication() &&
                    tubularHttp.userData.bearerToken) {

                    config.headers.Authorization = `Bearer ${tubularHttp.userData.bearerToken}`;

                    // When using refresh tokens and bearer token has expired,
                    // avoid the round trip on go directly to try refreshing the token
                    if (webApiSettings.enableRefreshTokens() && tubularHttp.userData.refreshToken
                        && tubularHttp.isBearerTokenExpired()) {
                        return $q.reject({ error: 'expired token', status: 401, config: config });
                    }
                }

                return config;
            }

            function checkStatic(url) {
                return /\.(htm|html|css|js|jsx)/.test(url);
            }

            function requestError(rejection) {
                return $q.reject(rejection);
            }

            function response(response) {
                return response;
            }

            function responseError(rejection) {
                const deferred = $q.defer();

                if (rejection.status === 401) {
                    const tubularHttp = $injector.get(tubularHttpName);
                    const webApiSettings = tubularConfig.webApi;

                    if (webApiSettings.tokenUrl() !== rejection.config.url &&
                        webApiSettings.enableRefreshTokens() &&
                        webApiSettings.requireAuthentication() &&
                        tubularHttp.userData.refreshToken) {

                        rejection.triedRefreshTokens = true;

                        if (!authRequestRunning) {
                            authRequestRunning = $injector.get('$http')({
                                method: 'POST',
                                url: webApiSettings.refreshTokenUrl(),
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                data: `grant_type=refresh_token&refresh_token=${tubularHttp.userData.refreshToken}`
                            });
                        }

                        authRequestRunning.then(r => {
                            authRequestRunning = null;
                            tubularHttp.initAuth(r.data);

                            if (webApiSettings.requireAuthentication() && tubularHttp.isAuthenticated()) {
                                rejection.config.headers.Authorization = `Bearer ${tubularHttp.userData.bearerToken}`;
                                $injector.get('$http')(rejection.config)
                                    .then(resp => deferred.resolve(resp), () => deferred.reject(r));
                            }
                            else {
                                deferred.reject(rejection);
                            }
                        }, response => {
                            authRequestRunning = null;
                            deferred.reject(response);
                            tubularHttp.removeAuthentication();
                            $injector.get('$location').path('/Login');
                            return;
                        });
                    }
                    else {
                        deferred.reject(rejection);
                    }
                }
                else {
                    deferred.reject(rejection);
                }

                return deferred.promise;
            }
        }]);
})(angular);

(angular => {
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
    angular.module('tubular.services')
        .factory('tubularNoCacheInterceptor', [function () {

            return {
                request: (config) => {
                    if (config.method === 'GET' && config.url.indexOf('.htm') === -1 && config.url.indexOf('blob:') === -1) {
                        const separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = `${config.url + separator  }noCache=${  new Date().getTime()}`;
                    }

                    return config;
                }
            };
        }]);
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
        .service('tubularEditorService', ['translateFilter', function(translateFilter) {
            return editorService(translateFilter);
        }]);
        
    function editorService(translateFilter) {
        return {
            /**
             * Setups a new Editor, this functions is like a common class constructor to be used
             * with all the tubularEditors.
             */
            setupScope: (scope, defaultFormat, ctrl, setDirty) => {
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
                    $valid: () => {
                        ctrl.checkValid();
                        return ctrl.state.$errors.length === 0;
                    },
                    $dirty: ctrl.$dirty,
                    $errors: []
                };

                // Get the field reference using the Angular way
                ctrl.getFormField = () => {
                    let parent = scope.$parent;

                    while (parent != null) {
                        if (parent.tubularDirective === 'tubular-form') {
                            const formScope = parent.getFormScope();

                            return formScope == null ? null : formScope[scope.Name];
                        }

                        parent = parent.$parent;
                    }

                    return null;
                };

                ctrl.$dirty = () => {
                    // Just forward the property
                    const formField = ctrl.getFormField();

                    return formField == null ? true : formField.$dirty;
                };

                ctrl.checkValid = () => {
                    ctrl.$valid = true;
                    ctrl.state.$errors = [];

                    if ((angular.isUndefined(ctrl.value) && ctrl.required) ||
                        (angular.isDate(ctrl.value) && isNaN(ctrl.value.getTime()) && ctrl.required)) {
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

                scope.$watch(() => ctrl.value, (newValue, oldValue) => {
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

                let parent = scope.$parent;

                // We try to find a Tubular Form in the parents
                while (parent != null) {
                    if (parent.tubularDirective === 'tubular-form' ||
                        parent.tubularDirective === 'tubular-rowset') {

                        if (ctrl.name === null) {
                            return;
                        }

                        if (parent.hasFieldsDefinitions !== false) {
                            throw 'Cannot define more fields. Field definitions have been sealed';
                        }

                        ctrl.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

                        scope.Name = ctrl.name;

                        ctrl.bindScope = () => {
                            scope.$parent.Model = parent.model;

                            if (angular.equals(ctrl.value, parent.model[scope.Name]) === false) {
                                if (angular.isDefined(parent.model[scope.Name])) {
                                    if ((ctrl.DataType === 'date' || ctrl.DataType === 'datetime')
                                        && parent.model[scope.Name] != null && angular.isString(parent.model[scope.Name])) {
                                        if (parent.model[scope.Name] === '' || parent.model[scope.Name] === null) {
                                            ctrl.value = parent.model[scope.Name];
                                        }
                                        else {
                                            ctrl.value = moment(parent.model[scope.Name]);
                                        }
                                    } else {
                                        ctrl.value = parent.model[scope.Name];
                                    }
                                }

                                parent.$watch(() => ctrl.value, value => {
                                    if (value !== parent.model[scope.Name]) {
                                        parent.model[scope.Name] = value;
                                    }
                                });
                            }

                            scope.$watch(() => parent.model[scope.Name], value => {
                                if (value !== ctrl.value) {
                                    ctrl.value = value;
                                }
                            }, true);

                            if (ctrl.value == null && (ctrl.defaultValue && ctrl.defaultValue != null)) {
                                if ((ctrl.DataType === 'date' || ctrl.DataType === 'datetime') && angular.isString(ctrl.defaultValue)) {
                                    ctrl.defaultValue = new Date(ctrl.defaultValue);
                                }

                                if (ctrl.DataType === 'numeric' && angular.isString(ctrl.defaultValue)) {
                                    ctrl.defaultValue = parseFloat(ctrl.defaultValue);
                                }

                                ctrl.value = ctrl.defaultValue;
                            }

                            parent.model.$state = parent.model.$state || {};

                            // This is the state API for every property in the Model
                            parent.model.$state[scope.Name] = {
                                $valid: () => {
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
                                const formScope = ctrl.getFormField();

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
    }


})(angular, moment);


(function(angular) {
'use strict';

angular.module('tubular.services')

  /**
   * @ngdoc factory
   * @name tubularGridExportService
   *
   * @description
   * Use `tubularGridExportService` to export your `tbGrid` to a CSV file.
   */
  .factory('tubularGridExportService', ['$window',
      function($window) {
        const service = this;

        service.saveFile = (filename, blob) => {
          const fileURL = $window.URL.createObjectURL(blob);
          const downloadLink = angular.element('<a></a>');

          downloadLink.attr('href', fileURL);
          downloadLink.attr('download', filename);
          downloadLink.attr('target', '_self');
          downloadLink[0].click();

          $window.URL.revokeObjectURL(fileURL);
        };

        return {
          exportAllGridToCsv: (filename, gridScope) => {
            const columns = getColumns(gridScope);
            const visibility = getColumnsVisibility(gridScope);

            gridScope.getFullDataSource()
              .then(data => service.saveFile(filename, exportToCsv(columns, data, visibility)));
          },

          exportGridToCsv: (filename, gridScope) => {
            if (!gridScope.dataSource || !gridScope.dataSource.Payload) {
              return;
            }

            const columns = getColumns(gridScope);
            const visibility = getColumnsVisibility(gridScope);

            gridScope.currentRequest = {};
            service.saveFile(filename, exportToCsv(columns, gridScope.dataSource.Payload, visibility));
            gridScope.currentRequest = null;
          },

          printGrid: (component, printCss, title) => {
            component.getFullDataSource().then(data => {
              const tableHtml = `<table class="table table-bordered table-striped"><thead><tr>${
                                 component.columns
                                .filter(c => c.Visible)
                                .reduce((prev, el) => `${prev  }<th>${  el.Label || el.Name  }</th>`, '')
                                 }</tr></thead>`
                                + `<tbody>${
                                 data.map(row => {
                                    if (angular.isObject(row)) {
                                        row = Object.keys(row).map(key => row[key]);
                                    }

                                    return `<tr>${  row.map((cell, index) => {
                                        if (angular.isDefined(component.columns[index]) &&
                                            !component.columns[index].Visible) {
                                            return '';
                                        }

                                        return `<td>${  cell  }</td>`;
                                    }).join(' ')  }</tr>`;
                                }).join('  ')
                                 }</tbody>`
                                + '</table>';

          const popup = $window.open('about:blank', 'Print', 'menubar=0,location=0,height=500,width=800');
          popup.document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />');

          if (printCss !== '') {
            popup.document.write(`<link rel="stylesheet" href="${  printCss  }" />`);
          }

          popup.document.write('<body onload="window.print();">');
          popup.document.write(`<h1>${  title  }</h1>`);
          popup.document.write(tableHtml);
          popup.document.write('</body>');
          popup.document.close();
        });
    }
  };
}]);

function getColumns(gridScope) {
  return gridScope.columns.map(c => c.Label);
}

function getColumnsVisibility(gridScope) {
  return gridScope.columns.map(c => c.Visible);
}

function exportToCsv(header, rows, visibility) {
  const processRow = row => {
    if (angular.isObject(row)) {
      row = Object.keys(row).map(key => row[key]);
    }

    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      if (visibility[j]) {
        let innerValue = row[j] == null ? '' : row[j].toString();

        if (angular.isDate(row[j])) {
          innerValue = row[j].toLocaleString();
        }

        let result = innerValue.replace(/"/g, '""');

        if (result.search(/("|,|\n)/g) >= 0) {
          result = `"${  result  }"`;
        }

        if (j > 0) {
          finalVal += ',';
        }

        finalVal += result;
      }
    }

    return `${finalVal  }\n`;
  };

  let csvFile = '';

  if (header.length > 0) {
    csvFile += processRow(header);
  }

  angular.forEach(rows, row => csvFile += processRow(row));

  // Add "\uFEFF" (UTF-8 BOM)
  return new Blob([`\uFEFF${  csvFile}`], {
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
        .service('tubularHttp', [
            '$http',
            '$q',
            '$document',
            'tubularConfig',
            '$window',
            function (
                $http,
                $q,
                $document,
                tubularConfig,
                $window) {
                const authData = 'auth_data';
                const prefix = tubularConfig.localStorage.prefix();
                const me = this;

                function init() {
                    const savedData = angular.fromJson($window.localStorage.getItem(prefix + authData));

                    if (savedData != null) {
                        me.userData = savedData;
                    }
                }

                function isAuthenticationExpired(expirationDate) {
                    const now = new Date();
                    expirationDate = new Date(expirationDate);

                    return expirationDate - now <= 0;
                }

                function retrieveSavedData() {
                    const savedData = angular.fromJson($window.localStorage.getItem(prefix + authData));

                    if (angular.isUndefined(savedData)) {
                        throw 'No authentication data exists';
                    } else if (isAuthenticationExpired(savedData.expirationDate)) {
                        throw 'Authentication token has already expired';
                    } else {
                        me.userData = savedData;
                    }
                }

                me.userData = {
                    isAuthenticated: false,
                    username: '',
                    bearerToken: '',
                    expirationDate: null
                };

                me.isBearerTokenExpired = ()  => isAuthenticationExpired(me.userData.expirationDate);

                me.isAuthenticated = () => {
                    if (!me.userData.isAuthenticated || isAuthenticationExpired(me.userData.expirationDate)) {
                        try {
                            retrieveSavedData();
                        } catch (e) {
                            return false;
                        }
                    }

                    return true;
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
                        data: `grant_type=password&username=${  encodeURIComponent(username)  }&password=${  encodeURIComponent(password)}`
                    }).then(response => {
                        me.initAuth(response.data, username);
                        response.data.authenticated = true;

                        return response.data;
                    }, errorResponse => $q.reject(errorResponse.data));
                };

                // TODO: make private this function
                me.initAuth = (data, username) => {
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
            }
        ]);
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
        .factory('tubularPopupService', [
            '$uibModal',
            '$rootScope',
            'tubularTemplateService',
            function (
                $uibModal,
                $rootScope,
                tubularTemplateService) {

                return {
                    onSuccessForm: callback => {
                        const successHandle = $rootScope.$on('tbForm_OnSuccessfulSave', callback);

                        $rootScope.$on('$destroy', successHandle);
                    },

                    onConnectionError: callback => {
                        const errorHandle = $rootScope.$on('tbForm_OnConnectionError', callback);

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
                    openDialog: (template, model, gridScope, size) => {
                        if (angular.isUndefined(template)) {
                            template = tubularTemplateService.generatePopup(model);
                        }

                        return $uibModal.open({
                            templateUrl: template,
                            backdropClass: 'fullHeight',
                            animation: false,
                            size: size,
                            controller: 'GenericPopupController',
                            resolve: {
                                model: () => model,
                                gridScope: () => gridScope
                            }
                        });
                    }
                };
            }
        ]);
})(angular);
(angular => {
    'use strict';

    angular.module('tubular.services')
        .controller('GenericPopupController', [
            '$rootScope',
            '$scope',
            '$uibModalInstance',
            'model',
            'gridScope',
            function (
                $rootScope,
                $scope,
                $uibModalInstance,
                model,
                gridScope) {

                $scope.Model = model;

                $scope.savePopup = (innerModel, forceUpdate) => {
                    innerModel = innerModel || $scope.Model;

                    // If we have nothing to save and it's not a new record, just close
                    if (!forceUpdate && !innerModel.$isNew && !innerModel.$hasChanges()) {
                        $scope.closePopup();
                        return null;
                    }

                    return gridScope.saveRow(innerModel, forceUpdate).then(() => $uibModalInstance.close());
                };

                $scope.closePopup = () => {
                    if (angular.isDefined($scope.Model.revertChanges)) {
                        $scope.Model.revertChanges();
                    }

                    $uibModalInstance.close();
                };
            }
        ]);
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
        .service('tubularTemplateService',
        [
            '$templateCache',
            'translateFilter',
            function (
                $templateCache,
                translateFilter) {
                const me = this;

                me.canUseHtml5Date = () => {
                    const el = angular.element('<input type="date" value=":)" />');
                    return el.attr('type') === 'date' && el.val() === '';
                };

                me.enums = {
                    dataTypes: ['numeric', 'date', 'boolean', 'string'],
                    editorTypes: [
                        'tbSimpleEditor', 'tbNumericEditor', 'tbDateTimeEditor', 'tbDateEditor',
                        'tbDropdownEditor', 'tbTypeaheadEditor', 'tbCheckboxField', 'tbTextArea'
                    ],
                    httpMethods: ['POST', 'PUT', 'GET', 'DELETE'],
                    gridModes: ['Read-Only', 'Inline', 'Popup', 'Page'],
                    formLayouts: ['Simple', 'Two-columns', 'Three-columns'],
                    sortDirections: ['Ascending', 'Descending']
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
                me.tbColumnDateTimeFilterPopoverTemplateName = 'tbColumnDateTimeFilterPopoverTemplate.html';

                if (!$templateCache.get(me.tbColumnDateTimeFilterPopoverTemplateName)) {
                    const htmlDateSelector =
                        '<input class="form-control" type="date" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ' +
                            'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                            '<input type="date" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />';

                    const bootstrapDateSelector = '<div class="input-group">' +
                        '<input type="text" class="form-control" uib-datepicker-popup="MM/dd/yyyy" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" is-open="$ctrl.dateOpen" />' +
                        '<span class="input-group-btn">' +
                        '<button type="button" class="btn btn-default" ng-click="$ctrl.dateOpen = !$ctrl.dateOpen;"><i class="fa fa-calendar"></i></button>' +
                        '</span>' +
                        '</div>';

                    me.tbColumnDateTimeFilterPopoverTemplate = `${'<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ng-hide="$ctrl.dataType == \'boolean\'"></select>&nbsp;'}${
                        me.canUseHtml5Date() ? htmlDateSelector : bootstrapDateSelector
                        }<hr />` +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form>' +
                        '</div>';

                    $templateCache.put(me.tbColumnDateTimeFilterPopoverTemplateName,
                        me.tbColumnDateTimeFilterPopoverTemplate);
                }

                /**
                 * Generates the grid's cells markup
                 * @param {array} columns
                 * @param {string} mode
                 * @returns {string}
                 */
                me.generateCells = (columns, mode) => columns.reduce((prev, el) => {
                        const editorTag = el.EditorType
                            .replace(/([A-Z])/g, $1 => `-${  $1.toLowerCase()}`);

                        return `${prev  }\r\n\t\t<tb-cell-template column-name="${el.Name}">` +
                            `\r\n\t\t\t${
                            mode === 'Inline'
                                ? `<${editorTag} is-editing="row.$isEditing" value="row.${el.Name}"></${editorTag}>`
                                : el.Template
                            }\r\n\t\t</tb-cell-template>`;
                    }, '');

                /**
                 * Generates a grid markup using a columns model and grids options
                 * @param {array} columns
                 * @param {object} options
                 * @returns {string}
                 */
                me.generateGrid = function (columns, options) {
                    let topToolbar = '';
                    let bottomToolbar = '';

                    if (options.Pager) {
                        topToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                        bottomToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                    }

                    if (options.ExportCsv) {
                        topToolbar += '\r\n\t<div class="col-md-3">' +
                            '\r\n\t\t<div class="btn-group">' +
                            '\r\n\t\t<tb-print-button title="Tubular"></tb-print-button>' +
                            '\r\n\t\t<tb-export-button filename="tubular.csv" css="btn-sm"></tb-export-button>' +
                            '\r\n\t\t</div>' +
                            '\r\n\t</div>';
                    }

                    if (options.FreeTextSearch) {
                        topToolbar += '\r\n\t<tb-text-search class="col-md-3" css="input-sm"></tb-text-search>';
                    }

                    if (options.PageSizeSelector) {
                        bottomToolbar +=
                            '\r\n\t<tb-page-size-selector class="col-md-3" selectorcss="input-sm"></tb-page-size-selector>';
                    }

                    if (options.PagerInfo) {
                        bottomToolbar += '\r\n\t<tb-grid-pager-info class="col-md-3"></tb-grid-pager-info>';
                    }

                    return `${'<div class="container">' +
                        '\r\n<tb-grid server-url="'}${
                        options.dataUrl
                        }" request-method="${
                        options.RequestMethod
                        }" class="row" ` +
                        `page-size="10" require-authentication="${  options.RequireAuthentication  }" ${
                        options.Mode !== 'Read-Only' ? ` editor-mode="${  options.Mode.toLowerCase()  }"` : ''
                        }>${
                        topToolbar === '' ? '' : `\r\n\t<div class="row">${  topToolbar  }\r\n\t</div>`
                        }\r\n\t<div class="row">` +
                        '\r\n\t<div class="col-md-12">' +
                        '\r\n\t<div class="panel panel-default panel-rounded">' +
                        '\r\n\t<tb-grid-table class="table-bordered">' +
                        `\r\n\t<tb-column-definitions>${
                        options.Mode !== 'Read-Only'
                            ? '\r\n\t\t<tb-column label="Actions"><tb-column-header>{{label}}</tb-column-header></tb-column>'
                            : ''
                        }${columns.reduce((prev, el) => `${prev  }\r\n\t\t<tb-column name="${  el.Name  }" label="${  el.Label
                                }" column-type="${  el.DataType  }" sortable="${  el.Sortable
                                }" ` +
                                `\r\n\t\t\tis-key="${  el.IsKey  }" searchable="${  el.Searchable
                                }" ${
                                el.Sortable
                                    ? `\r\n\t\t\tsort-direction="${
                                    el.SortDirection
                                    }" sort-order="${
                                    el.SortOrder
                                    }" `
                                    : ' '
                                }visible="${
                                el.Visible
                                }">${
                                el.Filter ? '\r\n\t\t\t<tb-column-filter></tb-column-filter>' : ''
                                }\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>` +
                                '\r\n\t\t</tb-column>')
                        }\r\n\t</tb-column-definitions>` +
                        '\r\n\t<tb-row-set>' +
                        `\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">${
                        options.Mode !== 'Read-Only'
                            ? `\r\n\t\t<tb-cell-template>${
                            options
                                .Mode ===
                                'Inline'
                                ? '\r\n\t\t\t<tb-save-button model="row"></tb-save-button>'
                                : ''
                            }\r\n\t\t\t<tb-edit-button model="row"></tb-edit-button>` +
                            '\r\n\t\t</tb-cell-template>'
                            : ''
                        }${me.generateCells(columns, options.Mode)
                        }\r\n\t</tb-row-template>` +
                        '\r\n\t</tb-row-set>' +
                        '\r\n\t</tb-grid-table>' +
                        '\r\n\t</div>' +
                        '\r\n\t</div>' +
                        `\r\n\t</div>${
                        bottomToolbar === '' ? '' : `\r\n\t<div class="row">${  bottomToolbar  }\r\n\t</div>`
                        }\r\n</tb-grid>` +
                        '\r\n</div>';
                };

                me.getEditorTypeByDateType = dataType => {
                    switch (dataType) {
                        case 'date':
                            return 'tbDateTimeEditor';
                        case 'numeric':
                            return 'tbNumericEditor';
                        case 'boolean':
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
                    const jsonModel = (angular.isArray(model) && model.length > 0) ? model[0] : model;
                    const columns = [];

                    angular.forEach(Object.keys(jsonModel), prop => {
                        const value = jsonModel[prop];

                        // Ignore functions and  null value, but maybe evaluate another item if there is anymore
                        if (prop[0] === '$' || angular.isFunction(value) || value == null) {
                            return;
                        }

                        if (angular.isNumber(value) || parseFloat(value).toString() === value) {
                            columns.push({
                                Name: prop,
                                DataType: 'numeric',
                                Template: `{{row.${prop} | number}}`
                            });
                        } else if (angular.isDate(value) || !isNaN((new Date(value)).getTime())) {
                            columns.push({ Name: prop, DataType: 'date', Template: `{{row.${prop} | moment }}` });
                        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                            columns.push({
                                Name: prop,
                                DataType: 'boolean',
                                Template: `{{row.${prop} ? "TRUE" : "FALSE" }}`
                            });
                        } else {
                            const newColumn = { Name: prop, DataType: 'string', Template: `{{row.${prop}}}` };

                            if ((/e(-|)mail/ig).test(newColumn.Name)) {
                                newColumn.Template = `<a href="mailto:${newColumn.Template}">${newColumn.Template}</a>`;
                            }

                            columns.push(newColumn);
                        }
                    });

                    let firstSort = false;

                    angular.forEach(columns, columnObj => {
                        columnObj.Label = columnObj.Name.replace(/([a-z])([A-Z])/g, '$1 $2');
                        columnObj.EditorType = me.getEditorTypeByDateType(columnObj.DataType);

                        // Grid attributes
                        columnObj.Searchable = columnObj.DataType === 'string';
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

                me.generatePopupTemplate = (model, title) => {
                    const columns = me.createColumns(model);

                    return `${'<tb-form model="Model">' +
                        '<div class="modal-header"><h3 class="modal-title">'}${
                        title || 'Edit Row'
                        }</h3></div>` +
                        `<div class="modal-body">${
                        me.generateFieldsArray(columns).join('')
                        }</div>` +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
                        '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' +
                        '</div>' +
                        '</tb-form>';
                };

                me.generatePopup = (model, title) => {
                    const templateName = `temp${new Date().getTime()}.html`;
                    const template = me.generatePopupTemplate(model, title);

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
                me.generateForm = (fields, options) => {
                    const layout = options.Layout === 'Simple' ? '' : options.Layout.toLowerCase();
                    const fieldsArray = me.generateFieldsArray(fields);
                    let fieldsMarkup;

                    if (layout === '') {
                        fieldsMarkup = fieldsArray.join('');
                    } else {
                        fieldsMarkup = `\r\n\t<div class="row">${
                            layout === 'two-columns'
                                ? `\r\n\t<div class="col-md-6">${
                                fieldsArray.filter((i, e) => (e % 2) === 0).join('')
                                }\r\n\t</div>\r\n\t<div class="col-md-6">${
                                fieldsArray.filter((i, e) => (e % 2) === 1).join('')
                                }</div>`
                                : `\r\n\t<div class="col-md-4">${
                                fieldsArray.filter((i, e) => (e % 3) === 0).join('')
                                }\r\n\t</div>\r\n\t<div class="col-md-4">${
                                fieldsArray.filter((i, e) => (e % 3) === 1).join('')
                                }\r\n\t</div>\r\n\t<div class="col-md-4">${
                                fieldsArray.filter((i, e) => (e % 3) === 2).join('')
                                }\r\n\t</div>`
                            }\r\n\t</div>`;
                    }

                    return `${`<tb-form server-save-method="${options.SaveMethod}" 
                                model-key="${options.ModelKey}" 
                                require-authentication="${options.RequireAuthentication}" 
                                server-url="${options.dataUrl}" 
                                server-save-url="${options.SaveUrl}">` +
                        '\r\n\t'}${
                        fieldsMarkup
                        }\r\n\t<div>` +
                        `\r\n\t\t<button class="btn btn-primary" ng-click="$parent.save()" ng-disabled="!$parent.model.$valid()">Save</button>${
                        options.CancelButton
                            ? '\r\n\t\t<button class="btn btn-danger" ng-click="$parent.cancel()" formnovalidate>Cancel</button>'
                            : ''
                        }\r\n\t</div>` +
                        '\r\n</tb-form>';
                };

                /**
                 * Generates a array with a template for every column
                 *
                 * @param {array} columns
                 * @returns {array}
                 */
                me.generateFieldsArray = columns => columns.map(el => {
                        const editorTag = el.EditorType
                            .replace(/([A-Z])/g, $1 => `-${  $1.toLowerCase()}`);
                        const defaults = me.defaults.fieldsSettings[el.EditorType];

                        return `${'\r\n\t' +`<${editorTag} name="${el.Name}"`}${
                            defaults.EditorType ? `\r\n\t\teditor-type="${  el.DataType  }" ` : ''
                            }${defaults.ShowLabel
                                ? `\r\n\t\tlabel="${  el.Label  }" show-label="${  el.ShowLabel  }"`
                                : ''
                            }${defaults.Placeholder ? `\r\n\t\tplaceholder="${  el.Placeholder  }"` : ''
                            }${defaults.Required ? `\r\n\t\trequired="${  el.Required  }"` : ''
                            }${defaults.ReadOnly ? `\r\n\t\tread-only="${  el.ReadOnly  }"` : ''
                            }${defaults.Format ? `\r\n\t\tformat="${  el.Format  }"` : ''
                            }${defaults.Help ? `\r\n\t\thelp="${  el.Help  }"` : ''
                            }>\r\n\t` +`</${editorTag}>`;
                    });

                me.setupFilter = ($scope, $ctrl) => {
                    const dateOps = {
                        'None': translateFilter('OP_NONE'),
                        'Equals': translateFilter('OP_EQUALS'),
                        'NotEquals': translateFilter('OP_NOTEQUALS'),
                        'Between': translateFilter('OP_BETWEEN'),
                        'Gte': '>=',
                        'Gt': '>',
                        'Lte': '<=',
                        'Lt': '<'
                    };

                    const filterOperators = {
                        'string': {
                            'None': translateFilter('OP_NONE'),
                            'Equals': translateFilter('OP_EQUALS'),
                            'NotEquals': translateFilter('OP_NOTEQUALS'),
                            'Contains': translateFilter('OP_CONTAINS'),
                            'NotContains': translateFilter('OP_NOTCONTAINS'),
                            'StartsWith': translateFilter('OP_STARTSWITH'),
                            'NotStartsWith': translateFilter('OP_NOTSTARTSWITH'),
                            'EndsWith': translateFilter('OP_ENDSWITH'),
                            'NotEndsWith': translateFilter('OP_NOTENDSWITH')
                        },
                        'numeric': {
                            'None': translateFilter('OP_NONE'),
                            'Equals': translateFilter('OP_EQUALS'),
                            'Between': translateFilter('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'date': dateOps,
                        'datetime': dateOps,
                        'datetimeutc': dateOps,
                        'boolean': {
                            'None': translateFilter('OP_NONE'),
                            'Equals': translateFilter('OP_EQUALS'),
                            'NotEquals': translateFilter('OP_NOTEQUALS')
                        }
                    };

                    $ctrl.filter = {
                        Text: $ctrl.text || null,
                        Argument: $ctrl.argument ? [$ctrl.argument] : null,
                        Operator: $ctrl.operator || 'Contains',
                        OptionsUrl: $ctrl.optionsUrl || null,
                        HasFilter: !($ctrl.text == null || $ctrl.text === '' || angular.isUndefined($ctrl.text)),
                        Name: $scope.$parent.$parent.column.Name
                    };

                    $ctrl.filterTitle = $ctrl.title || translateFilter('CAPTION_FILTER');

                    $scope.$watch(() => {
                        const c = $ctrl.$component.columns.filter(e => e.Name === $ctrl.filter.Name);

                        return c.length !== 0 ? c[0] : null;
                    }, val => {
                            if (!val) {
                                return;
                            }

                            if ((val.DataType === 'date' || val.DataType === 'datetime' || val.DataType === 'datetimeutc')
                                && !($ctrl.filter.Text === '' || $ctrl.filter.Text == null))
                            {
                                $ctrl.filter.Text = new Date($ctrl.filter.Text);
                            }

                            if ($ctrl.filter.HasFilter !== val.Filter.HasFilter) {
                                $ctrl.filter.HasFilter = val.Filter.HasFilter;
                                $ctrl.filter.Text = val.Filter.Text;
                                $ctrl.retrieveData();
                            }
                        },
                        true);

                    $ctrl.retrieveData = function () {
                        const c = $ctrl.$component.columns.filter(e => e.Name === $ctrl.filter.Name);

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

                    $ctrl.applyFilter = () => {
                        $ctrl.filter.HasFilter = true;
                        $ctrl.retrieveData();
                    };

                    $ctrl.close = () => $ctrl.isOpen = false;

                    $ctrl.checkEvent = (keyEvent) => {
                        if (keyEvent.which === 13) {
                            $ctrl.applyFilter();
                            keyEvent.preventDefault();
                        }
                    };

                    const columns = $ctrl.$component.columns.filter(e => e.Name === $ctrl.filter.Name);

                    $scope.$watch('$ctrl.filter.Operator', val => {
                        if (val === 'None') {
                            $ctrl.filter.Text = '';
                        }
                    });

                    if (columns.length === 0) {
                        return;
                    }

                    $scope.$watch('$ctrl.filter', n => {
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

                    if ($ctrl.dataType === 'date' ||
                        $ctrl.dataType === 'datetime' ||
                        $ctrl.dataType === 'datetimeutc') {
                        $ctrl.filter.Argument = [new Date()];

                        if ($ctrl.filter.Operator === 'Contains') {
                            $ctrl.filter.Operator = 'Equals';
                        }
                    }

                    if ($ctrl.dataType === 'numeric' || $ctrl.dataType === 'boolean') {
                        $ctrl.filter.Argument = [1];

                        if ($ctrl.filter.Operator === 'Contains') {
                            $ctrl.filter.Operator = 'Equals';
                        }
                    }
                };

            }
        ]);
})(angular);
(function(angular) {
  'use strict';

  angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name tubularTranslate
     *
     * @description
     * Use `tubularTranslate` to translate strings.
     */
    .service('tubularTranslate', [function() {
      const me = this;

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
      me.setLanguage = language => me.currentLanguage = language;

      me.addTranslation = (language, key, value) => {
        const languageTable = me.translationTable[language] ||
          me.translationTable[me.currentLanguage] ||
          me.translationTable[me.defaultLanguage];
        languageTable[key] = value;
      };

      me.translate = (key) => {
        const languageTable = me.translationTable[me.currentLanguage] || me.translationTable[me.defaultLanguage];

        return languageTable[key] || key;
      };
    }]);

})(angular);

(angular => {
    'use strict';

    angular.module('tubular.services')
        .provider('tubularConfig', function () {

            const provider = this;
            provider.platform = {};
            const PLATFORM = 'platform';

            const configProperties = {
                webApi: {
                    tokenUrl: PLATFORM,
                    refreshTokenUrl: PLATFORM,
                    enableRefreshTokens: PLATFORM,
                    requireAuthentication: PLATFORM,
                    baseUrl: PLATFORM
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
                    baseUrl: '/api'
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
                for (const n in configObj) {
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
                        createConfig(configObj[namespace], providerObj[namespace], `${platformPath  }.${  namespace}`);

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
                                return stringObj(configProperties.platform, `default${  platformPath  }.${  namespace}`);
                            }
                            return configObj[namespace];
                        };
                    }

                });
            }

            function stringObj(obj, str) {
                str = str.split('.');
                for (let i = 0; i < str.length; i++) {
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