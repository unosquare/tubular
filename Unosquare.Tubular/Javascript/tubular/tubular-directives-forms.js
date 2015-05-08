(function() {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbForm
         * @restrict E
         *
         * @description
         * The `tbForm` directive is the base to create any form.
         * 
         * @scope
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
                        gridDataService: '=?service',
                        gridDataServiceName: '@?serviceName',
                        requireAuthentication: '=?'
                    },
                    controller: [
                        '$scope', '$routeParams', 'tubularModel', 'tubularHttp', 'tubularOData',
                        function($scope, $routeParams, TubularModel, tubularHttp, tubularOData) {
                            $scope.tubularDirective = 'tubular-form';
                            $scope.serverSaveMethod = $scope.serverSaveMethod || 'POST';
                            $scope.fields = [];
                            $scope.hasFieldsDefinitions = false;
                            // Try to load a key from markup or route
                            $scope.modelKey = $scope.modelKey || $routeParams.param;

                            $scope.gridDataService = $scope.gridDataService || tubularHttp;

                            // Helper to use OData without controller
                            if ($scope.gridDataServiceName === 'odata') {
                                $scope.gridDataService = tubularOData;
                            }

                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;
                            $scope.gridDataService.setRequireAuthentication($scope.requireAuthentication);

                            $scope.$watch('hasFieldsDefinitions', function(newVal) {
                                if (newVal !== true) return;
                                $scope.retrieveData();
                            });

                            $scope.bindFields = function() {
                                angular.forEach($scope.fields, function(field) {
                                    field.$parent.Model = $scope.model;

                                    if (field.$editorType == 'input' &&
                                        angular.equals(field.value, $scope.model[field.Name]) == false) {
                                        field.value = (field.DataType == 'date') ? new Date($scope.model[field.Name]) : $scope.model[field.Name];

                                        $scope.$watch(function() {
                                            return field.value;
                                        }, function(value) {
                                            $scope.model[field.Name] = value;
                                        });
                                    }

                                    // Ignores models without state
                                    if (angular.isUndefined($scope.model.$state)) return;

                                    if (angular.equals(field.state, $scope.model.$state[field.Name]) == false) {
                                        field.state = $scope.model.$state[field.Name];
                                    }
                                });
                            };

                            $scope.retrieveData = function() {
                                if (angular.isUndefined($scope.serverUrl)) {
                                    if (angular.isUndefined($scope.model)) {
                                        $scope.model = new TubularModel($scope, {}, $scope.gridDataService);
                                    }

                                    $scope.bindFields();

                                    return;
                                }

                                if (angular.isUndefined($scope.modelKey) || $scope.modelKey == null || $scope.modelKey == '')
                                    return;

                                $scope.gridDataService.getByKey($scope.serverUrl, $scope.modelKey).promise.then(
                                    function(data) {
                                        $scope.model = new TubularModel($scope, data, $scope.gridDataService);
                                        $scope.bindFields();
                                    }, function(error) {
                                        $scope.$emit('tbForm_OnConnectionError', error);
                                    });
                            };

                            $scope.save = function() {
                                $scope.currentRequest = $scope.model.save();

                                if ($scope.currentRequest === false) {
                                    $scope.$emit('tbForm_OnSavingNoChanges', $scope.model);
                                    return;
                                }

                                $scope.currentRequest.then(
                                        function(data) {
                                            $scope.$emit('tbForm_OnSuccessfulSave', data);
                                        }, function(error) {
                                            $scope.$emit('tbForm_OnConnectionError', error);
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
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                scope.hasFieldsDefinitions = true;
                            }
                        };
                    }
                };
            }
        ]);
})();