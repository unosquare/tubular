(function() {
    "use strict";
    
    var chosenCtrl = [
        '$scope', 'tubularEditorService', function($scope, tubularEditorService) {
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

                if (angular.isDefined($scope.$component.model) && angular.isDefined($scope.options)) {
                    if (angular.isUndefined($scope.$component.model.$metadata))
                        $scope.$component.model.$metadata = {};

                    if (angular.isDefined($scope.options.filter))
                        $scope.$component.model.$metadata[$scope.name] = $scope.options.filter(function (el) { return el[$scope.optionKey] == val });
                }
            });

            $scope.resetEditor = function () {
                $scope.dataIsLoaded = false;
                $scope.value = null;
                $scope.options = [];
                // TODO: Retrive default value?
                $scope.loadData();
            };

            $scope.loadData = function() {
                if ($scope.dataIsLoaded || !$scope.optionsUrl) {
                    return;
                }

                if (angular.isUndefined($scope.$component) || $scope.$component == null) {
                    throw 'You need to define a parent Form or Grid';
                }

                var separator = $scope.optionsUrl.indexOf('?') === -1 ? '?' : '&';
                
                var currentRequest = $scope.$component.dataService.retrieveDataAsync({
                    serverUrl: $scope.optionsUrl + separator + '_=' + new Date().getTime(),
                    requestMethod: $scope.optionsMethod || 'GET'
                });

                var value = $scope.value;
                $scope.value = $scope.multiple ? [] : '';

                currentRequest.promise.then(
                    function (data) {
                        $scope.options = data;

                        if ($scope.allowEmpty) {
                            if (angular.isDefined($scope.optionLabel)) {
                                var model = {};
                                model[$scope.optionLabel] = "";
                                if (angular.isDefined($scope.optionKey)) {
                                    model[$scope.optionKey] = "";
                                }
                                $scope.options.push(model);
                            } else {
                                $scope.options.push("");
                            }
                        }

                        $scope.dataIsLoaded = true;

                        if ($scope.multiple) {
                            $scope.value = value;
                        } else {
                            if ($scope.allowEmpty) {
                                $scope.value = value || $scope.defaultValue;
                            } else {
                                var possibleValue = $scope.options && $scope.options.length > 0 ?
                                    angular.isDefined($scope.optionKey) ? $scope.options[0][$scope.optionKey] : $scope.options[0]
                                    : '';
                                $scope.value = value || $scope.defaultValue || possibleValue;
                            }
                        }
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
    ];

    angular.module('tubular.chosen', ['tubular.services', 'tubular.models', 'localytics.directives']).directive('tbChosen', [
        'tubularEditorService', function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{ value }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<select chosen ng-options="{{ selectOptions }}" ng-show="isEditing" ng-model="value" class="form-control" ' +
                    'ng-required="required" ng-disabled="readOnly" />' +
                    '<span class="help-block error-block" ng-show="isEditing" ng-repeat="error in state.$errors">' +
                    '{{error}}' +
                    '</span>' +
                    '<span class="help-block" ng-show="isEditing && help">{{help}}</span>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: angular.extend({ options: '=?', optionsUrl: '@', optionsMethod: '@?', optionLabel: '@?', optionKey: '@?', defaultValue: '@?', allowEmpty: '=?' }, tubularEditorService.defaultScope),
                controller: chosenCtrl
            };
        }
    ]).directive('tbChosenMultiple', [
        'tubularEditorService', function(tubularEditorService) {

            return {
                template: '<div ng-class="{ \'form-group\' : showLabel && isEditing, \'has-error\' : !$valid }">' +
                    '<span ng-hide="isEditing">{{ value }}</span>' +
                    '<label ng-show="showLabel">{{ label }}</label>' +
                    '<select chosen multiple ng-options="{{ selectOptions }}" ng-show="isEditing" ng-model="value" class="form-control" ' +
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
                controller: chosenCtrl
            };
        }
    ]).directive('tbColumnChosenFilter', [
            'tubularGridFilterService', function (tubularGridFilterService) {

                return {
                    require: '^tbColumn',
                    template: '<div class="tubular-column-menu">' +
                        '<button class="btn btn-xs btn-default btn-popover" ng-click="open()" ' +
                        'ng-class="{ \'btn-success\': filter.HasFilter }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<button type="button" class="close" data-dismiss="modal" ng-click="close()"><span aria-hidden="true">×</span></button>' +
                        '<h4>{{::filterTitle}}</h4>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Text" ng-options="item for item in optionsItems" ' +
                        ' ng-disabled="dataIsLoaded == false"></select>' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', '$timeout', function ($scope, $timeout) {
                            $scope.getOptionsFromUrl = function () {
                                $scope.$component.dataService.retrieveDataAsync({
                                    serverUrl: $scope.filter.OptionsUrl,
                                    requestMethod: 'GET'
                                }).promise.then(function (data) {
                                    $scope.optionsItems = data;
                                    $scope.filter.Operator = 'Contains';

                                    if (angular.isDefined($scope.optionLabel)) {
                                        $scope.optionsItems = data.map(function (x) { return x[$scope.optionLabel]; });
                                    }
                                }, function (error) {
                                    $scope.$emit('tbGrid_OnConnectionError', error);
                                });
                            };

                            $scope.loadChosen = function (lElement) {
                                $(lElement).find('.btn-popover').on('show.bs.popover', function (e) {
                                    $timeout(function () {
                                        $(lElement).find('div.popover').find('select').chosen();
                                    }, 100);
                                });
                            };
                        }
                    ],
                    compile: function compile() {
                        return {
                            pre: function (scope, lElement, lAttrs) {
                                scope.optionLabel = lAttrs.optionLabel;
                                scope.optionKey = lAttrs.optionKey;

                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs);
                                tubularGridFilterService.createFilterModel(scope, lAttrs);
                                scope.getOptionsFromUrl();
                            },
                            post: function (scope, lElement, lAttrs) {
                                scope.loadChosen(lElement);
                            }
                        };
                    }
                };
            }
    ]);
})();
