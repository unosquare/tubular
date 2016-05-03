(function() {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularTemplateService
         *
         * @description
         * Use `tubularTemplateService` to generate `tbGrid` and `tbForm` templates.
         * 
         * This service is just a facade to the node module expose like `tubularTemplateServiceModule`.
         */
        .service('tubularTemplateService', ['$templateCache',
            function tubularTemplateService($templateCache) {
                var me = this;

                me.enums = tubularTemplateServiceModule.enums;
                me.defaults = tubularTemplateServiceModule.defaults;

                // Loading popovers templates
                me.tbColumnFilterPopoverTemplateName = 'tbColumnFilterPopoverTemplate.html';
                me.tbColumnDateTimeFilterPopoverTemplateName = 'tbColumnDateTimeFilterPopoverTemplate.html';
                me.tbColumnOptionsFilterPopoverTemplateName = 'tbColumnOptionsFilterPopoverTemplate.html';

                if (!$templateCache.get(me.tbColumnFilterPopoverTemplateName)) {
                    me.tbColumnFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ng-hide="$ctrl.dataType == \'boolean\'"></select>&nbsp;' +
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
                    me.tbColumnDateTimeFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ng-hide="$ctrl.dataType == \'boolean\'"></select>&nbsp;' +
                        '<input class="form-control" type="date" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" '+
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                        '<input type="date" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>';

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

                me.generatePopup = function(model, title) {
                    var templateName = 'temp' + (new Date().getTime()) + '.html';
                    var template = tubularTemplateServiceModule.generatePopup(model, title);

                    $templateCache.put(templateName, template);

                    return templateName;
                };

                me.createColumns = function(model) {
                    return tubularTemplateServiceModule.createColumns(model);
                };

                me.generateForm = function(fields, options) {
                    return tubularTemplateServiceModule.generateForm(fields, options);
                };

                me.generateGrid = function(columns, options) {
                    return tubularTemplateServiceModule.generateGrid(columns, options);
                };
            }
        ]);
})();