(function() {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbColumnFilterButtons
         * @restrict E
         *
         * @description
         * The `tbColumnFilterButtons` is an internal directive, and it is used to show basic filtering buttons.
         */
        .directive('tbColumnFilterButtons', [function () {
            return {
                template: '<div class="btn-group"><a class="btn btn-sm btn-success" ng-click="applyFilter()">Apply</a>' +
                        '<button class="btn btn-sm btn-danger" ng-click="clearFilter()">Clear</button>' +
                        '<button class="btn btn-sm btn-default" ng-click="close()">Close</button>' +
                        '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
            };
        }])
        /**
         * @ngdoc directive
         * @name tbColumnFilterColumnSelector
         * @restrict E
         *
         * @description
         * The `tbColumnFilterColumnSelector` is an internal directive, and it is used to show columns selector popup.
         */
        .directive('tbColumnFilterColumnSelector', [function() {
            return {
                template: '<div><hr /><h4>Columns Selector</h4><button class="btn btn-sm btn-default" ng-click="openColumnsSelector()">Select Columns</button></div>',
                restrict: 'E',
                replace: true,
                transclude: true,
            };
        }])
        /**
         * @ngdoc directive
         * @name tbColumnFilter
         * @restrict E
         *
         * @description
         * The `tbColumnFilter` directive is a the basic filter popover. You need to define it inside a `tbColumn`.
         * 
         * The parent scope will provide information about the data type.
         * TODO: List params from tubularGridFilterService
         */
        .directive('tbColumnFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

                return {
                    require: '^tbColumn',
                    template: '<div class="tubular-column-menu">' +
                        '<button class="btn btn-xs btn-default" data-toggle="popover" data-placement="bottom" ' +
                        'ng-class="{ \'btn-success\': (filter.Operator !== \'None\' && filter.Text.length > 0) }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<h4>{{filterTitle}}</h4>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Operator" ng-hide="dataType == \'boolean\'"></select>' +
                        '<input class="form-control" type="{{ dataType == \'boolean\' ? \'checkbox\' : \'search\'}}" ng-model="filter.Text" placeholder="Value" ' +
                        'ng-disabled="filter.Operator == \'None\'" />' +
                        '<input type="search" class="form-control" ng-model="filter.Argument[0]" ng-show="filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '<tb-column-filter-column-selector ng-show="columnSelector"></tb-column-filter-column-selector>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs);
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.createFilterModel(scope, lAttrs);
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumnDateTimeFilter
         * @restrict E
         *
         * @description
         * The `tbColumnDateTimeFilter` directive is a specific filter with Date and Time editors, instead regular inputs.
         * 
         * The parent scope will provide information about the data type.
         * 
         * TODO: List params from tubularGridFilterService
         */
        .directive('tbColumnDateTimeFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

                return {
                    require: '^tbColumn',
                    template: '<div ngTransclude class="btn-group tubular-column-filter">' +
                        '<button class="tubular-column-filter-button btn btn-xs btn-default" data-toggle="popover" data-placement="bottom" ' +
                        'ng-class="{ \'btn-success\': filter.Text != null }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<h4>{{filterTitle}}</h4>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Operator"></select>' +
                        '<input type="date" class="form-control" ng-model="filter.Text" />' +
                        '<input type="date" class="form-control" ng-model="filter.Argument[0]" ng-show="filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '<tb-column-filter-column-selector ng-show="columnSelector"></tb-column-filter-column-selector>' +
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
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs, function() {
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
        /**
         * @ngdoc directive
         * @name tbColumnOptionsFilter
         * @restrict E
         *
         * @description
         * The `tbColumnOptionsFilter` directive is a filter with an dropdown listing all the possible values to filter.
         * 
         * TODO: List params from tubularGridFilterService
         */
        .directive('tbColumnOptionsFilter', [
            'tubularGridFilterService', 'tubularHttp', function(tubularGridFilterService, tubularHttp) {

                return {
                    require: '^tbColumn',
                    template: '<div class="tubular-column-filter">' +
                        '<button class="tubular-column-filter-button btn btn-xs btn-default" data-toggle="popover" data-placement="bottom" ' +
                        'ng-class="{ \'btn-success\': (filter.Argument.length > 0) }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<h4>{{filterTitle}}</h4>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Argument" ng-options="item for item in optionsItems" multiple></select>' +
                        '<hr />' + // Maybe we should add checkboxes or something like that
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '<tb-column-filter-column-selector ng-show="columnSelector"></tb-column-filter-column-selector>' +
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
                                    requestMethod: 'GET'
                                });

                                currentRequest.promise.then(
                                    function(data) {
                                        $scope.optionsItems = data;
                                        $scope.dataIsLoaded = true;
                                    }, function(error) {
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    });
                            };
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs,function() {
                                    scope.getOptionsFromUrl();
                                });
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                tubularGridFilterService.createFilterModel(scope, lAttrs);

                                scope.filter.Operator = 'Multiple';
                            }
                        };
                    }
                };
            }
        ]);
})();