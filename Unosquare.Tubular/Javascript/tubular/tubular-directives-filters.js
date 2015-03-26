(function() {
    'use strict';

    angular.module('tubular.directives').directive('tubularColumnFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

                return {
                    require: '^tubularColumn',
                    template: '<div class="tubular-column-filter">' +
                        '<button class="tubular-column-filter-button btn btn-xs btn-default" data-toggle="popover" data-placement="bottom" ' +
                        'ng-class="{ \'btn-success\': (filter.Operator !== \'None\' && filter.Text.length > 0) }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Operator" ng-hide="dataType == \'boolean\'"></select>' +
                        '<input class="form-control" type="{{ dataType == \'boolean\' ? \'checkbox\' : \'search\'}}" ng-model="filter.Text" placeholder="Value" ' +
                        'ng-disabled="filter.Operator == \'None\'" />' +
                        '<input type="search" class="form-control" ng-model="filter.Argument[0]" ng-show="filter.Operator == \'Between\'" /> <hr />' +
                        '<div class="btn-group"><a class="btn btn-sm btn-success" ng-click="applyFilter()">Apply</a>' +
                        '<button class="btn btn-sm btn-danger" ng-click="clearFilter()">Clear</button>' +
                        '<button class="btn btn-sm btn-default" ng-click="close()">Close</button>' +
                        '</div>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {

                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement);
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.createFilterModel(scope, lAttrs);
                            }
                        };
                    }
                };
            }
        ])
        .directive('tubularColumnDateTimeFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

                return {
                    require: '^tubularColumn',
                    template: '<div ngTransclude class="btn-group tubular-column-filter">' +
                        '<button class="tubular-column-filter-button btn btn-xs btn-default" data-toggle="popover" data-placement="bottom" ' +
                        'ng-class="{ \'btn-success\': filter.Text != null }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Operator"></select>' +
                        '<input type="date" class="form-control" ng-model="filter.Text" />' +
                        '<input type="date" class="form-control" ng-model="filter.Argument[0]" ng-show="filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<div class="btn-group"><a class="btn btn-sm btn-default" ng-click="applyFilter()">Apply</a>' +
                        '<button class="btn btn-sm btn-default" ng-click="clearFilter()">Clear</button></div>' +
                        '<button class="btn btn-sm btn-default" ng-click="close()">Close</button>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.filter = {};

                            $scope.format = 'yyyy-MM-dd';
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, function() {
                                    var inp = $(lElement).find("input[type=date]")[0];

                                    if (inp.type != 'date') {
                                        $(inp).datepicker({
                                            dateFormat: scope.format.toLowerCase()
                                        }).on("dateChange", function(e) {
                                            scope.filter.Text = e.date;
                                        });
                                    }

                                    var inpLev = $(lElement).find("input[type=date]")[1];

                                    if (inpLev.type != 'date') {
                                        $(inpLev).datepicker({
                                            dateFormat: scope.format.toLowerCase()
                                        }).on("dateChange", function(e) {
                                            scope.filter.Argument = [e.date];
                                        });
                                    }
                                });
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.createFilterModel(scope, lAttrs);
                            }
                        };
                    }
                };
            }
        ])
        .directive('tubularColumnOptionsFilter', [
            'tubularGridFilterService', 'tubularHttp', function(tubularGridFilterService, tubularHttp) {

                return {
                    require: '^tubularColumn',
                    template: '<div class="tubular-column-filter">' +
                        '<button class="tubular-column-filter-button btn btn-xs btn-default" data-toggle="popover" data-placement="bottom" ' +
                        'ng-class="{ \'btn-success\': (filter.Argument.length > 0) }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Argument" ng-options="item for item in optionsItems" multiple></select>' +
                        '<hr />' + // Maybe we should add checkboxes or something like that
                        '<div class="btn-group"><a class="btn btn-sm btn-default" ng-click="applyFilter()">Apply</a>' +
                        '<button class="btn btn-sm btn-default" ng-click="clearFilter()">Clear</button>' +
                        '<button class="btn btn-sm btn-default" ng-click="close()">Close</button>' +
                        '</div>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.dataIsLoaded = false;

                            $scope.getOptionsFromUrl = function() {
                                if ($scope.dataIsLoaded) return;

                                var currentRequest = tubularHttp.retrieveDataAsync({
                                    serverUrl: $scope.filter.OptionsUrl,
                                    requestMethod: 'GET',
                                    timeout: 1000
                                });

                                currentRequest.promise.then(
                                    function(data) {
                                        $scope.optionsItems = data;
                                        $scope.dataIsLoaded = true;
                                    }, function(error) {
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                    });
                            };
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, function() {
                                    scope.getOptionsFromUrl();
                                });
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.createFilterModel(scope, lAttrs);
                            }
                        };
                    }
                };
            }
        ]);
})();