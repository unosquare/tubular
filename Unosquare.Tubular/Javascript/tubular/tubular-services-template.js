(function(angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularTemplateService
         *
         * @description
         * Use `tubularTemplateService` to generate `tbGrid` and `tbForm` templates.
         * 
         * This service is just a facade to the node module expose like `tubularTemplate`.
         */
        .service('tubularTemplateService', [
            '$templateCache', function($templateCache) {
                var me = this;

                me.enums = tubularTemplate.enums;
                me.defaults = tubularTemplate.defaults;

                // Loading popovers templates
                me.tbColumnFilterPopoverTemplateName = 'tbColumnFilterPopoverTemplate.html';
                me.tbColumnDateTimeFilterPopoverTemplateName = 'tbColumnDateTimeFilterPopoverTemplate.html';
                me.tbColumnOptionsFilterPopoverTemplateName = 'tbColumnOptionsFilterPopoverTemplate.html';
                me.tbRemoveButtonrPopoverTemplateName = 'tbRemoveButtonrPopoverTemplate.html';

                if (!$templateCache.get(me.tbColumnFilterPopoverTemplateName)) {
                    me.tbColumnFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ' +
                        'ng-hide="$ctrl.dataType == \'boolean\' || $ctrl.onlyContains"></select>&nbsp;' +
                        '<input class="form-control" type="search" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ng-hide="$ctrl.dataType == \'boolean\'"' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                        '<div class="text-center" ng-show="$ctrl.dataType == \'boolean\'">' +
                        '<button type="button" class="btn btn-default btn-md" ng-disabled="$ctrl.filter.Text === true" ng-click="$ctrl.filter.Text = true; $ctrl.filter.Operator = \'Equals\';">' +
                        '<i class="fa fa-check"></i></button>&nbsp;' +
                        '<button type="button" class="btn btn-default btn-md" ng-disabled="$ctrl.filter.Text === false" ng-click="$ctrl.filter.Text = false; $ctrl.filter.Operator = \'Equals\';">' +
                        '<i class="fa fa-times"></i></button></div>' +
                        '<input type="search" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>';

                    $templateCache.put(me.tbColumnFilterPopoverTemplateName, me.tbColumnFilterPopoverTemplate);
                }

                if (!$templateCache.get(me.tbColumnDateTimeFilterPopoverTemplateName)) {
                    var htmlDateSelector = '<input class="form-control" type="date" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                        '<input type="date" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />';

                    var bootstrapDateSelector = '<div class="input-group">' +
                        '<input type="text" class="form-control" uib-datepicker-popup="MM/dd/yyyy" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" is-open="$ctrl.dateOpen" />' +
                        '<span class="input-group-btn">' +
                        '<button type="button" class="btn btn-default" ng-click="$ctrl.dateOpen = !$ctrl.dateOpen;"><i class="fa fa-calendar"></i></button>' +
                        '</span>' +
                        '</div>';

                    me.tbColumnDateTimeFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ng-hide="$ctrl.dataType == \'boolean\'"></select>&nbsp;' +
                        (tubularTemplate.canUseHtml5Date ? htmlDateSelector : bootstrapDateSelector) +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form>' +
                        '</div>';
                    
                    $templateCache.put(me.tbColumnDateTimeFilterPopoverTemplateName, me.tbColumnDateTimeFilterPopoverTemplate);
                }

                if (!$templateCache.get(me.tbColumnOptionsFilterPopoverTemplateName)) {
                    me.tbColumnOptionsFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control checkbox-list" ng-options="item for item in $ctrl.optionsItems" ' +
                        'ng-model="$ctrl.filter.Argument" multiple ng-disabled="$ctrl.dataIsLoaded == false"></select>&nbsp;' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>';

                    $templateCache.put(me.tbColumnOptionsFilterPopoverTemplateName, me.tbColumnOptionsFilterPopoverTemplate);
                }

                if (!$templateCache.get(me.tbRemoveButtonrPopoverTemplateName)) {
                    me.tbRemoveButtonrPopoverTemplate = '<div class="tubular-remove-popover">' +
                        '<button ng-click="$ctrl.model.delete()" class="btn btn-danger btn-xs">' +
                        '{{:: $ctrl.caption || (\'CAPTION_REMOVE\' | translate) }}' +
                        '</button>' +
                        '&nbsp;' +
                        '<button ng-click="$ctrl.isOpen = false;" class="btn btn-default btn-xs">' +
                        '{{:: $ctrl.cancelCaption || (\'CAPTION_CANCEL\' | translate) }}' +
                        '</button>' +
                        '</div>';

                    $templateCache.put(me.tbRemoveButtonrPopoverTemplateName, me.tbRemoveButtonrPopoverTemplate);
                }

                me.generatePopup = function(model, title) {
                    var templateName = 'temp' + (new Date().getTime()) + '.html';
                    var template = tubularTemplate.generatePopup(model, title);

                    $templateCache.put(templateName, template);

                    return templateName;
                };

                me.createColumns = tubularTemplate.createColumns;

                me.generateForm = tubularTemplate.generateForm;

                me.generateGrid = tubularTemplate.generateGrid;

                me.setupFilter = function($scope, $element, $compile, $filter, $ctrl) {
                    var filterOperators = {
                        'string': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Contains': $filter('translate')('OP_CONTAINS'),
                            'NotContains': $filter('translate')('OP_NOTCONTAINS'),
                            'StartsWith': $filter('translate')('OP_STARTSWITH'),
                            'NotStartsWith': $filter('translate')('OP_NOTSTARTSWITH'),
                            'EndsWith': $filter('translate')('OP_ENDSWITH'),
                            'NotEndsWith': $filter('translate')('OP_NOTENDSWITH')
                        },
                        'numeric': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'date': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'datetime': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'datetimeutc': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'boolean': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS')
                        }
                    };

                    $ctrl.filter = {
                        Text: $ctrl.text || null,
                        Argument: $ctrl.argument ? [$ctrl.argument] : null,
                        Operator: $ctrl.operator || "Contains",
                        OptionsUrl: $ctrl.optionsUrl || null,
                        HasFilter: !($ctrl.text == null),
                        Name: $scope.$parent.$parent.column.Name
                    };

                    $ctrl.filterTitle = $ctrl.title || $filter('translate')('CAPTION_FILTER');

                    $scope.$watch(function() {
                        var columns = $ctrl.$component.columns.filter(function(e) { return e.Name === $ctrl.filter.Name; });

                        return columns.length !== 0 ? columns[0] : null;
                    }, function(val) {
                        if (!val) return;

                        if ($ctrl.filter.HasFilter !== val.Filter.HasFilter) {
                            $ctrl.filter.HasFilter = val.Filter.HasFilter;
                            $ctrl.filter.Text = val.Filter.Text;
                            $ctrl.retrieveData();
                        }
                    }, true);

                    $ctrl.retrieveData = function() {
                        var columns = $ctrl.$component.columns.filter(function(e) { return e.Name === $ctrl.filter.Name; });

                        if (columns.length !== 0) {
                            columns[0].Filter = $ctrl.filter;
                        }

                        $ctrl.$component.retrieveData();
                        $ctrl.close();
                    };

                    $ctrl.clearFilter = function() {
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

                    $ctrl.applyFilter = function() {
                        $ctrl.filter.HasFilter = true;
                        $ctrl.retrieveData();
                    };

                    $ctrl.close = function() {
                        $ctrl.isOpen = false;
                    };

                    $ctrl.checkEvent = function(keyEvent) {
                        if (keyEvent.which === 13) {
                            $ctrl.applyFilter();
                            keyEvent.preventDefault();
                        }
                    };

                    var columns = $ctrl.$component.columns.filter(function(e) { return e.Name === $ctrl.filter.Name; });

                    $scope.$watch('$ctrl.filter.Operator', function(val) {
                        if (val === 'None') $ctrl.filter.Text = '';
                    });

                    if (columns.length === 0) return;

                    $scope.$watch('$ctrl.filter', function(n) {
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

                    if ($ctrl.dataType === 'date' || $ctrl.dataType === 'datetime' || $ctrl.dataType === 'datetimeutc') {
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
})(window.angular);