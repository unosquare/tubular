﻿(angular => {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbFormController',
        [
            '$scope',
            '$routeParams',
            '$timeout',
            '$element',
            'tubularEditorService',
            'tubularModel',
            '$http',
            function (
                $scope,
                $routeParams,
                $timeout,
                $element,
                tubular,
                TubularModel,
                $http) {
                // we need this to find the parent of a field
                $scope.tubularDirective = 'tubular-form';
                $scope.hasFieldsDefinitions = false;
                $scope.fields = [];

                var $ctrl = this;

                $ctrl.serverSaveMethod = $scope.serverSaveMethod || 'POST'; // TODO: we are not using it
                $ctrl.name = $scope.name || tubular.getUniqueTbFormName();

                // This method is meant to provide a reference to the Angular Form
                // so we can get information about: $pristine, $dirty, $submitted, etc.
                $scope.getFormScope = () => $scope[$element.attr('name')];

                // Setup require authentication
                $ctrl.requireAuthentication = angular.isUndefined($scope.requireAuthentication)
                    ? true
                    : $scope.requireAuthentication;

                $scope.$watch('hasFieldsDefinitions', newVal => {
                        if (newVal !== true) {
                            return;
                        }

                        $ctrl.retrieveData();
                    });

                $scope.cloneModel = model => {
                    var data = {};

                    angular.forEach(model,
                        function (value, key) {
                            if (key[0] === '$') {
                                return;
                            }

                            data[key] = value;
                        });

                    $scope.model = new TubularModel($scope, $scope, data);
                    $ctrl.bindFields();
                };

                $ctrl.bindFields = () => angular.forEach($scope.fields, field => field.bindScope());

                function getUrlWithKey() {
                    const urlData = $scope.serverUrl.split('?');
                    var getUrl = urlData[0] + $scope.modelKey;

                    if (urlData.length > 1) {
                        getUrl += '?' + urlData[1];
                    }

                    return getUrl;
                }

                $ctrl.retrieveData = function () {
                    // Try to load a key from markup or route
                    $scope.modelKey = $scope.modelKey || $routeParams.param;

                    if (angular.isDefined($scope.serverUrl)) {
                        if (angular.isDefined($scope.modelKey) &&
                            $scope.modelKey != null &&
                            $scope.modelKey !== '') {
                            // TODO: Set requireAuthentication
                            $http.get(getUrlWithKey()).then(
                                function (response) {
                                    var data = response.data;
                                    $scope.model = new TubularModel($scope, $scope, data);
                                    $ctrl.bindFields();
                                },
                                function (error) {
                                    $scope.$emit('tbForm_OnConnectionError', error);
                                });
                        } else {
                            // TODO: Set requireAuthentication
                            $http.get($scope.serverUrl).then(function (response) {
                                var data = response.data;

                                if (angular.isDefined($scope.model) &&
                                    angular.isDefined($scope.model.$component)) {
                                    $scope
                                        .model = new
                                            TubularModel($scope,
                                            $scope.model.$component,
                                            data);
                                } else {
                                    $scope.model = new TubularModel($scope, $scope, data);
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
                        $scope.model = new TubularModel($scope, $scope, {});
                    }

                    $ctrl.bindFields();
                };

                $scope.save = function (forceUpdate, keepData) {
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

                            if (!keepData) {
                                $scope.clear();
                            }

                            var formScope = $scope.getFormScope();
                            if (formScope) {
                                formScope.$setPristine();
                            }
                        },
                        function (error) {
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
                    angular.forEach($scope.fields,
                        function (field) {
                            if (field.resetEditor) {
                                field.resetEditor();
                            } else {
                                field.value = field.defaultValue;
                                if (field.dateValue) field.dateValue = field.defaultValue;
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

                    $scope.$on('$destroy', () => $timeout.cancel(timer));
                };
            }
        ]);
})(angular);