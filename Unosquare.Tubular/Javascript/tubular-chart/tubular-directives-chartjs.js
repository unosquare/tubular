(function () {
    'use strict';

    angular.module('tubular-chart.directives', ['tubular.services','chart.js'])
        /**
         * @ngdoc directive
         * @name tbChartjs
         * @restrict E
         *
         * @description
         * The `tbChartjs` directive is the base to create any ChartJs component.
         * 
         * @scope
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} chartName Defines the chart name.
         * @param {string} serviceName Define Data service (name) to retrieve data, defaults `tubularHttp`.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         */
        .directive('tbChartjs', [
            function () {
                return {
                    template: '<div class="tubular-chart"><canvas class="chart {{chartType}}" data="data" labels="labels" ' +
                        ' legend="showLegend" series="series">' +
                        '</canvas></div>',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        serverUrl: '@',
                        dataServiceName: '@?serviceName',
                        requireAuthentication: '=?',
                        showLegend: '=?',
                        name: '@?charName',
                        chartType: '@?'
                    },
                    controller: [
                        '$scope', 'tubularHttp',
                        function ($scope, tubularHttp) {
                            $scope.tubularDirective = 'tubular-chart';
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);
                            $scope.showLegend = $scope.showLegend || true;
                            $scope.chartType = $scope.chartType || 'chart-line';

                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;
                            
                            $scope.loadData = function () {
                                tubularHttp.setRequireAuthentication($scope.requireAuthentication);

                                tubularHttp.get($scope.serverUrl).promise.then(function (data) {
                                    $scope.data = data.Data;
                                    $scope.series = data.Series;
                                    $scope.labels = data.Labels;
                                }, function (error) {
                                    $scope.$emit('tbChart_OnConnectionError', error);
                                });
                            };

                            $scope.$watch('serverUrl', function (val) {
                                if (angular.isDefined(val) && val != null) {
                                    $scope.loadData();
                                }
                            });
                        }
                    ]
                };
            }
        ]);
})();