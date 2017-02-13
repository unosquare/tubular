(function (angular) {
    'use strict';

    angular.module('tubular-hchart.directives', ['tubular.services', 'highcharts-ng'])
        /**
         * @ngdoc component
         * @name tbHighcharts
         *
         * @description
         * The `tbHighcharts` component is the base to create any Highcharts component.
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
        .component('tbHighcharts', {
            template: '<div class="tubular-chart">' +
                '<highchart config="$ctrl.options" ng-hide="$ctrl.isEmpty || $ctrl.hasError">' +
                '</highchart>' +
                '<div class="alert alert-info" ng-show="$ctrl.isEmpty">{{$ctrl.emptyMessage}}</div>' +
                '<div class="alert alert-warning" ng-show="$ctrl.hasError">{{$ctrl.errorMessage}}</div>' +
                '</div>',
            bindings: {
                serverUrl: '@',
                title: '@?',
                requireAuthentication: '=?',
                name: '@?chartName',
                chartType: '@?',
                emptyMessage: '@?',
                errorMessage: '@?',
                onLoad: '=?',
                options: '=?',
                onClick: '=?'
            },
            controller: [
                '$scope', 'tubularHttp', '$timeout',
                function ($scope, tubularHttp, $timeout) {
                    var $ctrl = this;

                    $ctrl.dataService = tubularHttp.getDataService($ctrl.dataServiceName);
                    $ctrl.showLegend = angular.isUndefined($ctrl.showLegend) ? true : $ctrl.showLegend;
                    $ctrl.chartType = $ctrl.chartType || 'line';

                    $ctrl.options = angular.extend({}, $ctrl.options, {
                        options: {
                            chart: { type: $ctrl.chartType },
                            plotOptions: {
                                pie: {
                                    point: {
                                        events: {
                                            click: ($ctrl.onClick || angular.noop)
                                        }
                                    }
                                },
                                series: {
                                    point: {
                                        events: {
                                            click: ($ctrl.onClick || angular.noop)
                                        }
                                    }
                                }
                            }
                        },
                        title: { text: $ctrl.title || '' },
                        xAxis: {
                            categories: []
                        },
                        yAxis: {},
                        series: []
                    });

                    // Setup require authentication
                    $ctrl.requireAuthentication = angular.isUndefined($ctrl.requireAuthentication) ? true : $ctrl.requireAuthentication;

                    $ctrl.loadData = function () {
                        tubularHttp.setRequireAuthentication($ctrl.requireAuthentication);
                        $ctrl.hasError = false;

                        tubularHttp.get($ctrl.serverUrl).promise.then(function (data) {
                            if (!data || !data.Data || data.Data.length === 0) {
                                $ctrl.isEmpty = true;
                                $ctrl.options.series = [{ data: [] }];

                                if ($ctrl.onLoad) {
                                    $ctrl.onLoad($ctrl.options, {});
                                }

                                return;
                            }

                            $ctrl.isEmpty = false;

                            if (data.Series) {
                                $ctrl.options.xAxis.categories = data.Labels;
                                $ctrl.options.series = data.Series.map(function (el, ix) {
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

                                $ctrl.options.series = [{ name: data.SerieName || '', data: uniqueSerie, showInLegend: (data.SerieName || '') !== '' }];
                            }

                            if ($ctrl.onLoad) {
                                $timeout(function () {
                                    $ctrl.onLoad($ctrl.options, {}, $ctrl.options.getHighcharts().series);
                                }, 100);

                                $ctrl.onLoad($ctrl.options, {}, null);
                            }
                        }, function (error) {
                            $scope.$emit('tbChart_OnConnectionError', error);
                            $ctrl.hasError = true;
                        });
                    };

                    $scope.$watch('$ctrl.serverUrl', function (val) {
                        if (angular.isDefined(val) && val != null && val !== '') {
                            $ctrl.loadData();
                        }
                    });

                    $scope.$watch('$ctrl.chartType', function (val) {
                        if (angular.isDefined(val) && val != null) {
                            $ctrl.options.options.chart.type = val;
                        }
                    });
                }
            ]
        });
})(angular);