(function() {
    'use strict';
    
    angular.module('tubular.directives').directive('tubularSimpleEditor', ['tubularEditorService',
            function (tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value}}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<input type="{{editorType}}" ng-show="isEditing" ng-model="value" class="form-control" ' +
                            ' ng-required="required" />' +
                        '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.validate = function() {
                                if (angular.isUndefined($scope.min) == false && angular.isUndefined($scope.value) == false) {
                                    if ($scope.value.length < parseInt($scope.min)) {
                                        $scope.$valid = false;
                                        $scope.state.$errors = ["The fields needs to be minimum " + $scope.min + " chars"];
                                        return;
                                    }
                                }

                                if (angular.isUndefined($scope.max) == false && angular.isUndefined($scope.value) == false) {
                                    if ($scope.value.length > parseInt($scope.max)) {
                                        $scope.$valid = false;
                                        $scope.state.$errors = ["The fields needs to be maximum " + $scope.min + " chars"];
                                        return;
                                    }
                                }
                            };

                            tubularEditorService.setupScope($scope);
                        }
                    ]
                };
            }
    ]).directive('tubularNumericEditor', ['tubularEditorService', function (tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value | numberorcurrency: format }}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<div class="input-group" ng-show="isEditing">' +
                        '<div class="input-group-addon" ng-show="format == \'C\'">$</div>' +
                        '<input type="number" ng-model="value" class="form-control" ' +
                            'ng-required="required" />' +
                        '</div>' +
                        '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.validate = function() {
                                if (angular.isUndefined($scope.min) == false && angular.isUndefined($scope.value) == false) {
                                    $scope.$valid = $scope.value >= $scope.min;
                                    if ($scope.$valid == false)
                                        $scope.state.$errors = ["The minimum is " + $scope.min];
                                }

                                if ($scope.$valid == false) return;

                                if (angular.isUndefined($scope.max) == false && angular.isUndefined($scope.value) == false) {
                                    $scope.$valid = $scope.value <= $scope.max;
                                    if ($scope.$valid == false)
                                        $scope.state.$errors = ["The maximum is " + $scope.max];
                                }
                            };

                            tubularEditorService.setupScope($scope, 0);
                        }
                    ]
                };
            }
    ]).directive('tubularDateTimeEditor', ['tubularEditorService', function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing }">' +
                    '<span ng-hide="isEditing">{{ value | date: format }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<input type="datetime-local" ng-show="isEditing" ng-model="value" class="form-control" />' +
                    '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function ($scope) {
                        $scope.DataType = "numeric";

                        $scope.validate = function() {
                            if (angular.isUndefined($scope.min) == false) {
                                $scope.$valid = $scope.value >= $scope.min;
                                if ($scope.$valid == false)
                                    $scope.state.$errors = ["The minimum is " + $scope.min];
                            }

                            if ($scope.$valid == false) return;

                            if (angular.isUndefined($scope.max) == false) {
                                $scope.$valid = $scope.value <= $scope.max;
                                if ($scope.$valid == false)
                                    $scope.state.$errors = ["The maximum is " + $scope.max];
                            }
                        };

                        tubularEditorService.setupScope($scope, 'yyyy-MM-dd HH:mm');
                    }
                ],
                compile: function compile(cElement, cAttrs) {
                    return {
                        pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                        post: function(scope, lElement, lAttrs, lController, lTransclude) {
                            var inp = $(lElement).find("input[type=datetime-local]")[0];
                            if (inp.type !== 'datetime-local') {
                                $(inp).datepicker({
                                    dateFormat: scope.format.toLowerCase()
                                }).on("dateChange", function(e) {
                                    scope.value = e.date;
                                    scope.$parent.Model.$hasChanges = true;
                                });
                            }
                        }
                    };
                }
            };
        }
    ]).directive('tubularDateEditor', ['tubularEditorService', function (tubularEditorService) {

        return {
            template: '<div ng-class="{ \'form-group\' : isEditing }">' +
                '<span ng-hide="isEditing">{{ value | date: format }}</span>' +
                '<label ng-show="showLabel">{{ label }}</label>' +
                '<input type="date" ng-show="isEditing" ng-model="value" class="form-control" />' +
                '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                '</div>',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: tubularEditorService.defaultScope,
            controller: [
                '$scope', function ($scope) {
                    $scope.DataType = "date";

                    $scope.validate = function () {
                        $scope.validate = function() {
                            if (angular.isUndefined($scope.min) == false) {
                                $scope.$valid = $scope.value >= $scope.min;
                                if ($scope.$valid == false)
                                    $scope.state.$errors = ["The minimum is " + $scope.min];
                            }

                            if ($scope.$valid == false) return;

                            if (angular.isUndefined($scope.max) == false) {
                                $scope.$valid = $scope.value <= $scope.max;
                                if ($scope.$valid == false)
                                    $scope.state.$errors = ["The maximum is " + $scope.max];
                            }
                        };

                        if ($scope.value == null) { // TODO: This is not working :P
                            $scope.$valid = false;
                            $scope.state.$errors = ["Invalid date"];
                            return;
                        }
                    };

                    tubularEditorService.setupScope($scope, 'yyyy-MM-dd');
                }
            ],
            compile: function compile(cElement, cAttrs) {
                return {
                    pre: function (scope, lElement, lAttrs, lController, lTransclude) { },
                    post: function (scope, lElement, lAttrs, lController, lTransclude) {
                        var inp = $(lElement).find("input[type=date]")[0];
                        if (inp.type != 'date') {
                            $(inp).datepicker({
                                dateFormat: scope.format.toLowerCase()
                            }).on("dateChange", function (e) {
                                scope.value = e.date;
                                scope.$parent.Model.$hasChanges = true;
                            });
                        }
                    }
                };
            }
        };
    }
    ]).directive('tubularDropdownEditor', ['tubularEditorService', 'tubularGridService', function (tubularEditorService, tubularGridService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{ value }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<select ng-options="d for d in options" ng-show="isEditing" ng-model="value" class="form-control" ' +
                    'ng-required="required" />' +
                    '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: angular.extend({ options: '=?', optionsUrl: '@' }, tubularEditorService.defaultScope),
                controller: [
                    '$scope', function($scope) {
                        tubularEditorService.setupScope($scope);
                        $scope.$editorType = 'select';
                        $scope.dataIsLoaded = false;

                        $scope.loadData = function() {
                            if ($scope.dataIsLoaded) return;

                            var currentRequest = tubularGridService.getDataAsync({
                                serverUrl: $scope.optionsUrl,
                                requestMethod: 'GET',
                                timeout: 1000
                            });

                            var value = $scope.value;
                            $scope.value = '';

                            currentRequest.promise.then(
                                function(data) {
                                    $scope.options = data;
                                    $scope.dataIsLoaded = true;
                                    $scope.value = value;
                                }, function(error) {
                                    $scope.$emit('tubularGrid_OnConnectionError', error);
                                });
                        };
                        
                        if (angular.isUndefined($scope.optionsUrl) == false) {
                            if ($scope.isEditing) {
                                $scope.loadData();
                            } else {
                                $scope.$watch('isEditing', function() {
                                    if ($scope.isEditing) $scope.loadData();
                                });
                            }
                        }
                    }
                ]
            };
        }
    ]).directive('tubularAutocompleteEditor', ['tubularEditorService', 'tubularGridService', function (tubularEditorService, tubularGridService) {

        return {
            template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                '<span ng-hide="isEditing">{{ value }}</span>' +
                '<label ng-show="showLabel">{{ label }}</label>' +
                '<autocomplete ng-show="isEditing" ng-model="value" attr-input-class="form-control" data="options" ' +
                'autocomplete-required="required" />' +
                '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                '</div>',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: angular.extend({ options: '=?', optionsUrl: '@' }, tubularEditorService.defaultScope),
            controller: [
                '$scope', function ($scope) {
                    tubularEditorService.setupScope($scope);
                    $scope.$editorType = 'select';
                    $scope.dataIsLoaded = false;

                    $scope.loadData = function () {
                        if ($scope.dataIsLoaded) return;

                        var currentRequest = tubularGridService.getDataAsync({
                            serverUrl: $scope.optionsUrl,
                            requestMethod: 'GET',
                            timeout: 1000
                        });

                        var value = $scope.value;
                        $scope.value = '';

                        currentRequest.promise.then(
                            function (data) {
                                $scope.options = data;
                                $scope.dataIsLoaded = true;
                                $scope.value = value;
                            }, function (error) {
                                $scope.$emit('tubularGrid_OnConnectionError', error);
                            });
                    };

                    if (angular.isUndefined($scope.optionsUrl) == false) {
                        if ($scope.isEditing) {
                            $scope.loadData();
                        } else {
                            $scope.$watch('isEditing', function () {
                                if ($scope.isEditing) $scope.loadData();
                            });
                        }
                    }
                }
            ]
        };
    }
    ]).directive('tubularHiddenField', ['tubularEditorService',
            function (tubularEditorService) {

                return {
                    template: '<input type="hidden" ng-show="isEditing" ng-model="value" class="form-control"  />',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function ($scope) {
                            tubularEditorService.setupScope($scope);
                        }
                    ]
                };
            }
    ]).directive('tubularCheckboxField', ['tubularEditorService',
            function (tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value}}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<input type="checkbox" ng-show="isEditing" ng-model="value" ng-required="required" />' +
                        '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function ($scope) {
                            tubularEditorService.setupScope($scope);
                        }
                    ]
                };
            }
    ]).directive('tubularTextArea', ['tubularEditorService',
            function (tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value}}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<textarea ng-show="isEditing" ng-model="value" class="form-control" ' +
                            ' ng-required="required"></textarea>' +
                        '<span class="help-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function ($scope) {
                            $scope.validate = function () {
                                if (angular.isUndefined($scope.min) == false && angular.isUndefined($scope.value) == false) {
                                    if ($scope.value.length < parseInt($scope.min)) {
                                        $scope.$valid = false;
                                        $scope.state.$errors = ["The fields needs to be minimum " + $scope.min + " chars"];
                                        return;
                                    }
                                }

                                if (angular.isUndefined($scope.max) == false && angular.isUndefined($scope.value) == false) {
                                    if ($scope.value.length > parseInt($scope.max)) {
                                        $scope.$valid = false;
                                        $scope.state.$errors = ["The fields needs to be maximum " + $scope.min + " chars"];
                                        return;
                                    }
                                }
                            };

                            tubularEditorService.setupScope($scope);
                        }
                    ]
                };
            }
    ]);
})();