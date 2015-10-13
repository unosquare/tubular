(function() {
    'use strict';

    angular.module('tubular-reporting.directives', ['tubular.services'])
        /**
         * @ngdoc directive
         * @name tbReporting
         * @restrict E
         *
         * @description
         * The `tbReporting` directive is the base to create reports using the .NET proxy service.
         * 
         * @scope
         * 
         * @param {string} serverDataSourceUrl Set the HTTP URL where the data source comes.
         * @param {string} serverMarkupUrl Defines the Tubular Generator URL.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         */
        .directive('tbReporting', [
            function() {
                return {
                    template: '<div class="container"><tb-form model="Model">' +
                        '<div class="row" ng-show="isShowing">' +
                        '<div class="col-md-3">' +
                        '<div class="pull-right clearfix">' +
                        '<tb-typeahead-editor name="CurrentReport" options="reports" option-label="Name" placeholder="Report name"></tb-typeahead-editor>' +
                        '</div>' +
                        '</div>' +
                        '<div class="col-md-6">' +
                        '<div class="pull-right clearfix">' +
                        '<button class="btn btn-default" ng-click="loadReport()" ng-disabled="!Model.CurrentReport">' +
                        '<i class="fa fa-cloud-download"></i>&nbsp;{{\'CAPTION_LOAD\' | translate}}' +
                        '</button>' +
                        '<button class="btn btn-default" ng-click="saveReport()" ng-disabled="!Model.CurrentReport">' +
                        '<i class="fa fa-cloud-upload"></i>&nbsp;{{\'CAPTION_SAVE\' | translate}}' +
                        '</button>' +
                        '<button class="btn btn-default" ng-click="removeReport()" ng-disabled="!Model.CurrentReport.Name">' +
                        '<i class="fa fa-trash-o"></i>&nbsp;{{\'CAPTION_REMOVE\' | translate}}' +
                        '</button>' +
                        '</div></div>' +
                        '<div class="col-md-3">' +
                        '<div class="pull-right clearfix">' +
                        '<button class="btn btn-success" ng-disabled="items.length == 0" ng-click="generate()">' +
                        '<i class="fa fa-cogs"></i>&nbsp;{{\'UI_GENERATEREPORT\' | translate}}' +
                        '</button>' +
                        '</div></div></div>' +
                        '<br />' +
                        '<table class="table table-bordered" ng-show="isShowing">' +
                        '<thead><tr>' +
                        '<th>Data Source</th>' +
                        '<th>Column</th>' +
                        '<th>Data Type</th>' +
                        '<th>Aggregation</th>' +
                        '<th>Filter Expression</th>' +
                        '<th>&nbsp;</th>' +
                        '</tr></thead>' +
                        '<tbody><tr>' +
                        '<td><tb-dropdown-editor name="DataSource" options="dataSources" option-label="Name"></tb-dropdown-editor></td>' +
                        '<td><tb-dropdown-editor name="Column" options="Model.DataSource.Columns" option-label="Name" option-id="Name"></tb-dropdown-editor></td>' +
                        '<td><tb-simple-editor name="DataType" read-only="true" value="types[Model.Column.DataType]"></tb-simple-editor></td>' +
                        '<td><tb-dropdown-editor name="AggregationFunction" options="aggregationFunctions"></tb-dropdown-editor></td>' +
                        '<td><tb-simple-editor name="Filter"></tb-simple-editor></td>' +
                        '<td class="text-center"><button class="btn btn-success btn-sm" ng-click="addItem()">{{\'CAPTION_ADD\' | translate}}</button></td>' +
                        '</tr><tr ng-repeat="item in items">' +
                        '<td>{{item.DataSource}}</td>' +
                        '<td>{{item.Column}}</td>' +
                        '<td>{{item.DataType}}</td>' +
                        '<td><select class="form-control" ng-model="item.Aggregation" ng-options="a for a in aggregationFunctions"></select></td>' +
                        '<td><input type="text" class="form-control" ng-model="item.Filter" /></td>' +
                        '<td class="text-center">' +
                        '<div class="btn-group">' +
                        '<button class="btn btn-sm" ng-click="up(item)" ng-disabled="$first"><i class="fa fa-chevron-up"></i></button>' +
                        '<button class="btn btn-sm" ng-click="down(item)" ng-disabled="$last"><i class="fa fa-chevron-down"></i></button>' +
                        '<button class="btn btn-danger btn-sm" ng-click="removeItem(item)"><i class="fa fa-trash"></i></button>' +
                        '</div>' +
                        '</td></tr></tbody></table>' +
                        '</tb-form>' +
                        '<button class="btn btn-xs btn-block" tooltip="Click to toggle" ng-click="isShowing = !isShowing"><i class="fa" ng-class="{\'fa-caret-down\' : !isShowing, \'fa-caret-up\' : isShowing, }"></i></button>' +
                        '<hr />' +
                        '<div ng-include="autoCode"></div></div>',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        serverDataSourceUrl: '@',
                        serverMarkupUrl: '@',
                        requireAuthentication: '=?'
                    },
                    controller: [
                        '$scope', 'tubularHttp', 'localStorageService',
                        function($scope, tubularHttp, localStorageService) {
                            $scope.tubularDirective = 'tubular-reporting';
                            $scope.isShowing = true;

                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;
                            $scope.items = [];
                            $scope.reports = localStorageService.get('reports') || [];

                            tubularHttp.setRequireAuthentication($scope.requireAuthentication);

                            tubularHttp.get($scope.serverDataSourceUrl || 'api/reports/datasources').promise.then(function(data) {
                                $scope.dataSources = data.DataSources;
                                $scope.aggregationFunctions = data.AggregationFunctions;
                                $scope.types = data.Types;
                            }, function (error) {
                                $scope.$emit('tbReporting_OnConnectionError', error);
                            });

                            $scope.addItem = function() {
                                $scope.items.push({
                                    DataSource: $scope.Model.DataSource.Name,
                                    Column: $scope.Model.Column.Name,
                                    DataType: $scope.Model.DataType,
                                    Aggregation: $scope.Model.AggregationFunction,
                                    Filter: $scope.Model.Filter
                                });

                                $scope.Model.Filter = '';
                            };

                            $scope.removeItem = function(item) {
                                var index = $scope.items.indexOf(item);
                                if (index > -1) {
                                    $scope.items.splice(index, 1);
                                }
                            };

                            $scope.moveItem = function(from, to) {
                                $scope.items.splice(to, 0, $scope.items.splice(from, 1)[0]);
                            }

                            $scope.up = function(item) {
                                var oldIndex = $scope.items.indexOf(item);

                                $scope.moveItem(oldIndex, oldIndex - 1);
                            };

                            $scope.down = function(item) {
                                var oldIndex = $scope.items.indexOf(item);

                                $scope.moveItem(oldIndex, oldIndex + 1);
                            };

                            $scope.saveReport = function() {
                                $scope.reports.push({ Name: $scope.Model.CurrentReport, Data: $scope.items });
                                localStorageService.set('reports', $scope.reports);

                                $scope.$emit('tbReporting_OnSuccessfulSave', "Report saved");
                            };

                            $scope.removeReport = function() {
                                var report = $scope.reports.filter(function(el) { return el.Name === $scope.Model.CurrentReport.Name; });

                                if (report && report[0]) {
                                    var index = $scope.reports.indexOf(report[0]);

                                    if (index > -1) {
                                        $scope.reports.splice(index, 1);
                                        localStorageService.set('reports', $scope.reports);
                                        $scope.$emit('tbReporting_OnRemoved', "Report removed");
                                    }
                                } else {
                                    $scope.$emit('tbReporting_OnConnectionError', "Unknown report");
                                }
                            };

                            $scope.loadReport = function() {
                                var report = $scope.reports.filter(function(el) { return el.Name === $scope.Model.CurrentReport.Name; });

                                if (report && report[0]) {
                                    $scope.items = report[0].Data;
                                } else {
                                    $scope.$emit('tbReporting_OnConnectionError', "Unknown report");
                                }
                            };

                            $scope.isValid = function() {
                                return $scope.items.length > 0;
                            };

                            $scope.generate = function() {
                                tubularHttp.setRequireAuthentication($scope.requireAuthentication);

                                tubularHttp.post($scope.serverMarkupUrl || 'api/reports/getmarkup', $scope.items).promise.then(function(data) {
                                    $scope.autoCode = window.URL.createObjectURL(new Blob([data], { type: "text/html" }));
                                }, function(error) {
                                    $scope.$emit('tbReporting_OnConnectionError', error);
                                });
                            };
                        }
                    ]
                };
            }
        ]).config([
            '$sceDelegateProvider', function($sceDelegateProvider) {
                // We need to allow blobs to run
                $sceDelegateProvider.resourceUrlWhitelist(['self', 'blob:**']);
            }
        ]);
})();