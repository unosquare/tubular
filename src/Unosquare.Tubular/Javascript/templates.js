(function(angular){
angular.module('tubular.directives').run(['$templateCache', function ($templateCache) {
  "use strict";
  $templateCache.put("tbCheckboxField.tpl.html",
    "<div ng-class=\"{ 'checkbox' : $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\" class=tubular-checkbox><input type=checkbox ng-model=$ctrl.value ng-disabled=\"$ctrl.readOnly || !$ctrl.isEditing\" class=tubular-checkbox id={{$ctrl.name}} name={{$ctrl.name}}><label ng-show=$ctrl.isEditing for={{$ctrl.name}} ng-bind=$ctrl.label></label><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbDropdownEditor.tpl.html",
    "<div ng-class=\"{ 'form-group' : $ctrl.showLabel && $ctrl.isEditing, 'has-error' : !$ctrl.$valid && $ctrl.$dirty() }\"><span ng-hide=$ctrl.isEditing ng-bind=$ctrl.readOnlyValue></span><label ng-show=$ctrl.showLabel ng-bind=$ctrl.label></label><select ng-options=\"{{ $ctrl.selectOptions }}\" ng-show=$ctrl.isEditing ng-model=$ctrl.value class=form-control ng-required=$ctrl.required ng-disabled=$ctrl.readOnly name={{$ctrl.name}} ng-change=\"onChange({value: value})\"></select><span class=\"help-block error-block\" ng-show=$ctrl.isEditing ng-repeat=\"error in $ctrl.state.$errors\">{{error}}</span> <span class=help-block ng-show=\"$ctrl.isEditing && $ctrl.help\" ng-bind=$ctrl.help></span></div>");
  $templateCache.put("tbHiddenField.tpl.html",
    "<input type=hidden ng-model=$ctrl.value class=form-control name={{$ctrl.name}}>");
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
    "<div class=tubular-remove-popover><button ng-click=$ctrl.model.delete() class=\"btn btn-danger btn-xs\">{{:: $ctrl.caption || ('CAPTION_REMOVE' | translate) }}</button> &nbsp; <button ng-click=\"$ctrl.isOpen = false;\" class=\"btn btn-default btn-xs\">{{:: $ctrl.cancelCaption || ('CAPTION_CANCEL' | translate) }}</button></div>");
  $templateCache.put("tbSaveButton.tpl.html",
    "<div ng-show=model.$isEditing><button ng-click=save() class=\"btn btn-default {{:: saveCss || '' }}\" ng-disabled=!model.$valid()>{{:: saveCaption || ('CAPTION_SAVE' | translate) }}</button> <button ng-click=cancel() class=\"btn {{:: cancelCss || 'btn-default' }}\">{{:: cancelCaption || ('CAPTION_CANCEL' | translate) }}</button></div>");
  $templateCache.put("tbTextSearch.tpl.html",
    "<div class=tubular-grid-search><div class=\"input-group input-group-sm\"><span class=input-group-addon><i class=\"fa fa-search\"></i> </span><input type=search name=tbTextSearchInput class=form-control placeholder=\"{{:: $ctrl.placeholder || ('UI_SEARCH' | translate) }}\" maxlength=20 ng-model=$ctrl.$component.search.Text ng-model-options=\"{ debounce: 300 }\"> <span id=tb-text-search-reset-panel class=input-group-btn ng-show=\"$ctrl.$component.search.Text.length > 0\"><button id=tb-text-search-reset-button class=\"btn btn-default\" uib-tooltip=\"{{'CAPTION_CLEAR' | translate}}\" ng-click=\"$ctrl.$component.search.Text = ''\"><i class=\"fa fa-times-circle\"></i></button></span></div></div>");
  $templateCache.put("tbColumnDateTimeFilter.tpl.html",
    "<div class=tubular-column-menu><button class=\"btn btn-xs btn-default btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=bottom popover-title={{$ctrl.filterTitle}} popover-is-open=$ctrl.isOpen popover-trigger=\"'outsideClick'\" ng-class=\"{ 'btn-success': $ctrl.filter.HasFilter }\"><i class=\"fa fa-filter\"></i></button></div>");
  $templateCache.put("tbColumnFilter.tpl.html",
    "<div class=tubular-column-menu><button class=\"btn btn-xs btn-default btn-popover\" uib-popover-template=$ctrl.templateName popover-placement=bottom popover-title={{$ctrl.filterTitle}} popover-is-open=$ctrl.isOpen popover-trigger=\"'click outsideClick'\" ng-class=\"{ 'btn-success': $ctrl.filter.HasFilter }\"><i class=\"fa fa-filter\"></i></button></div>");
  $templateCache.put("tbColumnFilterPopover.tpl.html",
    "<div><form class=tubular-column-filter-form onsubmit=\"return false;\"><select class=form-control ng-options=\"key as value for (key , value) in $ctrl.filterOperators\" ng-model=$ctrl.filter.Operator ng-hide=\"$ctrl.dataType == ' boolean' || $ctrl.onlyContains\"></select>&nbsp; <input class=form-control type=search ng-model=$ctrl.filter.Text autofocus ng-keypress=$ctrl.checkEvent($event) ng-hide=\"$ctrl.dataType == 'boolean'\" placeholder=\"{{'CAPTION_VALUE' | translate}}\" ng-disabled=\"$ctrl.filter.Operator == 'None'\"><div class=text-center ng-show=\"$ctrl.dataType == 'boolean'\"><button type=button class=\"btn btn-default btn-md\" ng-disabled=\"$ctrl.filter.Text === true\" ng-click=\"$ctrl.filter.Text = true; $ctrl.filter.Operator = 'Equals';\"><i class=\"fa fa-check\"></i></button>&nbsp; <button type=button class=\"btn btn-default btn-md\" ng-disabled=\"$ctrl.filter.Text === false\" ng-click=\"$ctrl.filter.Text = false; $ctrl.filter.Operator = 'Equals';\"><i class=\"fa fa-times\"></i></button></div><input type=search class=form-control ng-model=$ctrl.filter.Argument[0] ng-keypress=$ctrl.checkEvent($event) ng-show=\"$ctrl.filter.Operator == 'Between'\"><hr><tb-column-filter-buttons></tb-column-filter-buttons></form></div>");
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
