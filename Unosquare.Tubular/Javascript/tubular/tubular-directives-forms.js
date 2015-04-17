(function() {
    'use strict';

    angular.module('tubular.directives').directive('tbForm',
    ['tubularHttp', function(tubularHttp) {
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
                    '$scope', '$routeParams', '$location', 'tubularModel', function ($scope, $routeParams, $location, TubularModel) {
                        $scope.tubularDirective = 'tubular-form';
                        $scope.fields = [];
                        $scope.hasFieldsDefinitions = false;
                        $scope.modelKey = $routeParams.param;
                        
                        $scope.addField = function(item) {
                            if (item.name === null) return;

                            if ($scope.hasFieldsDefinitions !== false)
                                throw 'Cannot define more fields. Field definitions have been sealed';

                            item.Name = item.name;
                            $scope.fields.push(item);
                        };

                        $scope.$watch('hasFieldsDefinitions', function(newVal) {
                            if (newVal !== true) return;
                            $scope.retrieveData();
                        });

                        $scope.bindFields = function() {
                            angular.forEach($scope.fields, function (column) {
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

                                // Ignores models without state
                                if (angular.isUndefined($scope.rowModel.$state)) return;

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

                            tubularHttp.get($scope.serverUrl + $scope.modelKey).promise.then(
                                function(data) {
                                    $scope.rowModel = new TubularModel($scope, data);

                                    $scope.bindFields();
                                }, function(error) {
                                    $scope.$emit('tbGrid_OnConnectionError', error);
                                });
                        };

                        $scope.updateRow = function(row) {
                            var request = {
                                serverUrl: $scope.serverSaveUrl,
                                requestMethod: 'PUT'
                            };

                            $scope.currentRequest = tubularHttp.saveDataAsync(row, request);

                            $scope.currentRequest.promise.then(
                                    function(data) {
                                        $scope.$emit('tbGrid_OnSuccessfulUpdate', data);
                                        $scope.$emit('tGrid_OnSuccessfulForm', data);
                                    }, function(error) {
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    })
                                .then(function() {
                                    $scope.currentRequest = null;
                                });
                        };

                        $scope.create = function () {
                            // TODO: Method could be PUT?
                            $scope.currentRequest = tubularHttp.post($scope.serverSaveUrl, $scope.rowModel).promise.then(
                                    function(data) {
                                        $scope.$emit('tbGrid_OnSuccessfulUpdate', data);
                                        $scope.$emit('tGrid_OnSuccessfulForm', data);
                                    }, function(error) {
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    })
                                .then(function() {
                                    $scope.currentRequest = null;
                                });
                        };

                        $scope.save = function () {
                            // TODO: Why Save and Create is not the same?ñ
                            if ($scope.rowModel.save() === false) {
                                $scope.$emit('tbGrid_OnSavingNoChanges', $scope.rowModel);
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