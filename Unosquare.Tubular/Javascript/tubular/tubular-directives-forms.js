(function() {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbForm
         * @restrict E
         *
         * @description
         * The `tbForm` directive is the base to create any form. You can define a `dataService` and a
         * `modelKey` to auto-load a record. The `serverSaveUrl` can be used to create a new or update
         * an existing record.
         * 
         * @scope
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverSaveMethod Set HTTP Method to save data.
         * @param {object} model The object model to show in the form.
         * @param {boolean} isNew Set if the form is for create a new record.
         * @param {string} modelKey Defines the fields to use like Keys.
         * @param {string} formName Defines the form name.
         * @param {string} serviceName Define Data service (name) to retrieve data, defaults `tubularHttp`.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         */
        .directive('tbForm', [
            function() {
                return {
                    template: '<form ng-transclude></form>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        model: '=?',
                        serverUrl: '@',
                        serverSaveUrl: '@',
                        serverSaveMethod: '@',
                        isNew: '@',
                        modelKey: '@?',
                        dataServiceName: '@?serviceName',
                        requireAuthentication: '=?',
                        name: '@?formName'
                    },
                    controller: [
                        '$scope', '$routeParams', 'tubularModel', 'tubularHttp', '$timeout', '$element',
                        function($scope, $routeParams, TubularModel, tubularHttp, $timeout, $element) {
                            $scope.tubularDirective = 'tubular-form';
                            $scope.serverSaveMethod = $scope.serverSaveMethod || 'POST';
                            $scope.fields = [];
                            $scope.hasFieldsDefinitions = false;
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);

                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;
                            tubularHttp.setRequireAuthentication($scope.requireAuthentication);

                            $scope.$watch('hasFieldsDefinitions', function(newVal) {
                                if (newVal !== true) return;
                                $scope.retrieveData();
                            });

                            $scope.bindFields = function() {
                                angular.forEach($scope.fields, function(field) {
                                    field.bindScope();
                                });
                            };

                            $scope.retrieveData = function() {
                                // Try to load a key from markup or route
                                $scope.modelKey = $scope.modelKey || $routeParams.param;

                                if (angular.isDefined($scope.serverUrl)) {
                                    if (angular.isDefined($scope.modelKey) &&
                                        $scope.modelKey != null &&
                                        $scope.modelKey !== '') {
                                        $scope.dataService.getByKey($scope.serverUrl, $scope.modelKey).promise.then(
                                            function(data) {
                                                $scope.model = new TubularModel($scope, data, $scope.dataService);
                                                $scope.bindFields();
                                            }, function(error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                            });
                                    } else {
                                        $scope.dataService.get(tubularHttp.addTimeZoneToUrl($scope.serverUrl)).promise.then(
                                            function(data) {
                                                var innerScope = $scope;
                                                var dataService = $scope.dataService;

                                                if (angular.isDefined($scope.model) && angular.isDefined($scope.model.$component)) {
                                                    innerScope = $scope.model.$component;
                                                    dataService = $scope.model.$component.dataService;
                                                }

                                                $scope.model = new TubularModel(innerScope, data, dataService);
                                                $scope.bindFields();
                                                $scope.model.$isNew = true;
                                            }, function(error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                            });
                                    }

                                    return;
                                }

                                if (angular.isUndefined($scope.model)) {
                                    $scope.model = new TubularModel($scope, {}, $scope.dataService);
                                }

                                $scope.bindFields();
                            };

                            $scope.save = function () {
                                if (!$scope.model.$valid()) {
                                    return;
                                }

                                $scope.currentRequest = $scope.model.save();

                                if ($scope.currentRequest === false) {
                                    $scope.$emit('tbForm_OnSavingNoChanges', $scope);
                                    return;
                                }

                                $scope.currentRequest.then(
                                        function(data) {
                                            if (angular.isDefined($scope.model.$component) &&
                                                angular.isDefined($scope.model.$component.autoRefresh) &&
                                                $scope.model.$component.autoRefresh) {
                                                $scope.model.$component.retrieveData();
                                            }

                                            $scope.$emit('tbForm_OnSuccessfulSave', data, $scope);
                                        }, function(error) {
                                            $scope.$emit('tbForm_OnConnectionError', error, $scope);
                                        })
                                    .then(function() {
                                        $scope.model.$isLoading = false;
                                        $scope.currentRequest = null;
                                    });
                            };

                            $scope.update = function() {
                                $scope.save();
                            };

                            $scope.create = function() {
                                $scope.model.$isNew = true;
                                $scope.save();
                            };

                            $scope.cancel = function() {
                                $scope.$emit('tbForm_OnCancel', $scope.model);
                            };

                            $scope.clear = function() {
                                angular.forEach($scope.fields, function(field) {
                                    if (field.resetEditor) {
                                        field.resetEditor();
                                    } else {
                                        field.value = field.defaultValue;
                                    }
                                });
                            };

                            $scope.finishDefinition = function() {
                                var timer = $timeout(function() {
                                    $scope.hasFieldsDefinitions = true;

                                    if ($element.find('input').length) {
                                        $element.find('input')[0].focus();
                                    }
                                }, 0);

                                $scope.$emit('tbForm_OnGreetParentController', $scope);
                                $scope.$on('$destroy', function() { $timeout.cancel(timer); });
                            };
                        }
                    ],
                    compile: function compile() {
                        return {
                            post: function(scope) {
                                scope.finishDefinition();
                            }
                        };
                    }
                };
            }
        ]);
})();