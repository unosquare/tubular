(function() {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbSimpleEditor
         * @restrict E
         *
         * @description
         * The `tbSimpleEditor` directive is the basic input to show in a grid or form.
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {string} editorType Set what HTML input type should display.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} placeholder Set the placeholder text.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {number} min Set the minimum characters.
         * @param {number} max Set the maximum characters.
         */
        .directive('tbSimpleEditor', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value}}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<input type="{{editorType}}" placeholder="{{placeholder}}" ng-show="isEditing" ng-model="value" class="form-control" ' +
                        ' ng-required="required" ng-readonly="readOnly" />' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function($scope) {
                            $scope.validate = function() {
                                if (angular.isDefined($scope.min) && angular.isDefined($scope.value) && $scope.value != null) {
                                    if ($scope.value.length < parseInt($scope.min)) {
                                        $scope.$valid = false;
                                        $scope.state.$errors = ["The fields needs to be minimum " + $scope.min + " chars"];
                                        return;
                                    }
                                }

                                if (angular.isDefined($scope.max) && angular.isDefined($scope.value) && $scope.value != null) {
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
        ])
        /**
         * @ngdoc directive
         * @name tbNumericEditor
         * @restrict E
         *
         * @description
         * The `tbNumericEditor` directive is numeric input, similar to `tbSimpleEditor` 
         * but can render an addon to the input visual element.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} placeholder Set the placeholder text.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {string} format Indicate the format to use, C for currency otherwise number.
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {number} min Set the minimum value.
         * @param {number} max Set the maximum value.
         * @param {number} step Set the step setting, default 'any'.
         */
        .directive('tbNumericEditor', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value | numberorcurrency: format }}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<div class="input-group" ng-show="isEditing">' +
                        '<div class="input-group-addon" ng-show="format == \'C\'">$</div>' +
                        '<input type="number" placeholder="{{placeholder}}" ng-model="value" class="form-control" ' +
                        'ng-required="required" ng-readonly="readOnly" step="{{step || \'any\'}}" />' +
                        '</div>' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">{{error}}</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: angular.extend({ step: '=?' }, tubularEditorService.defaultScope),
                    controller: [
                        '$scope', function($scope) {
                            $scope.validate = function() {
                                if (angular.isDefined($scope.min) && angular.isDefined($scope.value) && $scope.value != null) {
                                    $scope.$valid = $scope.value >= $scope.min;
                                    if (!$scope.$valid) {
                                        $scope.state.$errors = ["The minimum is " + $scope.min];
                                    }
                                }

                                if (!$scope.$valid) {
                                    return;
                                }

                                if (angular.isDefined($scope.max) && angular.isDefined($scope.value) && $scope.value != null) {
                                    $scope.$valid = $scope.value <= $scope.max;
                                    if (!$scope.$valid) {
                                        $scope.state.$errors = ["The maximum is " + $scope.max];
                                    }
                                }
                            };

                            tubularEditorService.setupScope($scope, 0);
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbDateTimeEditor
         * @restrict E
         *
         * @description
         * The `tbDateTimeEditor` directive is date/time input. It uses the `datetime-local` HTML5 attribute, but if this
         * components fails it falls back to a jQuery datepicker.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {string} format Indicate the format to use, default "yyyy-MM-dd HH:mm".
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {number} min Set the minimum value.
         * @param {number} max Set the maximum value.
         */
        .directive('tbDateTimeEditor', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing }">' +
                        '<span ng-hide="isEditing">{{ value | date: format }}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<input type="datetime-local" ng-show="isEditing" ng-model="value" class="form-control" ' +
                        'ng-required="required" ng-readonly="readOnly" />' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                        '{{error}}' +
                        '</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: tubularEditorService.dateEditorController('yyyy-MM-dd HH:mm'),
                    compile: function compile() {
                        return {
                            post: function(scope, lElement) {
                                var inp = $(lElement).find("input[type=datetime-local]")[0];
                                if (inp.type !== 'datetime-local') {
                                    $(inp).datepicker({
                                            dateFormat: scope.format.toLowerCase().split(' ')[0]
                                        })
                                        .datepicker("setDate", scope.value)
                                        .on("dateChange", function(e) {
                                            scope.$apply(function() {
                                                scope.value = e.date;

                                                if (angular.isDefined(scope.$parent.Model)) {
                                                    scope.$parent.Model.$hasChanges = true;
                                                }
                                            });
                                        });
                                }
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbDateEditor
         * @restrict E
         *
         * @description
         * The `tbDateEditor` directive is date input. It uses the `datetime-local` HTML5 attribute, but if this
         * components fails it falls back to a jQuery datepicker.
         * 
         * Similar to `tbDateTimeEditor` but without a timepicker.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {string} format Indicate the format to use, default "yyyy-MM-dd".
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {number} min Set the minimum value.
         * @param {number} max Set the maximum value.
         */
        .directive('tbDateEditor', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing }">' +
                        '<span ng-hide="isEditing">{{ value | date: format }}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<input type="date" ng-show="isEditing" ng-model="value" class="form-control" ' +
                        'ng-required="required" ng-readonly="readOnly" />' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                        '{{error}}' +
                        '</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: tubularEditorService.dateEditorController('yyyy-MM-dd'),
                    compile: function compile() {
                        return {
                            post: function(scope, lElement) {
                                var inp = $(lElement).find("input[type=date]")[0];
                                if (inp.type !== 'date') {
                                    $(inp).datepicker({
                                            dateFormat: scope.format.toLowerCase()
                                        })
                                        .datepicker("setDate", scope.value)
                                        .on("dateChange", function(e) {
                                            scope.$apply(function() {
                                                scope.value = e.date;

                                                if (angular.isDefined(scope.$parent.Model)) {
                                                    scope.$parent.Model.$hasChanges = true;
                                                }
                                            });
                                        });
                                }
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbDropdownEditor
         * @restrict E
         *
         * @description
         * The `tbDropdownEditor` directive is drowpdown editor, it can get information from a HTTP 
         * source or it can be an object declared in the attributes.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {object} options Set the options to display.
         * @param {string} optionsUrl Set the Http Url where to retrieve the values.
         * @param {string} optionsMethod Set the Http Method where to retrieve the values.
         * @param {string} optionLabel Set the property to get the labels.
         * @param {string} optionKey Set the property to get the keys.
         * @param {string} defaultValue Set the default value.
         */
        .directive('tbDropdownEditor', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{ value }}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<select ng-options="{{ selectOptions }}" ng-show="isEditing" ng-model="value" class="form-control" ' +
                        'ng-required="required" ng-disabled="readOnly" />' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                        '{{error}}' +
                        '</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: angular.extend({ options: '=?', optionsUrl: '@', optionsMethod: '@?', optionLabel: '@?', optionKey: '@?', defaultValue: '@?' }, tubularEditorService.defaultScope),
                    controller: [
                        '$scope', function($scope) {
                            tubularEditorService.setupScope($scope);
                            $scope.dataIsLoaded = false;
                            $scope.selectOptions = "d for d in options";

                            if (angular.isDefined($scope.optionLabel)) {
                                $scope.selectOptions = "d." + $scope.optionLabel + " for d in options";

                                if (angular.isDefined($scope.optionKey)) {
                                    $scope.selectOptions = 'd.' + $scope.optionKey + ' as ' + $scope.selectOptions;
                                }
                            }

                            $scope.$watch('value', function(val) {
                                $scope.$emit('tbForm_OnFieldChange', $scope.$component, $scope.name, val);
                            });

                            $scope.loadData = function() {
                                if ($scope.dataIsLoaded) {
                                    return;
                                }

                                if (angular.isUndefined($scope.$component) || $scope.$component == null) {
                                    throw 'You need to define a parent Form or Grid';
                                }

                                var currentRequest = $scope.$component.dataService.retrieveDataAsync({
                                    serverUrl: $scope.optionsUrl,
                                    requestMethod: $scope.optionsMethod || 'GET'
                                });

                                var value = $scope.value;
                                $scope.value = '';

                                currentRequest.promise.then(
                                    function(data) {
                                        $scope.options = data;
                                        $scope.dataIsLoaded = true;
                                        // TODO: Add an attribute to define if autoselect is OK
                                        var possibleValue = $scope.options && $scope.options.length > 0 ?
                                            angular.isDefined($scope.optionKey) ? $scope.options[0][$scope.optionKey] : $scope.options[0]
                                            : '';
                                        $scope.value = value || $scope.defaultValue || possibleValue;
                                    }, function(error) {
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    });
                            };

                            if (angular.isDefined($scope.optionsUrl)) {
                                $scope.$watch('optionsUrl', function() {
                                    $scope.dataIsLoaded = false;
                                    $scope.loadData();
                                });

                                if ($scope.isEditing) {
                                    $scope.loadData();
                                } else {
                                    $scope.$watch('isEditing', function() {
                                        if ($scope.isEditing) {
                                            $scope.loadData();
                                        }
                                    });
                                }
                            }
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbTypeaheadEditor
         * @restrict E
         *
         * @description
         * The `tbTypeaheadEditor` directive is autocomplete editor, it can get information from a HTTP source or it can get them
         * from a object declared in the attributes.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {object} options Set the options to display.
         * @param {string} optionsUrl Set the Http Url where to retrieve the values.
         * @param {string} optionsMethod Set the Http Method where to retrieve the values.
         * @param {string} optionLabel Set the property to get the labels.
         * @param {string} css Set the CSS classes for the input.
         */
        .directive('tbTypeaheadEditor', [
            'tubularEditorService', '$q', function(tubularEditorService, $q) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{ value }}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<div class="input-group" ng-show="isEditing">' +
                        '<input ng-model="value" placeholder="{{placeholder}}" title="{{tooltip}}" ' +
                        'class="form-control {{css}}" ng-readonly="lastSet.indexOf(value) !== -1" typeahead="{{ selectOptions }}" ' +
                        'ng-required="required" /> ' +
                        '<div class="input-group-addon" ng-hide="lastSet.indexOf(value) !== -1"><i class="fa fa-pencil"></i></div>' +
                        '<span class="input-group-btn" ng-show="lastSet.indexOf(value) !== -1" tabindex="-1">' +
                        '<button class="btn btn-default" type="button" ng-click="value = null"><i class="fa fa-times"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                        '{{error}}' +
                        '</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: angular.extend({
                        options: '=?',
                        optionsUrl: '@',
                        optionsMethod: '@?',
                        optionLabel: '@?',
                        css: '@?'
                    }, tubularEditorService.defaultScope),
                    controller: [
                        '$scope', function($scope) {
                            tubularEditorService.setupScope($scope);
                            $scope.selectOptions = "d for d in getValues($viewValue)";
                            $scope.lastSet = [];

                            if (angular.isDefined($scope.optionLabel)) {
                                $scope.selectOptions = "d as d." + $scope.optionLabel + " for d in getValues($viewValue)";
                            }

                            $scope.$watch('value', function(val) {
                                $scope.$emit('tbForm_OnFieldChange', $scope.$component, $scope.name, val);
                                $scope.tooltip = val;
                                if (angular.isDefined(val) && val != null && angular.isDefined($scope.optionLabel)) {
                                    $scope.tooltip = val[$scope.optionLabel];
                                }
                            });

                            $scope.getValues = function(val) {
                                if (angular.isDefined($scope.optionsUrl)) {
                                    if (angular.isUndefined($scope.$component) || $scope.$component == null) {
                                        throw 'You need to define a parent Form or Grid';
                                    }

                                    var p = $scope.$component.dataService.retrieveDataAsync({
                                        serverUrl: $scope.optionsUrl + '?search=' + val,
                                        requestMethod: $scope.optionsMethod || 'GET'
                                    }).promise;

                                    p.then(function(data) {
                                        $scope.lastSet = data;
                                        return data;
                                    });

                                    return p;
                                }

                                return $q(function(resolve) {
                                    $scope.lastSet = $scope.options;
                                    resolve($scope.options);
                                });
                            };
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbHiddenField
         * @restrict E
         *
         * @description
         * The `tbHiddenField` directive represents a hidden field.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         */
        .directive('tbHiddenField', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<input type="hidden" ng-model="value" class="form-control"  />',
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
        ])
        /**
         * @ngdoc directive
         * @name tbCheckboxField
         * @restrict E
         *
         * @description
         * The `tbCheckboxField` directive represents a checkbox field.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {object} checkedValue Set the checked value.
         * @param {object} uncheckedValue Set the unchecked value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} help Set the help text.
         */
        .directive('tbCheckboxField', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'checkbox\' : isEditing, \'has-error\' : !$valid }" class="tubular-checkbox">' +
                        '<span ng-hide="isEditing">{{value ? checkedValue : uncheckedValue}}</span>' +
                        '<input ng-show="isEditing" type="checkbox" ng-model="value" ng-disabled="readOnly"' +
                        'class="tubular-checkbox" id="{{name}}" /> ' +
                        '<label ng-show="isEditing" for="{{name}}">' +
                        '{{label}}' +
                        '</label>' +
                        '<span class="help-block error-block" ng-show="isEditing" ' +
                        'ng-repeat="error in state.$errors">' +
                        '{{error}}' +
                        '</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: angular.extend({
                        checkedValue: '=?',
                        uncheckedValue: '=?'
                    }, tubularEditorService.defaultScope),
                    controller: [
                        '$scope', '$element', function($scope) {
                            $scope.checkedValue = angular.isDefined($scope.checkedValue) ? $scope.checkedValue : true;
                            $scope.uncheckedValue = angular.isDefined($scope.uncheckedValue) ? $scope.uncheckedValue : false;

                            tubularEditorService.setupScope($scope);
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbTextArea
         * @restrict E
         *
         * @description
         * The `tbTextArea` directive represents a textarea field. 
         * Similar to `tbSimpleEditor` but with a `textarea` HTML element instead of `input`.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @scope
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} placeholder Set the placeholder text.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {number} min Set the minimum characters.
         * @param {number} max Set the maximum characters.
         */
        .directive('tbTextArea', [
            'tubularEditorService', function(tubularEditorService) {

                return {
                    template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                        '<span ng-hide="isEditing">{{value}}</span>' +
                        '<label ng-show="showLabel">{{ label }}</label>' +
                        '<textarea ng-show="isEditing" placeholder="{{placeholder}}" ng-model="value" class="form-control" ' +
                        ' ng-required="required" ng-readonly="readOnly"></textarea>' +
                        '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                        '{{error}}' +
                        '</span>' +
                        '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: tubularEditorService.defaultScope,
                    controller: [
                        '$scope', function($scope) {
                            $scope.validate = function() {
                                if (angular.isDefined($scope.min) && angular.isDefined($scope.value) && $scope.value != null) {
                                    if ($scope.value.length < parseInt($scope.min)) {
                                        $scope.$valid = false;
                                        $scope.state.$errors = ["The fields needs to be minimum " + $scope.min + " chars"];
                                        return;
                                    }
                                }

                                if (angular.isDefined($scope.max) && angular.isDefined($scope.value) && $scope.value != null) {
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