(function (angular) {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbFormController',['$scope', '$routeParams', 'tubularModel', 'tubularHttp', '$timeout', '$element', 'tubularEditorService',
                        function ($scope, $routeParams, TubularModel, tubularHttp, $timeout, $element, tubular) {
                            $scope.tubularDirective = 'tubular-form';
                            $scope.serverSaveMethod = $scope.serverSaveMethod || 'POST';
                            $scope.fields = [];
                            $scope.hasFieldsDefinitions = false;
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);
                            $scope.name = $scope.name || tubular.getUniqueTbFormName();

                            // This method is meant to provide a reference to the Angular Form
                            // so we can get information about: $pristine, $dirty, $submitted, etc.
                            $scope.getFormScope = function () {
                                return $scope[$element.attr('name')];
                            };

                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;
                            tubularHttp.setRequireAuthentication($scope.requireAuthentication);

                            $scope.$watch('hasFieldsDefinitions', function (newVal) {
                                if (newVal !== true) return;
                                $scope.retrieveData();
                            });

                            $scope.cloneModel = function(model) {
                                var data = {};

                                angular.forEach(model, function(value, key) {
                                    if (key[0] === '$') return;

                                    data[key] = value;
                                });

                                $scope.model = new TubularModel($scope, $scope, data, $scope.dataService);
                                $scope.bindFields();
                            };

                            $scope.bindFields = function () {
                                angular.forEach($scope.fields, function (field) {
                                    field.bindScope();
                                });
                            };

                            $scope.retrieveData = function () {
                                // Try to load a key from markup or route
                                $scope.modelKey = $scope.modelKey || $routeParams.param;

                                if (angular.isDefined($scope.serverUrl)) {
                                    if (angular.isDefined($scope.modelKey) &&
                                        $scope.modelKey != null &&
                                        $scope.modelKey !== '') {
                                        $scope.dataService.getByKey($scope.serverUrl, $scope.modelKey).promise.then(
                                            function (data) {
                                                $scope.model = new TubularModel($scope, $scope, data, $scope.dataService);
                                                $scope.bindFields();
                                            }, function (error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                            });
                                    } else {
                                        $scope.dataService.get(tubularHttp.addTimeZoneToUrl($scope.serverUrl)).promise.then(
                                            function (data) {
                                                var innerScope = $scope;
                                                var dataService = $scope.dataService;

                                                if (angular.isDefined($scope.model) && angular.isDefined($scope.model.$component)) {
                                                    innerScope = $scope.model.$component;
                                                    dataService = $scope.model.$component.dataService;
                                                }

                                                $scope.model = new TubularModel(innerScope, innerScope, data, dataService);
                                                $scope.bindFields();
                                                $scope.model.$isNew = true;
                                            }, function (error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                            });
                                    }

                                    return;
                                }

                                if (angular.isUndefined($scope.model)) {
                                    $scope.model = new TubularModel($scope, $scope, {}, $scope.dataService);
                                }

                                $scope.bindFields();
                            };

                            $scope.save = function (forceUpdate) {
                                if (!$scope.model.$valid()) {
                                    return;
                                }

                                $scope.currentRequest = $scope.model.save(forceUpdate);

                                if ($scope.currentRequest === false) {
                                    $scope.$emit('tbForm_OnSavingNoChanges', $scope);
                                    return;
                                }

                                $scope.currentRequest.then(
                                        function (data) {
                                            if (angular.isDefined($scope.model.$component) &&
                                                angular.isDefined($scope.model.$component.autoRefresh) &&
                                                $scope.model.$component.autoRefresh) {
                                                $scope.model.$component.retrieveData();
                                            }

                                            $scope.$emit('tbForm_OnSuccessfulSave', data, $scope);
                                            $scope.clear();

                                            var formScope = $scope.getFormScope();
                                            if (formScope) formScope.$setPristine();
                                        }, function (error) {
                                            $scope.$emit('tbForm_OnConnectionError', error, $scope);
                                        })
                                    .then(function () {
                                        $scope.model.$isLoading = false;
                                        $scope.currentRequest = null;
                                    });
                            };

                            $scope.update = function (forceUpdate) {
                                $scope.save(forceUpdate);
                            };

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
                                    }
                                });
                            };

                            $scope.finishDefinition = function () {
                                var timer = $timeout(function () {
                                    $scope.hasFieldsDefinitions = true;

                                    if ($element.find('input').length) {
                                        $element.find('input')[0].focus();
                                    }
                                }, 0);

                                $scope.$emit('tbForm_OnGreetParentController', $scope);

                                $scope.$on('$destroy', function () { $timeout.cancel(timer); });
                            };
                        }
        ]);


})(angular);