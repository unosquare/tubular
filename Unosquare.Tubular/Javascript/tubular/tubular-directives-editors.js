(function() {
    'use strict';

    angular.module('tubular.directives').directive('tbSimpleEditor', [
        'tubularEditorService',
        function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{value}}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<input type="{{editorType}}" placeholder="{{placeholder}}" ng-show="isEditing" ng-model="value" class="form-control" ' +
                    ' ng-required="required" ng-readonly="readOnly" />' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
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
    ]).directive('tbNumericEditor', [
        'tubularEditorService', function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{value | numberorcurrency: format }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<div class="input-group" ng-show="isEditing">' +
                    '<div class="input-group-addon" ng-show="format == \'C\'">$</div>' +
                    '<input type="number" placeholder="{{placeholder}}" ng-model="value" class="form-control" ' +
                    'ng-required="required" ng-readonly="readOnly" />' +
                    '</div>' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
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
    ]).directive('tbDateTimeEditor', [
        'tubularEditorService', function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing }">' +
                    '<span ng-hide="isEditing">{{ value | date: format }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<input type="datetime-local" ng-show="isEditing" ng-model="value" class="form-control" ' +
                    'ng-required="required" ng-readonly="readOnly" />' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
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
    ]).directive('tbDateEditor', [
        'tubularEditorService', function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing }">' +
                    '<span ng-hide="isEditing">{{ value | date: format }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<input type="date" ng-show="isEditing" ng-model="value" class="form-control" ' +
                    'ng-required="required" ng-readonly="readOnly" />' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
                        $scope.DataType = "date";

                        $scope.validate = function() {
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
                        pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                        post: function(scope, lElement, lAttrs, lController, lTransclude) {
                            var inp = $(lElement).find("input[type=date]")[0];
                            if (inp.type != 'date') {
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
    ]).directive('tbDropdownEditor', [
        'tubularEditorService', 'tubularHttp', function(tubularEditorService, tubularHttp) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{ value }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<select ng-options="d for d in options" ng-show="isEditing" ng-model="value" class="form-control" ' +
                    'ng-required="required" />' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
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

                            var currentRequest = tubularHttp.retrieveDataAsync({
                                serverUrl: $scope.optionsUrl,
                                requestMethod: 'GET' // TODO: RequestMethod
                            });

                            var value = $scope.value;
                            $scope.value = '';

                            currentRequest.promise.then(
                                function(data) {
                                    $scope.options = data;
                                    $scope.dataIsLoaded = true;
                                    $scope.value = value;
                                }, function(error) {
                                    $scope.$emit('tbGrid_OnConnectionError', error);
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
    ]).directive('tbTypeaheadEditor', [
        'tubularEditorService', 'tubularHttp', '$q', function (tubularEditorService, tubularHttp, $q) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{ value }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<input ng-show="isEditing" ng-model="value" class="form-control" typeahead="o for o in getValues($viewValue)" ' +
                    'ng-required="required" />' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: angular.extend({ options: '=?', optionsUrl: '@' }, tubularEditorService.defaultScope),
                controller: [
                    '$scope', function($scope) {
                        tubularEditorService.setupScope($scope);
                        $scope.$editorType = 'select';

                        $scope.getValues = function(val) {
                            if (angular.isDefined($scope.optionsUrl)) {
                                return tubularHttp.retrieveDataAsync({
                                    serverUrl: $scope.optionsUrl + '?search=' + val,
                                    requestMethod: 'GET' // TODO: RequestMethod
                                }).promise;
                            }

                            return $q(function(resolve) {
                                resolve($scope.options);
                            });
                        };
                    }
                ]
            };
        }
    ]).directive('tbHiddenField', [
        'tubularEditorService',
        function(tubularEditorService) {

            return {
                template: '<input type="hidden" ng-show="isEditing" ng-model="value" class="form-control"  />',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
                        tubularEditorService.setupScope($scope);
                    }
                ]
            };
        }
    ]).directive('tbCheckboxField', [
        'tubularEditorService',
        function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{value}}</span>' +
                    '<label>' +
                    '<input type="checkbox" ng-show="isEditing" ng-model="value" ng-required="required" /> ' +
                    '<span ng-show="showLabel">{{label}}</span>' +
                    '</label>' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
                        tubularEditorService.setupScope($scope);
                    }
                ]
            };
        }
    ]).directive('tbTextArea', [
        'tubularEditorService',
        function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{value}}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<textarea ng-show="isEditing" placeholder="{{placeholder}}" ng-model="value" class="form-control" ' +
                    ' ng-required="required" ng-readonly="readOnly"></textarea>' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: tubularEditorService.defaultScope,
                controller: [
                    '$scope', function($scope) {
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
    ]);
})();