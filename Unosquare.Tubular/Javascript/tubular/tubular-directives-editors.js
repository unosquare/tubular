(function (angular) {
    'use strict';

    if (typeof moment == 'function') {
        moment.fn.toJSON = function() { return this.format(); }
    }

    var canUseHtml5Date = function() {
        var input = document.createElement('input');
        input.setAttribute('type', 'date');

        var notADateValue = 'not-a-date';
        input.setAttribute('value', notADateValue);

        return (input.value !== notADateValue);
    }();

    angular.module('tubular.directives')
        /**
         * @ngdoc component
         * @name tbSimpleEditor
         * @module tubular.directives
         * 
         * @description
         * The `tbSimpleEditor` component is the basic input to show in a grid or form.
         * It uses the `TubularModel` to retrieve column or field information.
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
         * @param {string} regex Set the regex validation text.
         * @param {string} regexErrorMessage Set the regex validation error message.
         * @param {string} match Set the field name to match values.
         */
        .component('tbSimpleEditor', {
            template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">' +
                '<span ng-hide="$ctrl.isEditing">{{$ctrl.value}}</span>' +
                '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
                '<input type="{{$ctrl.editorType}}" placeholder="{{$ctrl.placeholder}}" ng-show="$ctrl.isEditing" ng-model="$ctrl.value" class="form-control" ' +
                ' ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}" />' +
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{$ctrl.help}}</span>' +
                '</div>',
            bindings: {
                regex: '@?',
                regexErrorMessage: '@?',
                value: '=?',
                isEditing: '=?',
                editorType: '@',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                min: '=?',
                max: '=?',
                name: '@',
                placeholder: '@?',
                readOnly: '=?',
                help: '@?',
                match: '@?'
            },
            controller: [
                'tubularEditorService', '$scope', '$filter', function (tubularEditorService, $scope, $filter) {
                    var $ctrl = this;
                    
                    $ctrl.validate = function () {
                        if (angular.isDefined($ctrl.regex) && $ctrl.regex != null && angular.isDefined($ctrl.value) && $ctrl.value != null && $ctrl.value != '') {
                            var patt = new RegExp($ctrl.regex);

                            if (patt.test($ctrl.value) === false) {
                                $ctrl.$valid = false;
                                $ctrl.state.$errors = [$ctrl.regexErrorMessage || $filter('translate')('EDITOR_REGEX_DOESNT_MATCH')];
                                return;
                            }
                        }

                        if (angular.isDefined($ctrl.match) && $ctrl.match) {
                            if ($ctrl.value != $scope.$component.model[$ctrl.match]) {
                                var label = $filter('filter')($scope.$component.fields, { name: $ctrl.match }, true)[0].label;
                                $ctrl.$valid = false;
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MATCH', label)];
                                return;
                            }
                        }

                        if (angular.isDefined($ctrl.min) && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                            if ($ctrl.value.length < parseInt($ctrl.min)) {
                                $ctrl.$valid = false;
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MIN_CHARS', $ctrl.min)];
                                return;
                            }
                        }

                        if (angular.isDefined($ctrl.max) && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                            if ($ctrl.value.length > parseInt($ctrl.max)) {
                                $ctrl.$valid = false;
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MAX_CHARS', $ctrl.max)];
                                return;
                            }
                        }
                    };

                    $ctrl.$onInit = function() {
                        tubularEditorService.setupScope($scope, null, $ctrl, false);
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbNumericEditor
         * @module tubular.directives
         *
         * @description
         * The `tbNumericEditor` component is numeric input, similar to `tbSimpleEditor` 
         * but can render an add-on to the input visual element.
         * 
         * When you need a numeric editor but without the visual elements you can use 
         * `tbSimpleEditor` with the `editorType` attribute with value `number`.
         * 
         * This component uses the `TubularModel` to retrieve the model information.
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
        .component('tbNumericEditor', {
            template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">' +
                '<span ng-hide="$ctrl.isEditing">{{$ctrl.value | numberorcurrency: format }}</span>' +
                '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
                '<div class="input-group" ng-show="$ctrl.isEditing">' +
                '<div class="input-group-addon" ng-hide="$ctrl.format == \'I\'">' +
                '<i ng-class="{ \'fa\': true, \'fa-calculator\': $ctrl.format != \'C\', \'fa-usd\': $ctrl.format == \'C\'}"></i>' +
                '</div>' +
                '<input type="number" placeholder="{{$ctrl.placeholder}}" ng-model="$ctrl.value" class="form-control" ' +
                'ng-required="$ctrl.required" ng-hide="$ctrl.readOnly" step="{{$ctrl.step || \'any\'}}"  name="{{$ctrl.name}}" />' +
                '<p class="form-control form-control-static text-right" ng-show="$ctrl.readOnly">{{$ctrl.value | numberorcurrency: format}}</span></p>' +
                '</div>' +
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{$ctrl.help}}</span>' +
                '</div>',
            bindings: {
                value: '=?',
                isEditing: '=?',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                format: '@?',
                min: '=?',
                max: '=?',
                name: '@',
                placeholder: '@?',
                readOnly: '=?',
                help: '@?',
                step: '=?'
            },
            controller: [
                'tubularEditorService', '$scope', '$filter', function (tubularEditorService, $scope, $filter) {
                    var $ctrl = this;
                    $ctrl.validate = function () {
                        if (angular.isDefined($ctrl.min) && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                            $ctrl.$valid = $ctrl.value >= $ctrl.min;
                            if (!$ctrl.$valid) {
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MIN_NUMBER', $ctrl.min)];
                            }
                        }

                        if (!$ctrl.$valid) {
                            return;
                        }

                        if (angular.isDefined($ctrl.max) && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                            $ctrl.$valid = $ctrl.value <= $ctrl.max;
                            if (!$ctrl.$valid) {
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MAX_NUMBER', $ctrl.max)];
                            }
                        }
                    };

                    $ctrl.$onInit = function() {
                        $ctrl.DataType = "numeric";

                        tubularEditorService.setupScope($scope, 0, $ctrl, false);
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbDateTimeEditor
         * @module tubular.directives
         *
         * @description
         * The `tbDateTimeEditor` component is date/time input. It uses the `datetime-local` HTML5 attribute, but if this
         * components fails it falls back to Angular UI Bootstrap Datepicker (time functionality is unavailable).
         * 
         * It uses the `TubularModel` to retrieve column or field information.
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
        .component('tbDateTimeEditor', {
            template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">' +
                '<span ng-hide="$ctrl.isEditing">{{ $ctrl.value | date: format }}</span>' +
                '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
                (canUseHtml5Date ?
                    '<input type="datetime-local" ng-show="$ctrl.isEditing" ng-model="$ctrl.value" class="form-control" ' +
                    'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}"/>' :
                    '<div class="input-group" ng-show="$ctrl.isEditing">' +
                    '<input type="text" uib-datepicker-popup="{{$ctrl.format}}" ng-model="$ctrl.value" class="form-control" ' +
                    'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}" is-open="$ctrl.open" />' +
                    '<span class="input-group-btn">' +
                    '<button type="button" class="btn btn-default" ng-click="$ctrl.open = !$ctrl.open"><i class="fa fa-calendar"></i></button>' +
                    '</span>' +
                    '</div>' +                
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">' +
                    '</div>') +
                '{{error}}' +
                '</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{$ctrl.help}}</span>' +
                '</div>',
            bindings: {
                value: '=?',
                isEditing: '=?',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                format: '@?',
                min: '=?',
                max: '=?',
                name: '@',
                readOnly: '=?',
                help: '@?'
            },
            controller: [
                '$scope', '$element', 'tubularEditorService', '$filter', function ($scope, $element, tubularEditorService, $filter) {
                    var $ctrl = this;

                    // This could be $onChange??
                    $scope.$watch(function () {
                        return $ctrl.value;
                    }, function (val) {
                        if (typeof (val) === 'string') {
                            $ctrl.value = new Date(val);
                        }
                    });

                    $ctrl.validate = function () {
                        if (angular.isDefined($ctrl.min)) {
                            if (Object.prototype.toString.call($ctrl.min) !== "[object Date]") {
                                $ctrl.min = new Date($ctrl.min);
                            }

                            $ctrl.$valid = $ctrl.value >= $ctrl.min;

                            if (!$ctrl.$valid) {
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MIN_DATE', $filter('date')($ctrl.min, $ctrl.format))];
                            }
                        }

                        if (!$ctrl.$valid) {
                            return;
                        }

                        if (angular.isDefined($ctrl.max)) {
                            if (Object.prototype.toString.call($ctrl.max) !== "[object Date]") {
                                $ctrl.max = new Date($ctrl.max);
                            }

                            $ctrl.$valid = $ctrl.value <= $ctrl.max;

                            if (!$ctrl.$valid) {
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MAX_DATE', $filter('date')($ctrl.max, $ctrl.format))];
                            }
                        }
                    };

                    $ctrl.$onInit = function () {
                        $ctrl.DataType = "date";
                        tubularEditorService.setupScope($scope, $ctrl.format, $ctrl);
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbDateEditor
         * @module tubular.directives
         *
         * @description
         * The `tbDateEditor` component is date input. It uses the `datetime-local` HTML5 attribute, but if this
         * components fails it falls back to a Angular UI Bootstrap Datepicker.
         * 
         * Similar to `tbDateTimeEditor` but without a timepicker.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
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
        .component('tbDateEditor', {
            template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">' +
                '<span ng-hide="$ctrl.isEditing">{{ $ctrl.value | moment: $ctrl.format }}</span>' +
                '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
                (canUseHtml5Date ?
                    '<input type="date" ng-show="$ctrl.isEditing" ng-model="$ctrl.dateValue" class="form-control" ' +
                    'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}"/>' : 
                    '<div class="input-group" ng-show="$ctrl.isEditing">' +
                    '<input type="text" uib-datepicker-popup="{{$ctrl.format}}" ng-model="$ctrl.dateValue" class="form-control" ' +
                    'ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}" is-open="$ctrl.open" />' +
                    '<span class="input-group-btn">' +
                    '<button type="button" class="btn btn-default" ng-click="$ctrl.open = !$ctrl.open"><i class="fa fa-calendar"></i></button>' +
                    '</span>' +
                    '</div>') +
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">' +
                '{{error}}' +
                '</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{$ctrl.help}}</span>' +
                '</div>',
            bindings: {
                value: '=?',
                isEditing: '=?',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                format: '@?',
                min: '=?',
                max: '=?',
                name: '@',
                readOnly: '=?',
                help: '@?'
            },
            controller: [
               '$scope', '$element', 'tubularEditorService', '$filter', function ($scope, $element, tubularEditorService, $filter) {
                   var $ctrl = this;

                   $scope.$watch(function() {
                       return $ctrl.value;
                   }, function (val) {
                       if (angular.isUndefined(val)) return;

                       if (typeof (val) === 'string') {
                           $ctrl.value = typeof moment == 'function' ? moment(val) : new Date(val);
                       }

                       if (angular.isUndefined($ctrl.dateValue)) {
                           if (typeof moment == 'function') {
                               var tmpDate = $ctrl.value.toObject();
                               $ctrl.dateValue = new Date(tmpDate.years, tmpDate.months, tmpDate.date, tmpDate.hours, tmpDate.minutes, tmpDate.seconds);
                           } else {
                               $ctrl.dateValue = $ctrl.value;
                           }

                           $scope.$watch(function() {
                               return $ctrl.dateValue;
                           }, function(val) {
                               if (angular.isDefined(val)) {
                                   $ctrl.value = typeof moment == 'function' ? moment(val) : new Date(val);
                               }
                           });
                       }
                   });

                   $ctrl.validate = function () {
                       if (angular.isDefined($ctrl.min)) {
                           if (Object.prototype.toString.call($ctrl.min) !== "[object Date]") {
                               $ctrl.min = new Date($ctrl.min);
                           }

                           $ctrl.$valid = $ctrl.dateValue >= $ctrl.min;

                           if (!$ctrl.$valid) {
                               $ctrl.state.$errors = [$filter('translate')('EDITOR_MIN_DATE', $filter('date')($ctrl.min, $ctrl.format))];
                           }
                       }

                       if (!$ctrl.$valid) {
                           return;
                       }

                       if (angular.isDefined($ctrl.max)) {
                           if (Object.prototype.toString.call($ctrl.max) !== "[object Date]") {
                               $ctrl.max = new Date($ctrl.max);
                           }

                           $ctrl.$valid = $ctrl.dateValue <= $ctrl.max;

                           if (!$ctrl.$valid) {
                               $ctrl.state.$errors = [$filter('translate')('EDITOR_MAX_DATE', $filter('date')($ctrl.max, $ctrl.format))];
                           }
                       }
                   };

                   $ctrl.$onInit = function() {
                        $ctrl.DataType = "date";
                        tubularEditorService.setupScope($scope, $ctrl.format, $ctrl);

                        if (typeof moment == 'function' && angular.isUndefined($ctrl.format)) {
                           $ctrl.format = "MMM D, Y";
                       }
                   };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbDropdownEditor
         * @module tubular.directives
         *
         * @description
         * The `tbDropdownEditor` component is drowpdown editor, it can get information from a HTTP 
         * source or it can be an object declared in the attributes.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
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
        .component('tbDropdownEditor', {
            template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">' +
                '<span ng-hide="$ctrl.isEditing">{{ $ctrl.value }}</span>' +
                '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
                '<select ng-options="{{ $ctrl.selectOptions }}" ng-show="$ctrl.isEditing" ng-model="$ctrl.value" class="form-control" ' +
                'ng-required="$ctrl.required" ng-disabled="$ctrl.readOnly" name="{{$ctrl.name}}" />' +
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">' +
                '{{error}}' +
                '</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{$ctrl.help}}</span>' +
                '</div>',
            bindings: {
                value: '=?',
                isEditing: '=?',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                name: '@',
                readOnly: '=?',
                help: '@?',
                defaultValue: '@?',
                options: '=?',
                optionsUrl: '@',
                optionsMethod: '@?',
                optionLabel: '@?',
                optionKey: '@?',
                optionTrack: '@?'
            },
            controller: [
                'tubularEditorService', '$scope', function(tubularEditorService, $scope) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        tubularEditorService.setupScope($scope, null, $ctrl);
                        $ctrl.dataIsLoaded = false;
                        $ctrl.selectOptions = "d for d in $ctrl.options";

                        if (angular.isDefined($ctrl.optionLabel)) {
                            $ctrl.selectOptions = "d." + $ctrl.optionLabel + " for d in options";

                            if (angular.isDefined($ctrl.optionTrack)) {
                                $ctrl.selectOptions = 'd as d.' + $ctrl.optionLabel + ' for d in options track by d.' + $ctrl.optionTrack;
                            }
                            else {
                                if (angular.isDefined($ctrl.optionKey)) {
                                    $ctrl.selectOptions = 'd.' + $ctrl.optionKey + ' as ' + $ctrl.selectOptions;
                                }
                            }
                        }

                        if (angular.isDefined($ctrl.optionsUrl)) {
                            $scope.$watch('optionsUrl', function(val, prev) {
                                if (val === prev) return;

                                $ctrl.dataIsLoaded = false;
                                $ctrl.loadData();
                            });

                            if ($ctrl.isEditing) {
                                $ctrl.loadData();
                            } else {
                                $scope.$watch('$ctrl.isEditing', function () {
                                    if ($ctrl.isEditing) {
                                        $ctrl.loadData();
                                    }
                                });
                            }
                        }
                    };

                    $scope.$watch(function() {
                        return $ctrl.value;
                    }, function(val) {
                        $scope.$emit('tbForm_OnFieldChange', $ctrl.$component, $ctrl.name, val, $scope.options);
                    });

                    $ctrl.loadData = function() {
                        if ($ctrl.dataIsLoaded) {
                            return;
                        }

                        if (angular.isUndefined($ctrl.$component) || $ctrl.$component == null) {
                            throw 'You need to define a parent Form or Grid';
                        }

                        var currentRequest = $ctrl.$component.dataService.retrieveDataAsync({
                            serverUrl: $ctrl.optionsUrl,
                            requestMethod: $ctrl.optionsMethod || 'GET'
                        });

                        var value = $ctrl.value;
                        $ctrl.value = '';

                        currentRequest.promise.then(
                            function(data) {
                                $ctrl.options = data;
                                $ctrl.dataIsLoaded = true;
                                // TODO: Add an attribute to define if autoselect is OK
                                var possibleValue = $ctrl.options && $ctrl.options.length > 0 ?
                                    angular.isDefined($ctrl.optionKey) ? $ctrl.options[0][$ctrl.optionKey] : $ctrl.options[0]
                                    : '';
                                $ctrl.value = value || $ctrl.defaultValue || possibleValue;

                                // Set the field dirty
                                var formScope = $ctrl.getFormField();
                                if (formScope) formScope.$setDirty();
                            }, function(error) {
                                $scope.$emit('tbGrid_OnConnectionError', error);
                            });
                    };
                }
            ]
        })
        /**
         * @ngdoc directive
         * @name tbTypeaheadEditor
         * @module tubular.directives
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
            'tubularEditorService', '$q', '$compile', function (tubularEditorService, $q, $compile) {

                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        value: '=?',
                        isEditing: '=?',
                        showLabel: '=?',
                        label: '@?',
                        required: '=?',
                        name: '@',
                        placeholder: '@?',
                        readOnly: '=?',
                        help: '@?',
                        options: '=?',
                        optionsUrl: '@',
                        optionsMethod: '@?',
                        optionLabel: '@?',
                        css: '@?'
                    },
                    link: function (scope, element) {
                        var template = '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid && $dirty() }">' +
                            '<span ng-hide="isEditing">{{ value }}</span>' +
                            '<label ng-show="showLabel">{{ label }}</label>' +
                            '<div class="input-group" ng-show="isEditing">' +
                            '<input ng-model="value" placeholder="{{placeholder}}" title="{{tooltip}}" autocomplete="off" ' +
                            'class="form-control {{css}}" ng-readonly="readOnly || lastSet.indexOf(value) !== -1" uib-typeahead="' + scope.selectOptions + '" ' +
                            'ng-required="required" name="{{name}}" /> ' +
                            '<div class="input-group-addon" ng-hide="lastSet.indexOf(value) !== -1"><i class="fa fa-pencil"></i></div>' +
                            '<span class="input-group-btn" ng-show="lastSet.indexOf(value) !== -1" tabindex="-1">' +
                            '<button class="btn btn-default" type="button" ng-click="value = null"><i class="fa fa-times"></i>' +
                            '</span>' +
                            '</div>' +
                            '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                            '{{error}}' +
                            '</span>' +
                            '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                            '</div>';

                        var linkFn = $compile(template);
                        var content = linkFn(scope);
                        element.append(content);
                    },
                    controller: [
                        '$scope', function ($scope) {
                            tubularEditorService.setupScope($scope);
                            $scope.selectOptions = "d for d in getValues($viewValue)";
                            $scope.lastSet = [];

                            if (angular.isDefined($scope.optionLabel)) {
                                $scope.selectOptions = "d as d." + $scope.optionLabel + " for d in getValues($viewValue)";
                            }

                            $scope.$watch('value', function (val) {
                                $scope.$emit('tbForm_OnFieldChange', $scope.$component, $scope.name, val, $scope.options);
                                $scope.tooltip = val;
                                if (angular.isDefined(val) && val != null && angular.isDefined($scope.optionLabel)) {
                                    $scope.tooltip = val[$scope.optionLabel];
                                }
                            });

                            $scope.getValues = function (val) {
                                if (angular.isDefined($scope.optionsUrl)) {
                                    if (angular.isUndefined($scope.$component) || $scope.$component == null) {
                                        throw 'You need to define a parent Form or Grid';
                                    }

                                    var p = $scope.$component.dataService.retrieveDataAsync({
                                        serverUrl: $scope.optionsUrl + '?search=' + val,
                                        requestMethod: $scope.optionsMethod || 'GET'
                                    }).promise;

                                    p.then(function (data) {
                                        $scope.lastSet = data;
                                        return data;
                                    });

                                    return p;
                                }

                                return $q(function (resolve) {
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
         * @ngdoc component
         * @name tbHiddenField
         * @module tubular.directives
         *
         * @description
         * The `tbHiddenField` component represents a hidden field.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         */
        .component('tbHiddenField', {
            template: '<input type="hidden" ng-model="$ctrl.value" class="form-control" name="{{$ctrl.name}}"  />',
            bindings: {
                value: '=?',
                name: '@'
            },
            controller: [
                'tubularEditorService', '$scope', function (tubularEditorService, $scope) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        tubularEditorService.setupScope($scope, null, $ctrl, true);
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbCheckboxField
         * @module tubular.directives
         *
         * @description
         * The `tbCheckboxField` component represents a checkbox field.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
         * 
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {object} checkedValue Set the checked value.
         * @param {object} uncheckedValue Set the unchecked value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} help Set the help text.
         */
        .component('tbCheckboxField', {
            template: '<div ng-class="{ \'checkbox\' : $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }" class="tubular-checkbox">' +
                '<input type="checkbox" ng-model="$ctrl.value" ng-disabled="$ctrl.readOnly || !$ctrl.isEditing"' +
                'class="tubular-checkbox" id="{{$ctrl.name}}" name="{{$ctrl.name}}" /> ' +
                '<label ng-show="$ctrl.isEditing" for="{{$ctrl.name}}">' +
                '{{$ctrl.label}}' +
                '</label>' +
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ' +
                'ng-repeat="error in $ctrl.state.$errors">' +
                '{{error}}' +
                '</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{help}}</span>' +
                '</div>',
            bindings: {
                value: '=?',
                isEditing: '=?',
                editorType: '@',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                name: '@',
                readOnly: '=?',
                help: '@?',
                checkedValue: '=?',
                uncheckedValue: '=?'
            },
            controller: [
                'tubularEditorService', '$scope', function (tubularEditorService, $scope) {
                    var $ctrl = this;

                    $ctrl.$onInit = function () {
                        $ctrl.required = false; // overwrite required to false always
                        $ctrl.checkedValue = angular.isDefined($ctrl.checkedValue) ? $ctrl.checkedValue : true;
                        $ctrl.uncheckedValue = angular.isDefined($ctrl.uncheckedValue) ? $ctrl.uncheckedValue : false;

                        tubularEditorService.setupScope($scope, null, $ctrl, true);
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbTextArea
         * @module tubular.directives
         *
         * @description
         * The `tbTextArea` component represents a textarea field. 
         * Similar to `tbSimpleEditor` but with a `textarea` HTML element instead of `input`.
         * 
         * It uses the `TubularModel` to retrieve column or field information.
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
        .component('tbTextArea', {
            template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid && $ctrl.$dirty() }">' +
                '<span ng-hide="$ctrl.isEditing">{{$ctrl.value}}</span>' +
                '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
                '<textarea ng-show="$ctrl.isEditing" placeholder="{{$ctrl.placeholder}}" ng-model="$ctrl.value" class="form-control" ' +
                ' ng-required="$ctrl.required" ng-readonly="$ctrl.readOnly" name="{{$ctrl.name}}"></textarea>' +
                '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">' +
                '{{error}}' +
                '</span>' +
                '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help">{{$ctrl.help}}</span>' +
                '</div>',
            bindings: {
                value: '=?',
                isEditing: '=?',
                showLabel: '=?',
                label: '@?',
                placeholder: '@?',
                required: '=?',
                min: '=?',
                max: '=?',
                name: '@',
                readOnly: '=?',
                help: '@?'
            },
            controller: [
                'tubularEditorService', '$scope', '$filter', function (tubularEditorService, $scope, $filter) {
                    var $ctrl = this;

                    $ctrl.validate = function () {
                        if (angular.isDefined($ctrl.min) && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                            if ($ctrl.value.length < parseInt($ctrl.min)) {
                                $ctrl.$valid = false;
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MIN_CHARS', +$ctrl.min)];
                                return;
                            }
                        }

                        if (angular.isDefined($ctrl.max) && angular.isDefined($ctrl.value) && $ctrl.value != null) {
                            if ($ctrl.value.length > parseInt($ctrl.max)) {
                                $ctrl.$valid = false;
                                $ctrl.state.$errors = [$filter('translate')('EDITOR_MAX_CHARS', +$ctrl.max)];
                                return;
                            }
                        }
                    };


                    $ctrl.$onInit = function() {
                        tubularEditorService.setupScope($scope, null, $ctrl, false);
                    };
                }
            ]
        });
})(window.angular);