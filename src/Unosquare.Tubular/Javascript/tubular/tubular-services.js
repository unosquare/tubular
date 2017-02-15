(function(angular, saveAs) {
    'use strict';

    function getColumns(gridScope) {
        return gridScope.columns.map(function (c) { return c.Label; });
    }

    function getColumnsVisibility(gridScope) {
        return gridScope.columns
            .map(function (c) { return c.Visible; });
    }

    function exportToCsv(filename, header, rows, visibility) {
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

                if (row[j] instanceof Date) {
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

        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        // Add "\uFEFF" (UTF-8 BOM)
        var blob = new Blob(['\uFEFF' + csvFile], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    }

    /**
     * @ngdoc module
     * @name tubular.services
     * 
     * @description
     * Tubular Services module. 
     * It contains common services like HTTP client, filtering and printing services.
     */
    angular.module('tubular.services', ['ui.bootstrap', 'LocalStorageModule'])
        
        /**
         * @ngdoc factory
         * @name tubularGridExportService
         *
         * @description
         * Use `tubularGridExportService` to export your `tbGrid` to a CSV file.
         */
        .factory('tubularGridExportService', function () {
            return {
                exportAllGridToCsv: function(filename, gridScope) {
                    var columns = getColumns(gridScope);
                    var visibility = getColumnsVisibility(gridScope);

                    gridScope.getFullDataSource(function(data) {
                        exportToCsv(filename, columns, data, visibility);
                    });
                },

                exportGridToCsv: function(filename, gridScope) {
                    var columns = getColumns(gridScope);
                    var visibility = getColumnsVisibility(gridScope);

                    gridScope.currentRequest = {};
                    exportToCsv(filename, columns, gridScope.dataSource.Payload, visibility);
                    gridScope.currentRequest = null;
                }
            };
        })
       
})(angular, saveAs);