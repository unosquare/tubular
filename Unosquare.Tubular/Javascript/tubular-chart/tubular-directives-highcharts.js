(function() {
    'use strict';

    angular.module('tubular-hchart.directives', ['tubular.services', 'highcharts-ng'])
        /**
         * @ngdoc directive
         * @name tbHighcharts
         * @restrict E
         *
         * @description
         * The `tbHighcharts` directive is the base to create any Highcharts component.
         * 
         * @scope
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} chartName Defines the chart name.
         * @param {string} chartType Defines the chart type.
         * @param {string} title Defines the title.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {function} onLoad Defines a method to run in chart data load
         * @param {string} emptyMessage The empty message.
         * @param {string} errorMessage The error message.
         * @param {object} options The Highcharts options method.
         */
        .directive('tbHighcharts', [
            function() {
                return {
                    template: '<div class="tubular-chart">' +
                        '<highchart config="options" ng-hide="isEmpty || hasError">' +
                        '</highchart>' +
                        '<div class="alert alert-info" ng-show="isEmpty">{{emptyMessage}}</div>' +
                        '<div class="alert alert-warning" ng-show="hasError">{{errorMessage}}</div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        serverUrl: '@',
                        title: '@?',
                        requireAuthentication: '=?',
                        name: '@?chartName',
                        chartType: '@?',
                        emptyMessage: '@?',
                        errorMessage: '@?',
                        onLoad: '=?',
                        options: '=?'
                    },
                    controller: [
                        '$scope', 'tubularHttp', '$timeout',
                        function($scope, tubularHttp, $timeout) {
                            $scope.tubularDirective = 'tubular-chart';
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);
                            $scope.showLegend = $scope.showLegend || true;
                            $scope.chartType = $scope.chartType || 'line';

                            $scope.options = angular.extend({}, $scope.options, {
                                options: { chart: { type: $scope.chartType } },
                                title: { text: $scope.title || '' },
                                xAxis: {
                                    categories: []
                                },
                                yAxis: {},
                                series: []
                            });


                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;

                            $scope.loadData = function() {
                                tubularHttp.setRequireAuthentication($scope.requireAuthentication);
                                $scope.hasError = false;

                                tubularHttp.get($scope.serverUrl).promise.then(function(data) {
                                    if (!data || !data.Data || data.Data.length === 0) {
                                        $scope.isEmpty = true;
                                        $scope.options.series = [{ data: [] }];

                                        if ($scope.onLoad) {
                                            $scope.onLoad($scope.options, {});
                                        }

                                        return;
                                    }

                                    $scope.isEmpty = false;

                                    if (data.Series) {
                                        $scope.options.xAxis.categories = data.Labels;
                                        $scope.options.series = data.Series.map(function(el, ix) {
                                            return {
                                                name: el,
                                                data: data.Data[ix]
                                            };
                                        });
                                    } else {
                                        var uniqueSerie = data.Labels.map(function(el, ix) {
                                            return {
                                                name: el,
                                                y: data.Data[ix]
                                            };
                                        });

                                        $scope.options.series = [{ name: data.SerieName || '', data: uniqueSerie, showInLegend: (data.SerieName || '') != '' }];
                                    }

                                    if ($scope.onLoad) {
                                        $timeout(function() {
                                            $scope.onLoad($scope.options, {}, $scope.options.getHighcharts().series);
                                        }, 100);

                                        $scope.onLoad($scope.options, {}, null);
                                    }
                                }, function(error) {
                                    $scope.$emit('tbChart_OnConnectionError', error);
                                    $scope.hasError = true;
                                });
                            };

                            $scope.$watch('serverUrl', function(val) {
                                if (angular.isDefined(val) && val != null && val != '') {
                                    $scope.loadData();
                                }
                            });

                            $scope.$watch('chartType', function(val) {
                                if (angular.isDefined(val) && val != null) {
                                    $scope.options.options.chart.type = val;
                                }
                            });
                        }
                    ]
                };
            }
        ]);
})();