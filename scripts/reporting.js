(function() {
    'use strict';

    angular.module('app.reporting', ['tubular.services'])
        .controller("reportingCtrl",
            function ($scope, $routeParams, tubularHttp, localStorageService) {
                $scope.items = [];
                $scope.reports = localStorageService.get('reports') || [];
                tubularHttp.setRequireAuthentication(false);

                tubularHttp.get('http://tubular.azurewebsites.net/api/reports/datasources').promise.then(function (data) {
                    $scope.dataSources = data.DataSources;
                    $scope.aggregationFunctions = data.AggregationFunctions;
                    $scope.types = data.Types;
                });

                $scope.addItem = function () {
                    $scope.items.push({
                        DataSource: $scope.Model.DataSource.Name,
                        Column: $scope.Model.Column.Name,
                        DataType: $scope.Model.DataType,
                        Aggregation: $scope.Model.AggregationFunction,
                        Filter: $scope.Model.Filter
                    });

                    $scope.Model.Filter = '';
                };

                $scope.removeItem = function (item) {
                    var index = $scope.items.indexOf(item);
                    if (index > -1) {
                        $scope.items.splice(index, 1);
                    }
                };

                $scope.moveItem = function (from, to) {
                    $scope.items.splice(to, 0, $scope.items.splice(from, 1)[0]);
                }

                $scope.up = function (item) {
                    var oldIndex = $scope.items.indexOf(item);

                    $scope.moveItem(oldIndex, oldIndex - 1);
                };

                $scope.down = function (item) {
                    var oldIndex = $scope.items.indexOf(item);

                    $scope.moveItem(oldIndex, oldIndex + 1);
                };

                $scope.saveReport = function () {
                    $scope.reports.push({ Name: $scope.Model.CurrentReport, Data: $scope.items });
                    localStorageService.set('reports', $scope.reports);

                    toastr.success("Report saved");
                };

                $scope.removeReport = function () {
                    var report = $scope.reports.filter(function (el) { return el.Name === $scope.Model.CurrentReport.Name; });

                    if (report && report[0]) {
                        var index = $scope.reports.indexOf(report[0]);

                        if (index > -1) {
                            $scope.reports.splice(index, 1);
                            localStorageService.set('reports', $scope.reports);
                            toastr.success("Report removed");
                        }
                    } else {
                        toastr.error("Unknown report");
                    }
                };

                $scope.loadReport = function () {
                    var report = $scope.reports.filter(function (el) { return el.Name === $scope.Model.CurrentReport.Name; });

                    if (report && report[0]) {
                        $scope.items = report[0].Data;
                    } else {
                        toastr.error("Unknown report");
                    }
                };

                $scope.isValid = function() {
                    return $scope.items.length > 0;
                };

                $scope.generate = function () {
                    tubularHttp.setRequireAuthentication(false);
                    tubularHttp.post('http://tubular.azurewebsites.net/api/reports/getmarkup', $scope.items).promise.then(function (data) {
                        $scope.autoCode = window.URL.createObjectURL(new Blob([data], { type: "text/html" }));
                    });
                };
            });
})();