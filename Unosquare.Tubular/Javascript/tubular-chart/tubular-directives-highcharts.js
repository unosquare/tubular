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
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         */
        .directive('tbHighcharts', [
            function() {
                return {
                    template: '<div class="tubular-chart"><highchart config="options">' +
                        '</canvas></div>',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        serverUrl: '@',
                        title: '@?',
                        requireAuthentication: '=?',
                        name: '@?chartName',
                        chartType: '@?'
                    },
                    controller: [
                        '$scope', 'tubularHttp',
                        function($scope, tubularHttp) {
                            $scope.tubularDirective = 'tubular-chart';
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);
                            $scope.showLegend = $scope.showLegend || true;
                            $scope.chartType = $scope.chartType || 'line';
                            // TODO: Watch chartType?

                            $scope.options = {
                                options: { chart: { type: $scope.chartType } },
                                title: { text: $scope.title || 'Chart' },
                                xAxis: {
                                    categories: []
                                },
                                yAxis: {},
                                series: []
                            };

                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;

                            $scope.loadData = function() {
                                tubularHttp.setRequireAuthentication($scope.requireAuthentication);

                                tubularHttp.get($scope.serverUrl).promise.then(function(data) {
                                    if (data.Series) {
                                        $scope.options.xAxis.categories = data.Labels;
                                        $scope.options.series = data.Series.map(function(el, ix) {
                                            return {
                                                name: el,
                                                data: data.Data[ix]
                                            };
                                        });
                                    } else {
                                        var uniqueSerie = data.Labels.map(function (el, ix) {
                                            return {
                                                name: el,
                                                y: data.Data[ix]
                                            };
                                        });

                                        $scope.options.series = [{ name: data.SerieName || 'Serie 1', data: uniqueSerie }];
                                    }
                                }, function(error) {
                                    $scope.$emit('tbChart_OnConnectionError', error);
                                });
                            };

                            $scope.$watch('serverUrl', function(val) {
                                if (angular.isDefined(val) && val != null) {
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