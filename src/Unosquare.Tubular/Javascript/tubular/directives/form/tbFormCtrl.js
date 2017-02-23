(function (angular) {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbFormController', ['$scope', '$routeParams', 'tubularModel', 'tubularHttp', '$timeout', '$element', 'tubularEditorService',
                        function ($scope, $routeParams, TubularModel, tubularHttp, $timeout, $element, tubular) {
                            // we need this to find the parent of a field
                            $scope.tubularDirective = 'tubular-form';
                            $scope.hasFieldsDefinitions = false;
                            $scope.fields = [];
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);

                            var $ctrl = this;

                            $ctrl.serverSaveMethod = $scope.serverSaveMethod || 'POST'; // TODO: we are not using it
                            $ctrl.name = $scope.name || tubular.getUniqueTbFormName();

                            // This method is meant to provide a reference to the Angular Form
                            // so we can get information about: $pristine, $dirty, $submitted, etc.
                            $scope.getFormScope = function () {
                                return $scope[$element.attr('name')];
                            };

                            // Setup require authentication
                            $ctrl.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;
                            tubularHttp.setRequireAuthentication($ctrl.requireAuthentication);

                            $scope.$watch('hasFieldsDefinitions', function (newVal) {
                                if (newVal !== true) {
                                    return;
                                }

                                $ctrl.retrieveData();
                            });

                            $scope.cloneModel = function (model) {
                                var data = {};

                                angular.forEach(model, function (value, key) {
                                    if (key[0] === '$') {
                                        return;
                                    }

                                    data[key] = value;
                                });

                                $scope.model = new TubularModel($scope, $scope, data, $scope.dataService);
                                $ctrl.bindFields();
                            };

                            $ctrl.bindFields = function () {
                                angular.forEach($scope.fields, function (field) {
                                    field.bindScope();
                                });
                            };

                           $ctrl.retrieveData = function () {
                                // Try to load a key from markup or route
                                $scope.modelKey = $scope.modelKey || $routeParams.param;

                                if (angular.isDefined($scope.serverUrl)) {
                                    if (angular.isDefined($scope.modelKey) &&
                                        $scope.modelKey != null &&
                                        $scope.modelKey !== '') {
                                        $scope.dataService.getByKey($scope.serverUrl, $scope.modelKey).promise.then(
                                            function (data) {
                                                $scope.model = new TubularModel($scope, $scope, data, $scope.dataService);
                                                $ctrl.bindFields();
                                            }, function (error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                            });
                                    } else {
                                        $scope.dataService.get(tubularHttp.addTimeZoneToUrl($scope.serverUrl)).promise.then(
                                            function (data) {
                                                if (angular.isDefined($scope.model) &&
                                                    angular.isDefined($scope.model.$component)) {
                                                    $scope.model = new TubularModel($scope, $scope.model.$component, data, $scope.model.$component.dataService);
                                                } else {
                                                    $scope.model = new TubularModel($scope, $scope, data, $scope.dataService);
                                                }

                                                $ctrl.bindFields();
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

                                $ctrl.bindFields();
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
                                                $scope.model.$component.autoRefresh) {
                                                $scope.model.$component.retrieveData();
                                            }

                                            $scope.$emit('tbForm_OnSuccessfulSave', data, $scope);
                                            $scope.clear();

                                            var formScope = $scope.getFormScope();
                                            if (formScope) {
                                                formScope.$setPristine();
                                            }
                                        }, function (error) {
                                            $scope.$emit('tbForm_OnConnectionError', error, $scope);
                                        })
                                    .then(function () {
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

                                $scope.$emit('tbForm_OnGreetParentController', { controller: $ctrl, scope: $scope });

                                $scope.$on('$destroy', function () { $timeout.cancel(timer); });
                            };
                        }
        ]);
})(angular);