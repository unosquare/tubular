(function (angular) {
    'use strict';

    var chosenCtrl = [
        '$scope', 'tubularEditorService', '$timeout', '$element', function ($scope, tubular, $timeout, $element) {
            var $ctrl = this;

            $ctrl.$onInit = function() {
                tubular.setupScope($scope, null, $ctrl);
                $ctrl.dataIsLoaded = false;
                $ctrl.alreadyChosen = false;
                $ctrl.selectOptions = 'd for d in $ctrl.options';

                if (angular.isDefined($ctrl.optionLabel)) {
                    $ctrl.selectOptions = 'd.' + $ctrl.optionLabel + ' for d in $ctrl.options';

                    if (angular.isDefined($ctrl.optionTrack)) {
                        $ctrl.selectOptions = 'd as d.' +
                            $ctrl.optionLabel +
                            ' for d in $ctrl.options track by d.' +
                            $ctrl.optionTrack;
                    } else {
                        if (angular.isDefined($ctrl.optionKey)) {
                            $ctrl.selectOptions = 'd.' + $ctrl.optionKey + ' as ' + $ctrl.selectOptions;
                        }
                    }
                }
            };

            $ctrl.updateMetaData = function (val) {
                if (angular.isDefined($ctrl.$component.model) && angular.isDefined($ctrl.options)) {
                    if (angular.isUndefined($ctrl.$component.model.$metadata)) {
                        $ctrl.$component.model.$metadata = {};
                    }

                    if (angular.isDefined($ctrl.options.filter)) {
                        $ctrl.$component.model.$metadata[$ctrl.name] = $ctrl.options
                            .filter(function(el) { return el[$ctrl.optionKey] === val });
                    }
                }
            }

            $scope.$watch('value', function (val) {
                $scope.$emit('tbForm_OnFieldChange', $ctrl.$component, $ctrl.name, val);
                $ctrl.updateMetaData(val);
            });

            $ctrl.resetEditor = function () {
                $ctrl.dataIsLoaded = false;
                $ctrl.value = null;
                $ctrl.options = [];
                // TODO: Retrive default value?
                $ctrl.loadData();
            };

            $ctrl.loadData = function () {
                if ($ctrl.dataIsLoaded || !$ctrl.optionsUrl) {
                    return;
                }

                if (angular.isUndefined($ctrl.$component) || $ctrl.$component == null) {
                    throw 'You need to define a parent Form or Grid';
                }

                var separator = $ctrl.optionsUrl.indexOf('?') === -1 ? '?' : '&';

                var currentRequest = $ctrl.$component.dataService.retrieveDataAsync({
                    serverUrl: $ctrl.optionsUrl + separator + '_=' + new Date().getTime(),
                    requestMethod: $ctrl.optionsMethod || 'GET'
                });

                var value = $ctrl.value;
                $ctrl.value = $ctrl.multiple ? [] : '';

                currentRequest.then(
                    function (data) {
                        $ctrl.options = data;

                        if ($ctrl.allowEmpty) {
                            if (angular.isDefined($ctrl.optionLabel)) {
                                var model = {};
                                model[$ctrl.optionLabel] = '';
                                if (angular.isDefined($ctrl.optionKey)) {
                                    model[$ctrl.optionKey] = '';
                                }
                                $ctrl.options.push(model);
                            } else {
                                $ctrl.options.push('');
                            }
                        }

                        $ctrl.dataIsLoaded = true;

                        if ($ctrl.multiple) {
                            $ctrl.value = value;
                        } else {
                            if ($ctrl.allowEmpty) {
                                $ctrl.value = value || $ctrl.defaultValue;
                            } else {
                                var possibleValue = $ctrl.options && $ctrl.options.length > 0 ?
                                    angular.isDefined($ctrl.optionKey) ? $ctrl.options[0][$ctrl.optionKey] : $ctrl.options[0]
                                    : '';

                                if (angular.isDefined(value) && value != null && $ctrl.options && $ctrl.options.length > 0 && angular.isDefined($ctrl.optionKey)) {
                                    value = undefined;
                                }

                                $ctrl.value = value || $ctrl.defaultValue || possibleValue;
                                $ctrl.updateMetaData($ctrl.value);
                            }
                        }
                    }, function (error) {
                        $scope.$emit('tbGrid_OnConnectionError', error);
                    }).then(function () {
                        $timeout(function () {
                            if ($ctrl.alreadyChosen) {
                                $element.find('select').trigger('chosen:updated');
                            } else {
                                $element.find('select').chosen();
                                $ctrl.alreadyChosen = true;
                            }
                        }, 1000);
                    });
            };

            if (angular.isDefined($ctrl.optionsUrl)) {
                $scope.$watch('optionsUrl', function () {
                    $ctrl.dataIsLoaded = false;
                    $ctrl.loadData();
                });

                if ($ctrl.isEditing) {
                    $ctrl.loadData();
                } else {
                    $scope.$watch('isEditing', function () {
                        if ($ctrl.isEditing) {
                            $ctrl.loadData();
                        }
                    });
                }
            } else {
                $timeout(function () {
                    $element.find('select').chosen();
                    $ctrl.alreadyChosen = true;
                }, 1500);
            }
        }
    ];

    angular.module('tubular.chosen', ['tubular.services', 'tubular.models']).component('tbChosen', {
        template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid }">' +
            '<span ng-hide="$ctrl.isEditing">{{ $ctrl.value }}</span>' +
            '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }} <a href="{{$ctrl.helpLink}}" ng-show="$ctrl.helpLink" class="small">{{$ctrl.helpText}}</a></label>' +
            '<select ng-options="{{ $ctrl.selectOptions }}" ng-show="$ctrl.isEditing" ng-model="$ctrl.value" class="form-control" ' +
            'ng-required="$ctrl.required" ng-disabled="$ctrl.readOnly" />' +
            '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>' +
            '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help" ng-bind="$ctrl.help"></span>' +
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
            options: '=?',
            optionsUrl: '@',
            optionsMethod: '@?',
            optionLabel: '@?',
            optionKey: '@?',
            defaultValue: '@?',
            allowEmpty: '=?',
            helpLink: '@?',
            helpText: '@?'
        },
        controller: chosenCtrl
    }).component('tbChosenMultiple', {
        template: '<div ng-class="{ \'form-group\' : $ctrl.showLabel && $ctrl.isEditing, \'has-error\' : !$ctrl.$valid }">' +
            '<span ng-hide="$ctrl.isEditing">{{ $ctrl.value }}</span>' +
            '<label ng-show="$ctrl.showLabel">{{ $ctrl.label }}</label>' +
            '<select multiple ng-options="{{ $ctrl.selectOptions }}" ng-show="$ctrl.isEditing" ng-model="$ctrl.value" class="form-control" ' +
            'ng-required="$ctrl.required" ng-disabled="$ctrl.readOnly" />' +
            '<span class="help-block error-block" ng-show="$ctrl.isEditing" ng-repeat="error in $ctrl.state.$errors">{{error}}</span>' +
            '<span class="help-block" ng-show="$ctrl.isEditing && $ctrl.help" ng-bind="$ctrl.help"></span>' +
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
            options: '=?',
            optionsUrl: '@',
            optionsMethod: '@?',
            optionLabel: '@?',
            optionKey: '@?',
            defaultValue: '@?'
        }, 
        controller: chosenCtrl
    });
})(angular);
