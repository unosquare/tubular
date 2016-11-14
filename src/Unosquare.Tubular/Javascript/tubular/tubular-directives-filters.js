(function(angular) {
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
            template: '<div class="text-right">' +
                '<button class="btn btn-sm btn-success" ng-click="$ctrl.currentFilter.applyFilter()"' +
                'ng-disabled="$ctrl.currentFilter.filter.Operator == \'None\'">{{::\'CAPTION_APPLY\' | translate}}</button>&nbsp;' +
                '<button class="btn btn-sm btn-danger" ng-click="$ctrl.currentFilter.clearFilter()">{{::\'CAPTION_CLEAR\' | translate}}</button>' +
                '</div>',
            controller: ['$scope', function($scope) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        // Set currentFilter to either one of the parent components or for when this template is being rendered by $compile
                        $ctrl.currentFilter = $ctrl.$columnFilter || $ctrl.$columnDateTimeFilter || $ctrl.$columnOptionsFilter || $scope.$parent.$ctrl;
                    };
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
            template: '<button class="btn btn-sm btn-default" ng-click="$ctrl.openColumnsSelector()">{{::\'CAPTION_SELECTCOLUMNS\' | translate}}</button></div>',
            controller: ['$uibModal', function($modal) {
                    var $ctrl = this;

                    $ctrl.openColumnsSelector = function() {
                        var model = $ctrl.$component.columns;

                        var dialog = $modal.open({
                            template: '<div class="modal-header">' +
                                '<h3 class="modal-title">{{::\'CAPTION_SELECTCOLUMNS\' | translate}}</h3>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                '<table class="table table-bordered table-responsive table-striped table-hover table-condensed">' +
                                '<thead><tr><th>Visible?</th><th>Name</th></tr></thead>' +
                                '<tbody><tr ng-repeat="col in Model">' +
                                '<td><input type="checkbox" ng-model="col.Visible" ng-disabled="col.Visible && isInvalid()" /></td>' +
                                '<td>{{col.Label}}</td>' +
                                '</tr></tbody></table></div>' +
                                '</div>' +
                                '<div class="modal-footer"><button class="btn btn-warning" ng-click="closePopup()">{{::\'CAPTION_CLOSE\' | translate}}</button></div>',
                            backdropClass: 'fullHeight',
                            animation: false,
                            controller: [
                                '$scope', function($innerScope) {
                                    $innerScope.Model = model;
                                    $innerScope.isInvalid = function () {
                                        return $innerScope.Model.filter(function (el) { return el.Visible; }).length === 1;
                                    };

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
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ' +
                'uib-popover-template="$ctrl.templateName" popover-placement="bottom" popover-title="{{$ctrl.filterTitle}}" popover-is-open="$ctrl.isOpen"' +
                ' popover-trigger="\'click outsideClick\'" ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '</div>',
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                title: '@',
                onlyContains: '=?'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', 'tubularTemplateService', function($scope, $element, $compile, $filter, tubular) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        $ctrl.onlyContains = angular.isUndefined($ctrl.onlyContains) ? false : $ctrl.onlyContains;
                        $ctrl.templateName = tubular.tbColumnFilterPopoverTemplateName;
                        tubular.setupFilter($scope, $element, $compile, $filter, $ctrl);
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
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ' +
                'uib-popover-template="$ctrl.templateName" popover-placement="bottom" popover-title="{{$ctrl.filterTitle}}" popover-is-open="$ctrl.isOpen" ' +
                'popover-trigger="\'outsideClick\'" ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '</div>',
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', 'tubularTemplateService', function($scope, $element, $compile, $filter, tubular) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        $ctrl.templateName = tubular.tbColumnDateTimeFilterPopoverTemplateName;
                        tubular.setupFilter($scope, $element, $compile, $filter, $ctrl);
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
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" uib-popover-template="$ctrl.templateName" popover-placement="bottom" ' +
                'popover-title="{{$ctrl.filterTitle}}" popover-is-open="$ctrl.isOpen" popover-trigger="\'click outsideClick\'" ' +
                'ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '</div>',
            bindings: {
                argument: '@',
                operator: '@',
                optionsUrl: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', 'tubularTemplateService', function ($scope, $element, $compile, $filter, tubular) {
                    var $ctrl = this;

                    $ctrl.getOptionsFromUrl = function() {
                        if ($ctrl.dataIsLoaded) {
                            $scope.$apply();
                            return;
                        }

                        var currentRequest = $ctrl.$component.dataService.retrieveDataAsync({
                            serverUrl: $ctrl.filter.OptionsUrl,
                            requestMethod: 'GET'
                        });

                        currentRequest.promise.then(
                            function(data) {
                                $ctrl.optionsItems = data;
                                $ctrl.dataIsLoaded = true;
                            }, function(error) {
                                $scope.$emit('tbGrid_OnConnectionError', error);
                            });
                    };

                    $ctrl.$onInit = function() {
                        $ctrl.dataIsLoaded = false;
                        $ctrl.templateName = tubular.tbColumnOptionsFilterPopoverTemplateName;
                        tubular.setupFilter($scope, $element, $compile, $filter, $ctrl);
                        $ctrl.getOptionsFromUrl();

                        $ctrl.filter.Operator = 'Multiple';
                    };
                }
            ]
        });
})(window.angular);