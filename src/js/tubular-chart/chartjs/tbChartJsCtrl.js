(function (angular) {
    'use strict';

    angular.module('tubular-chart.directives')
        .controller('tbChartJsController',
        [
            '$scope',
            'tubularHttp',
            function (
                $scope,
                tubularHttp) {
                var $ctrl = this;

                $ctrl.dataService = tubularHttp.getDataService($ctrl.dataServiceName);
                $ctrl.showLegend = angular.isUndefined($ctrl.showLegend) ? true : $ctrl.showLegend;
                $ctrl.chartType = $ctrl.chartType || 'line';

                // Setup require authentication
                $ctrl.requireAuthentication = angular.isUndefined($ctrl.requireAuthentication)
                    ? true
                    : $ctrl.requireAuthentication;

                $ctrl.loadData = function() {
                    // TODO: Set requireAuthentication
                    tubularHttp.get($ctrl.serverUrl)
                        .then(function(data) {
                                if (!data || !data.Data || data.Data.length === 0) {
                                    $ctrl.isEmpty = true;
                                    if (!$ctrl.options) $ctrl.options = {};
                                    $ctrl.options.series = [{ data: [] }];

                                    if ($ctrl.onLoad) {
                                        $ctrl.onLoad($ctrl.options, {});
                                    }

                                    return;
                                }

                                $ctrl.isEmpty = false;

                                $ctrl.data = data.Data;
                                $ctrl.series = data.Series;
                                $ctrl.labels = data.Labels;

                                if ($ctrl.onLoad) {
                                    $ctrl.onLoad($ctrl.options, data);
                                }
                            },
                            function(error) {
                                $scope.$emit('tbChart_OnConnectionError', error);
                            });
                };

                $scope.$watch('$ctrl.serverUrl',
                    function(val) {
                        if (angular.isDefined(val) && val != null) {
                            $ctrl.loadData();
                        }
                    });

                $scope.$on('chart-create',
                    function(evt, chart) {
                        if ($ctrl.chartType === 'pie' || $ctrl.chartType === 'doughnut') {
                            $ctrl.legends = chart.chart.config.data.labels.map(function(v, i) {
                                return {
                                    label: v,
                                    color: chart.chart.config.data.datasets[0].backgroundColor[i]
                                };
                            });
                        } else {
                            $ctrl.legends = chart.chart.config.data.datasets.map(function(v) {
                                return {
                                    label: v.label,
                                    color: v.borderColor
                                };
                            });
                        }
                    });
            }
        ]);
})(angular);