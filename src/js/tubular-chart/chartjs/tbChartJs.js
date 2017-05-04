((angular) => {
    'use strict';

    angular.module('tubular-chart.directives')
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
            templateUrl: 'tbChartJs.tpl.html',
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
            controller: 'tbChartJsController'
        });
})(angular);
