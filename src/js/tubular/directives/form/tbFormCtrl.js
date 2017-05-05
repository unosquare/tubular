(angular => {
    'use strict';
    var tbFormCounter = 0;

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
                    if (angular.isDefined($scope.modelKey) &&
                            $scope.modelKey &&
                            $scope.modelKey !== '') {
                        const urlData = $scope.serverUrl.split('?');
                        var getUrl = urlData[0] + $scope.modelKey;

                        if (urlData.length > 1) {
                            getUrl += '?' + urlData[1];
                        }

                        return getUrl;
                    }

                    return $scope.serverUrl;
                }

                var $ctrl = this;

                $ctrl.serverSaveMethod = $scope.serverSaveMethod || 'POST';
                $ctrl.name = $scope.name || ('tbForm' + tbFormCounter++);

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
                    var data = {};

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
                        // TODO: Set requireAuthentication
                        $http.get(getUrlWithKey()).then(response => {
                            if (angular.isDefined($scope.model) &&
                                angular.isDefined($scope.model.$component)) {
                                $scope.model = new TubularModel($scope.model.$component, response.data);
                            } else {
                                $scope.model = new TubularModel($scope, response.data);
                            }

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

                    // TODO: Set requireAuthentication
                    $scope.currentRequest = $http({
                        data: $scope.model,
                        url: $ctrl.serverSaveUrl,
                        method: $scope.model.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT'
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
                    var timer = $timeout(() => {
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