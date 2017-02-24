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
            templateUrl: 'tbColumnFilterButtons.tpl.html',
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
            templateUrl: 'tbColumnSelector.tpl.html',
            controller: ['$uibModal', function($modal) {
                    var $ctrl = this;

                    $ctrl.openColumnsSelector = function() {
                        var model = $ctrl.$component.columns;

                        var dialog = $modal.open({
                            templateUrl: 'tbColumnSelectorDialog.tpl.html',
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
            templateUrl: 'tbColumnFilter.tpl.html',
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                title: '@',
                onlyContains: '=?'
            },
            controller: [
                '$scope', 'tubularTemplateService', function($scope, tubular) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        $ctrl.onlyContains = angular.isUndefined($ctrl.onlyContains) ? false : $ctrl.onlyContains;
                        $ctrl.templateName = tubular.tbColumnFilterPopoverTemplateName;
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
                '$scope', 'tubularTemplateService', function($scope, tubular) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
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
                '$scope', 'tubularTemplateService', function ($scope, tubular) {
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
                        tubular.setupFilter($scope, $ctrl);
                        $ctrl.getOptionsFromUrl();

                        $ctrl.filter.Operator = 'Multiple';
                    };
                }
            ]
        });
})(angular);