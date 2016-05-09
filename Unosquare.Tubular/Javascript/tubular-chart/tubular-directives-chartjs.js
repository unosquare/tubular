(function (angular) {
    'use strict';

    angular.module('tubular-chart.directives', ['tubular.services', 'chart.js'])
        /**
         * @ngdoc component
         * @name tbChartjs
         *
         * @description
         * The `tbChartjs` component is the base to create any ChartJs component.
         *  
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} chartName Defines the chart name.
         * @param {string} chartType Defines the chart type.
         * @param {string} emptyMessage Defines the empty dataset message.
         * @param {string} errorMessage Defines the error loading dataset message.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {bool} showLegend Set if show the chart legend, default true.
         */
        .component('tbChartjs', {
            template: '<div class="tubular-chart">' +
                '<canvas class="chart chart-base" chart-type="$ctrl.chartType" chart-data="$ctrl.data" chart-labels="$ctrl.labels" ' +
                ' chart-series="$ctrl.series" chart-click="$ctrl.onClick" chart-options="$ctrl.options">' +
                '</canvas>' +
                '<ul ng-show="$ctrl.showLegend" class="pie-legend">' +
                '<li ng-repeat="item in $ctrl.legends"><span style="background-color: {{item.color}}"></span>{{item.label}}</li>' +
                '</ul>' +
                '<div class="alert alert-info" ng-show="$ctrl.isEmpty">{{$ctrl.emptyMessage}}</div>' +
                '<div class="alert alert-warning" ng-show="$ctrl.hasError">{{$ctrl.errorMessage}}</div>' +
                '</div>',
            bindings: {
                serverUrl: '@',
                requireAuthentication: '=?',
                showLegend: '@?',
                name: '@?chartName',
                chartType: '@?',
                emptyMessage: '@?',
                errorMessage: '@?',
                onLoad: '=?',
                onClick: '=?',
                data: '=?',
                labels: '=?',
                series: '=?',
                options: '=?'
            },
            controller: [
                '$scope', 'tubularHttp',
                function ($scope, tubularHttp) {
                    var $ctrl = this;

                    $ctrl.dataService = tubularHttp.getDataService($ctrl.dataServiceName);
                    $ctrl.showLegend = angular.isUndefined($ctrl.showLegend) ? true : $ctrl.showLegend;
                    $ctrl.chartType = $ctrl.chartType || 'line';

                    // Setup require authentication
                    $ctrl.requireAuthentication = angular.isUndefined($ctrl.requireAuthentication) ? true : $ctrl.requireAuthentication;

                    $ctrl.loadData = function () {
                        tubularHttp.setRequireAuthentication($ctrl.requireAuthentication);

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

                            $ctrl.data = data.Data;
                            $ctrl.series = data.Series;
                            $ctrl.labels = data.Labels;

                            if ($ctrl.onLoad) {
                                $ctrl.onLoad($ctrl.options, data);
                            }
                        }, function (error) {
                            $scope.$emit('tbChart_OnConnectionError', error);
                        });
                    };

                    $scope.$watch('$ctrl.serverUrl', function (val) {
                        if (angular.isDefined(val) && val != null) {
                            $ctrl.loadData();
                        }
                    });

                    $scope.$on('chart-create', function (evt, chart) {
                        if ($ctrl.chartType == 'pie' || $ctrl.chartType == 'doughnut') {
                            $ctrl.legends = chart.chart.config.data.labels.map(function(v, i) {
                                return {
                                    label: v,
                                    color: chart.chart.config.data.datasets[0].backgroundColor[i]
                                };
                            });
                        } else {
                            $ctrl.legends = chart.chart.config.data.datasets.map(function (v) {
                                return {
                                    label: v.label,
                                    color: v.borderColor
                                }
                            });
                        }
                    });
                }
            ]
        });
})(window.angular);