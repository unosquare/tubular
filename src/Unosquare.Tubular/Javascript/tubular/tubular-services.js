(function(angular) {
    'use strict';

    function getColumns(gridScope) {
        return gridScope.columns
            .map(function (c) { return c.Label; });
    }

    function getColumnsVisibility(gridScope) {
        return gridScope.columns
            .map(function (c) { return c.Visible; });
    }

    function exportToCsv(header, rows, visibility) {
        var processRow = function (row) {
            if (angular.isObject(row)) {
                row = Object.keys(row).map(function (key) { return row[key]; });
            }

            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                if (!visibility[j]) {
                    continue;
                }

                var innerValue = row[j] == null ? '' : row[j].toString();

                if (angular.isDate(row[j])) {
                    innerValue = row[j].toLocaleString();
                }

                var result = innerValue.replace(/"/g, '""');

                if (result.search(/("|,|\n)/g) >= 0) {
                    result = '"' + result + '"';
                }

                if (j > 0) {
                    finalVal += ',';
                }

                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';

        if (header.length > 0) {
            csvFile += processRow(header);
        }

        angular.forEach(rows,
            function(row) {
                csvFile += processRow(row);
            });

        // Add "\uFEFF" (UTF-8 BOM)
        return new Blob(['\uFEFF' + csvFile], { type: 'text/csv;charset=utf-8;' });
    }

    /**
     * @ngdoc module
     * @name tubular.services
     * 
     * @description
     * Tubular Services module. 
     * It contains common services like HTTP client, filtering and printing services.
     */
    angular.module('tubular.services', ['ui.bootstrap'])

        /**
         * @ngdoc factory
         * @name tubularGridExportService
         *
         * @description
         * Use `tubularGridExportService` to export your `tbGrid` to a CSV file.
         */
        .factory('tubularGridExportService', ['$window',
            function($window) {
                var service = this;

                service.saveFile = function(filename, blob) {
                    var fileURL = $window.URL.createObjectURL(blob);
                    var downloadLink = angular.element('<a></a>');

                    downloadLink.attr('href', fileURL);
                    downloadLink.attr('download', filename);
                    downloadLink.attr('target', '_self');
                    downloadLink[0].click();

                    $window.URL.revokeObjectURL(fileURL);
                };

                return {
                    exportAllGridToCsv: function(filename, gridScope) {
                        var columns = getColumns(gridScope);
                        var visibility = getColumnsVisibility(gridScope);

                        gridScope.getFullDataSource.then(function (data) {
                            service.saveFile(filename, exportToCsv(columns, data, visibility));
                        });
                    },

                    exportGridToCsv: function (filename, gridScope) {
                        if (!gridScope.dataSource || !gridScope.dataSource.Payload) return;

                        var columns = getColumns(gridScope);
                        var visibility = getColumnsVisibility(gridScope);

                        gridScope.currentRequest = {};
                        service.saveFile(filename, exportToCsv(columns, gridScope.dataSource.Payload, visibility));
                        gridScope.currentRequest = null;
                    }
                };
            }]);
})(angular);