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
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         */
        .component('tbChartjs', {
            template: '<div class="tubular-chart">' +
                '<canvas class="chart chart-base" chart-type="$ctrl.chartType" chart-data="$ctrl.data" chart-labels="$ctrl.labels" ' +
                ' chart-legend="{{$ctrl.showLegend}}" chart-series="$ctrl.series" chart-click="$ctrl.onClick">' +
                '</canvas>' +
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
                onClick: '=?'
            },
            controller: [
                '$scope', 'tubularHttp',
                function ($scope, tubularHttp) {
                    var $ctrl = this;

                    $ctrl.dataService = tubularHttp.getDataService($ctrl.dataServiceName);
                    $ctrl.showLegend = angular.isUndefined($ctrl.showLegend) ? true : $ctrl.showLegend;
                    $ctrl.chartType = $ctrl.chartType || 'Line';

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
                }
            ]
        });
})(window.angular);