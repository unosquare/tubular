(function(angular) {
    'use strict';

    function getColumns(gridScope) {
        return gridScope.columns.map(c => c.Label);
    }

    function getColumnsVisibility(gridScope) {
        return gridScope.columns.map(c => c.Visible);
    }

    function exportToCsv(header, rows, visibility) {
        const processRow = row => {
            if (angular.isObject(row)) {
                row = Object.keys(row).map(key => row[key]);
            }

            let finalVal = '';
            for (let j = 0; j < row.length; j++) {
                if (!visibility[j]) {
                    continue;
                }

                let innerValue = row[j] == null ? '' : row[j].toString();

                if (angular.isDate(row[j])) {
                    innerValue = row[j].toLocaleString();
                }

                let result = innerValue.replace(/"/g, '""');

                if (result.search(/("|,|\n)/g) >= 0) {
                    result = `"${  result  }"`;
                }

                if (j > 0) {
                    finalVal += ',';
                }

                finalVal += result;
            }

            return `${finalVal  }\n`;
        };

        let csvFile = '';

        if (header.length > 0) {
            csvFile += processRow(header);
        }

        angular.forEach(rows, row => csvFile += processRow(row));

        // Add "\uFEFF" (UTF-8 BOM)
        return new Blob([`\uFEFF${  csvFile}`], { type: 'text/csv;charset=utf-8;' });
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
                const service = this;

                service.saveFile = (filename, blob) => {
                    const fileURL = $window.URL.createObjectURL(blob);
                    const downloadLink = angular.element('<a></a>');

                    downloadLink.attr('href', fileURL);
                    downloadLink.attr('download', filename);
                    downloadLink.attr('target', '_self');
                    downloadLink[0].click();

                    $window.URL.revokeObjectURL(fileURL);
                };

                return {
                    exportAllGridToCsv: (filename, gridScope) => {
                        const columns = getColumns(gridScope);
                        const visibility = getColumnsVisibility(gridScope);

                        gridScope.getFullDataSource()
                            .then(data => service.saveFile(filename, exportToCsv(columns, data, visibility)));
                    },

                    exportGridToCsv: (filename, gridScope) => {
                        if (!gridScope.dataSource || !gridScope.dataSource.Payload) {
                            return;
                        }

                        const columns = getColumns(gridScope);
                        const visibility = getColumnsVisibility(gridScope);

                        gridScope.currentRequest = {};
                        service.saveFile(filename, exportToCsv(columns, gridScope.dataSource.Payload, visibility));
                        gridScope.currentRequest = null;
                    },

                    printGrid: (component, printCss, title) => {
                        component.getFullDataSource().then(data => {
                            const tableHtml = `<table class="table table-bordered table-striped"><thead><tr>${
                                 component.columns
                                .filter(c => c.Visible)
                                .reduce((prev, el) => `${prev  }<th>${  el.Label || el.Name  }</th>`, '')
                                 }</tr></thead>`
                                + `<tbody>${
                                 data.map(row => {
                                    if (angular.isObject(row)) {
                                        row = Object.keys(row).map(key => row[key]);
                                    }

                                    return `<tr>${  row.map((cell, index) => {
                                        if (angular.isDefined(component.columns[index]) &&
                                            !component.columns[index].Visible) {
                                            return '';
                                        }

                                        return `<td>${  cell  }</td>`;
                                    }).join(' ')  }</tr>`;
                                }).join('  ')
                                 }</tbody>`
                                + '</table>';

                            const popup = $window.open('about:blank', 'Print', 'menubar=0,location=0,height=500,width=800');
                            popup.document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />');

                            if (printCss !== '') {
                                popup.document.write(`<link rel="stylesheet" href="${  printCss  }" />`);
                            }

                            popup.document.write('<body onload="window.print();">');
                            popup.document.write(`<h1>${  title  }</h1>`);
                            popup.document.write(tableHtml);
                            popup.document.write('</body>');
                            popup.document.close();
                        });
                    }
                };
            }]);
})(angular);