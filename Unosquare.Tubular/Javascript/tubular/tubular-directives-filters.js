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
                template: '<div class="text-right">' +
                        '<a class="btn btn-sm btn-success" ng-click="applyFilter()" ng-disabled="filter.Operator == \'None\'">{{\'CAPTION_APPLY\' | translate}}</a>&nbsp;' +
                        '<button class="btn btn-sm btn-danger" ng-click="clearFilter()">{{\'CAPTION_CLEAR\' | translate}}</button>' +
                        '</div>',
                restrict: 'E',
                replace: true,
                transclude: true
            };
        }])
        /**
         * @ngdoc directive
         * @name tbColumnSelector
         * @restrict E
         *
         * @description
         * The `tbColumnSelector` is a button to show columns selector popup.
         */
        .directive('tbColumnSelector', [function () {
            return {
                template: '<button class="btn btn-sm btn-default" ng-click="openColumnsSelector()">{{\'CAPTION_SELECTCOLUMNS\' | translate}}</button></div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                controller: ['$scope', '$uibModal', function ($scope, $modal) {
                    $scope.$component = $scope.$parent;

                    $scope.openColumnsSelector = function () {
                        var model = $scope.$component.columns;

                        var dialog = $modal.open({
                            template: '<div class="modal-header">' +
                                '<h3 class="modal-title">{{\'CAPTION_SELECTCOLUMNS\' | translate}}</h3>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                '<table class="table table-bordered table-responsive table-striped table-hover table-condensed">' +
                                '<thead><tr><th>Visible?</th><th>Name</th><th>Grouping?</th></tr></thead>' +
                                '<tbody><tr ng-repeat="col in Model">' +
                                '<td><input type="checkbox" ng-model="col.Visible" ng-disabled="col.Visible && isInvalid()" /></td>' +
                                '<td>{{col.Label}}</td>' +
                                '<td><input type="checkbox" ng-disabled="true" ng-model="col.IsGrouping" /></td>' +
                                '</tr></tbody></table></div>' +
                                '</div>' +
                                '<div class="modal-footer"><button class="btn btn-warning" ng-click="closePopup()">{{\'CAPTION_CLOSE\' | translate}}</button></div>',
                            backdropClass: 'fullHeight',
                            animation: false,
                            controller: [
                                '$scope', function ($innerScope) {
                                    $innerScope.Model = model;
                                    $innerScope.isInvalid = function () {
                                        return $innerScope.Model.filter(function (el) { return el.Visible; }).length === 1;
                                    }

                                    $innerScope.closePopup = function () {
                                        dialog.close();
                                    };
                                }
                            ]
                        });
                    };
                }]
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
         * 
         * @param {string} text Set the search text.
         * @param {string} operator Set the initial operator, default depends on data type.
         */
        .directive('tbColumnFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

                return {
                    require: '^tbColumn',
                    template: '<div class="tubular-column-menu">' +
                        '<button class="btn btn-xs btn-default btn-popover" ng-click="open()" ' +
                        'ng-class="{ \'btn-success\': filter.HasFilter }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<button type="button" class="close" data-dismiss="modal" ng-click="close()"><span aria-hidden="true">×</span></button>' +
                        '<h4>{{filterTitle}}</h4>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Operator" ng-hide="dataType == \'boolean\'"></select>&nbsp;' +
                        '<input class="form-control" type="search" ng-model="filter.Text" autofocus ng-keypress="checkEvent($event)" ng-hide="dataType == \'boolean\'"' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="filter.Operator == \'None\'" />' +
                        '<div class="text-center" ng-show="dataType == \'boolean\'">' +
                        '<button type="button" class="btn btn-default btn-md" ng-disabled="filter.Text === true" ng-click="filter.Text = true; filter.Operator = \'Equals\';">' +
                        '<i class="fa fa-check"></i></button>&nbsp;' +
                        '<button type="button" class="btn btn-default btn-md" ng-disabled="filter.Text === false" ng-click="filter.Text = false; filter.Operator = \'Equals\';">' +
                        '<i class="fa fa-times"></i></button></div>' +
                        '<input type="search" class="form-control" ng-model="filter.Argument[0]" ng-keypress="checkEvent($event)" ng-show="filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    compile: function compile() {
                        return {
                            pre: function(scope, lElement, lAttrs) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs);
                            },
                            post: function(scope, lElement, lAttrs) {
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
         * @param {string} text Set the search text.
         * @param {object} argument Set the search object (if the search is text use text attribute).
         * @param {string} operator Set the initial operator, default depends on data type.
         */
        .directive('tbColumnDateTimeFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

                return {
                    require: '^tbColumn',
                    template: '<div ngTransclude class="btn-group tubular-column-menu">' +
                        '<button class="btn btn-xs btn-default btn-popover" ng-click="open()" ' +
                        'ng-class="{ \'btn-success\': filter.HasFilter }">' +
                        '<i class="fa fa-filter"></i></button>' +
                        '<div style="display: none;">' +
                        '<button type="button" class="close" data-dismiss="modal" ng-click="close()"><span aria-hidden="true">×</span></button>' +
                        '<h4>{{filterTitle}}</h4>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-model="filter.Operator"></select>' +
                        '<input type="date" class="form-control" ng-model="filter.Text" ng-keypress="checkEvent($event)" />&nbsp;' +
                        '<input type="date" class="form-control" ng-model="filter.Argument[0]" ng-keypress="checkEvent($event)" ' +
                        'ng-show="filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
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
                    compile: function compile() {
                        return {
                            pre: function(scope, lElement, lAttrs) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs, function() {
                                    var inp = $(lElement).find("input[type=date]")[0];

                                    if (inp.type !== 'date') {
                                        $(inp).datepicker({
                                            dateFormat: scope.format.toLowerCase()
                                        }).on("dateChange", function(e) {
                                            scope.filter.Text = e.date;
                                        });
                                    }

                                    var inpLev = $(lElement).find("input[type=date]")[1];

                                    if (inpLev.type !== 'date') {
                                        $(inpLev).datepicker({
                                            dateFormat: scope.format.toLowerCase()
                                        }).on("dateChange", function(e) {
                                            scope.filter.Argument = [e.date];
                                        });
                                    }
                                });
                            },
                            post: function(scope, lElement, lAttrs) {
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
         * @scope
         * 
         * @param {object} argument Set the search object.
         * @param {string} operator Set the initial operator, default depends on data type.
         * @param {string} optionsUrl Set the URL to retrieve options
         */
        .directive('tbColumnOptionsFilter', [
            'tubularGridFilterService', function(tubularGridFilterService) {

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
                        '<select class="form-control checkbox-list" ng-model="filter.Argument" ng-options="item for item in optionsItems" ' +
                        ' multiple ng-disabled="dataIsLoaded == false"></select>' +
                        '<hr />' + 
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.dataIsLoaded = false;
                            
                            $scope.getOptionsFromUrl = function () {
                                if ($scope.dataIsLoaded) {
                                    $scope.$apply();
                                    return;
                                }

                                var currentRequest = $scope.$component.dataService.retrieveDataAsync({
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
                    compile: function compile() {
                        return {
                            pre: function(scope, lElement, lAttrs) {
                                tubularGridFilterService.applyFilterFuncs(scope, lElement, lAttrs, function() {
                                    scope.getOptionsFromUrl();
                                });
                            },
                            post: function(scope, lElement, lAttrs) {
                                tubularGridFilterService.createFilterModel(scope, lAttrs);

                                scope.filter.Operator = 'Multiple';
                            }
                        };
                    }
                };
            }
        ]);
})();