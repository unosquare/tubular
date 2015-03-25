(function() {
    'use strict';

    angular.module('tubular.directives').directive('tubularForm',
    [
        'tubularGridService', function(tubularGridService) {
            return {
                template: '<form ng-transclude></form>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    rowModel: '=?',
                    serverUrl: '@',
                    serverSaveUrl: '@',
                    isNew: '@'
                },
                controller: [
                    '$scope', '$routeParams', '$location', 'tubularModel', function($scope, $routeParams, $location, TubularModel) {
                        $scope.tubularDirective = 'tubular-form';
                        $scope.requestTimeout = 10000;
                        $scope.columns = []; // TODO: Rename, right now for compatibility is columns
                        $scope.hasFieldsDefinitions = false;
                        $scope.modelKey = $routeParams.param;

                        $scope.addField = function(item) {
                            if (item.name === null) return;

                            if ($scope.hasFieldsDefinitions !== false)
                                throw 'Cannot define more fields. Field definitions have been sealed';

                            item.Name = item.name;
                            $scope.columns.push(item);
                        };

                        $scope.$watch('hasFieldsDefinitions', function(newVal) {
                            if (newVal !== true) return;
                            $scope.retrieveData();
                        });

                        $scope.bindFields = function() {
                            angular.forEach($scope.columns, function(column) {
                                column.$parent.Model = $scope.rowModel;

                                // TODO: this behavior is nice, but I don't know how to apply to inline editors
                                if (column.$editorType == 'input' &&
                                    angular.equals(column.value, $scope.rowModel[column.Name]) == false) {
                                    column.value = $scope.rowModel[column.Name];

                                    $scope.$watch(function() {
                                        return column.value;
                                    }, function(value) {
                                        $scope.rowModel[column.Name] = value;
                                    });
                                }

                                if (angular.equals(column.state, $scope.rowModel.$state[column.Name]) == false) {
                                    column.state = $scope.rowModel.$state[column.Name];
                                }
                            });
                        };

                        $scope.retrieveData = function() {
                            if (angular.isUndefined($scope.serverUrl)) {
                                if (angular.isUndefined($scope.rowModel)) {
                                    $scope.rowModel = new TubularModel($scope, {});
                                }

                                $scope.bindFields();

                                return;
                            }

                            var currentRequest = tubularGridService.getDataAsync({
                                serverUrl: $scope.serverUrl + $scope.modelKey,
                                requestMethod: 'GET',
                                timeout: 1000
                            });

                            currentRequest.promise.then(
                                function(data) {
                                    $scope.rowModel = new TubularModel($scope, data);

                                    $scope.bindFields();
                                }, function(error) {
                                    $scope.$emit('tubularGrid_OnConnectionError', error);
                                });
                        };

                        $scope.updateRow = function(row) {
                            var request = {
                                serverUrl: $scope.serverSaveUrl,
                                requestMethod: 'PUT',
                                timeout: $scope.requestTimeout
                            };

                            var returnValue = true;
                            $scope.currentRequest = tubularGridService.saveDataAsync(row, request);

                            $scope.currentRequest.promise.then(
                                    function(data) {
                                        $scope.$emit('tubularGrid_OnSuccessfulUpdate', data);
                                        $scope.$emit('tubularGrid_OnSuccessfulForm', data);
                                    }, function(error) {
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                        returnValue = false;
                                    })
                                .then(function() {
                                    $scope.currentRequest = null;
                                });

                            return returnValue;
                        };

                        $scope.create = function() {
                            var request = {
                                serverUrl: $scope.serverSaveUrl,
                                requestMethod: 'POST',
                                timeout: $scope.requestTimeout,
                                data: $scope.rowModel
                            };

                            $scope.currentRequest = tubularGridService.getDataAsync(request);

                            $scope.currentRequest.promise.then(
                                    function(data) {
                                        $scope.$emit('tubularGrid_OnSuccessfulUpdate', data);
                                        $scope.$emit('tubularGrid_OnSuccessfulForm', data);
                                    }, function(error) {
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                    })
                                .then(function() {
                                    $scope.currentRequest = null;
                                });
                        };

                        $scope.save = function() {
                            if ($scope.rowModel.save() == false) {
                                $scope.$emit('tubularGrid_OnSavingNoChanges', $scope.rowModel);
                            }
                        };

                        $scope.gotoView = function(view) {
                            $location.path(view);
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