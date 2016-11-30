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

(function (factory) {
    'use strict';
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(
          typeof angular !== 'undefined' ? angular : require('angular'),
          typeof Chart !== 'undefined' ? Chart : require('chart.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['angular', 'chart'], factory);
    } else {
        // Browser globals
        if (typeof angular === 'undefined' || typeof Chart === 'undefined') throw new Error('Chart.js library needs to included, ' +
          'see http://jtblin.github.io/angular-chart.js/');
        factory(angular, Chart);
    }
}(function (angular, Chart) {
    'use strict';

    Chart.defaults.global.multiTooltipTemplate = '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value %>';
    Chart.defaults.global.elements.line.borderWidth = 2;
    Chart.defaults.global.elements.rectangle.borderWidth = 2;
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.colors = [
      '#97BBCD', // blue
      '#DCDCDC', // light grey
      '#F7464A', // red
      '#46BFBD', // green
      '#FDB45C', // yellow
      '#949FB1', // grey
      '#4D5360'  // dark grey
    ];

    var usingExcanvas = typeof window.G_vmlCanvasManager === 'object' &&
      window.G_vmlCanvasManager !== null &&
      typeof window.G_vmlCanvasManager.initElement === 'function';

    if (usingExcanvas) Chart.defaults.global.animation = false;

    return angular.module('chart.js', [])
      .provider('ChartJs', ChartJsProvider)
      .factory('ChartJsFactory', ['ChartJs', '$timeout', ChartJsFactory])
      .directive('chartBase', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory(); }])
      .directive('chartLine', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('line'); }])
      .directive('chartBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('bar'); }])
      .directive('chartRadar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('radar'); }])
      .directive('chartDoughnut', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('doughnut'); }])
      .directive('chartPie', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('pie'); }])
      .directive('chartPolarArea', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('polarArea'); }]);

    /**
     * Wrapper for chart.js
     * Allows configuring chart js using the provider
     *
     * angular.module('myModule', ['chart.js']).config(function(ChartJsProvider) {
     *   ChartJsProvider.setOptions({ responsive: true });
     *   ChartJsProvider.setOptions('Line', { responsive: false });
     * })))
     */
    function ChartJsProvider() {
        var options = {};
        var ChartJs = {
            Chart: Chart,
            getOptions: function (type) {
                var typeOptions = type && options[type] || {};
                return angular.extend({}, options, typeOptions);
            }
        };

        /**
         * Allow to set global options during configuration
         */
        this.setOptions = function (type, customOptions) {
            // If no type was specified set option for the global object
            if (!customOptions) {
                customOptions = type;
                options = angular.extend(options, customOptions);
                return;
            }
            // Set options for the specific chart
            options[type] = angular.extend(options[type] || {}, customOptions);
        };

        this.$get = function () {
            return ChartJs;
        };
    }

    function ChartJsFactory(ChartJs, $timeout) {
        return function chart(type) {
            return {
                restrict: 'CA',
                scope: {
                    chartGetColor: '=?',
                    chartType: '=',
                    chartData: '=?',
                    chartLabels: '=?',
                    chartOptions: '=?',
                    chartSeries: '=?',
                    chartColors: '=?',
                    chartClick: '=?',
                    chartHover: '=?',
                    chartYAxes: '=?'
                },
                link: function (scope, elem/*, attrs */) {
                    var chart;

                    if (usingExcanvas) window.G_vmlCanvasManager.initElement(elem[0]);

                    // Order of setting "watch" matter

                    scope.$watch('chartData', function (newVal, oldVal) {
                        if (!newVal || !newVal.length || (Array.isArray(newVal[0]) && !newVal[0].length)) {
                            destroyChart(chart, scope);
                            return;
                        }
                        var chartType = type || scope.chartType;
                        if (!chartType) return;

                        if (chart && canUpdateChart(newVal, oldVal))
                            return updateChart(chart, newVal, scope);

                        createChart(chartType);
                    }, true);

                    scope.$watch('chartSeries', resetChart, true);
                    scope.$watch('chartLabels', resetChart, true);
                    scope.$watch('chartOptions', resetChart, true);
                    scope.$watch('chartColors', resetChart, true);

                    scope.$watch('chartType', function (newVal, oldVal) {
                        if (isEmpty(newVal)) return;
                        if (angular.equals(newVal, oldVal)) return;
                        createChart(newVal);
                    });

                    scope.$on('$destroy', function () {
                        destroyChart(chart, scope);
                    });

                    function resetChart(newVal, oldVal) {
                        if (isEmpty(newVal)) return;
                        if (angular.equals(newVal, oldVal)) return;
                        var chartType = type || scope.chartType;
                        if (!chartType) return;

                        // chart.update() doesn't work for series and labels
                        // so we have to re-create the chart entirely
                        createChart(chartType);
                    }

                    function createChart(type) {
                        // TODO: check parent?
                        if (isResponsive(type, scope) && elem[0].clientHeight === 0) {
                            return $timeout(function () {
                                createChart(type);
                            }, 50, false);
                        }
                        if (!scope.chartData || !scope.chartData.length) return;
                        scope.chartGetColor = typeof scope.chartGetColor === 'function' ? scope.chartGetColor : getRandomColor;
                        var colors = getColors(type, scope);
                        var cvs = elem[0], ctx = cvs.getContext('2d');
                        var data = Array.isArray(scope.chartData[0]) ?
                          getDataSets(scope.chartLabels, scope.chartData, scope.chartSeries || [], colors, scope.chartYAxes) :
                          getData(scope.chartLabels, scope.chartData, colors);

                        var options = angular.extend({}, ChartJs.getOptions(type), scope.chartOptions);
                        // Destroy old chart if it exists to avoid ghost charts issue
                        // https://github.com/jtblin/angular-chart.js/issues/187
                        destroyChart(chart, scope);

                        chart = new ChartJs.Chart(ctx, {
                            type: type,
                            data: data,
                            options: options
                        });
                        scope.$emit('chart-create', chart);

                        // Bind events
                        cvs.onclick = scope.chartClick ? getEventHandler(scope, chart, 'chartClick', false) : angular.noop;
                        cvs.onmousemove = scope.chartHover ? getEventHandler(scope, chart, 'chartHover', true) : angular.noop;
                    }
                }
            };
        };

        function canUpdateChart(newVal, oldVal) {
            if (newVal && oldVal && newVal.length && oldVal.length) {
                return Array.isArray(newVal[0]) ?
                newVal.length === oldVal.length && newVal.every(function (element, index) {
                    return element.length === oldVal[index].length;
                }) :
                  oldVal.reduce(sum, 0) > 0 ? newVal.length === oldVal.length : false;
            }
            return false;
        }

        function sum(carry, val) {
            return carry + val;
        }

        function getEventHandler(scope, chart, action, triggerOnlyOnChange) {
            var lastState = null;
            return function (evt) {
                var atEvent = chart.getElementsAtEvent || chart.getPointsAtEvent;
                if (atEvent) {
                    var activePoints = atEvent.call(chart, evt);
                    if (triggerOnlyOnChange === false || angular.equals(lastState, activePoints) === false) {
                        lastState = activePoints;
                        scope[action](activePoints, evt);
                    }
                }
            };
        }

        function getColors(type, scope) {
            var colors = angular.copy(scope.chartColors ||
              ChartJs.getOptions(type).chartColors ||
              Chart.defaults.global.colors
            );
            var notEnoughColors = colors.length < scope.chartData.length;
            while (colors.length < scope.chartData.length) {
                colors.push(scope.chartGetColor());
            }
            // mutate colors in this case as we don't want
            // the colors to change on each refresh
            if (notEnoughColors) scope.chartColors = colors;
            return colors.map(convertColor);
        }

        function convertColor(color) {
            if (typeof color === 'object' && color !== null) return color;
            if (typeof color === 'string' && color[0] === '#') return getColor(hexToRgb(color.substr(1)));
            return getRandomColor();
        }

        function getRandomColor() {
            var color = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
            return getColor(color);
        }

        function getColor(color) {
            return {
                backgroundColor: rgba(color, 0.2),
                borderColor: rgba(color, 1),
                pointBackgroundColor: rgba(color, 1),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: rgba(color, 0.8)
            };
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function rgba(color, alpha) {
            if (usingExcanvas) {
                // rgba not supported by IE8
                return 'rgb(' + color.join(',') + ')';
            } else {
                return 'rgba(' + color.concat(alpha).join(',') + ')';
            }
        }

        // Credit: http://stackoverflow.com/a/11508164/1190235
        function hexToRgb(hex) {
            var bigint = parseInt(hex, 16),
              r = (bigint >> 16) & 255,
              g = (bigint >> 8) & 255,
              b = bigint & 255;

            return [r, g, b];
        }

        function getDataSets(labels, data, series, colors, yaxis) {
            return {
                labels: labels,
                datasets: data.map(function (item, i) {
                    var dataset = angular.extend({}, colors[i], {
                        label: series[i],
                        data: item
                    });
                    if (yaxis) {
                        dataset.yAxisID = yaxis[i];
                    }
                    return dataset;
                })
            };
        }

        function getData(labels, data, colors) {
            return {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.map(function (color) {
                        return color.pointBackgroundColor;
                    }),
                    hoverBackgroundColor: colors.map(function (color) {
                        return color.backgroundColor;
                    })
                }]
            };
        }

        function updateChart(chart, values, scope) {
            if (Array.isArray(scope.chartData[0])) {
                chart.data.datasets.forEach(function (dataset, i) {
                    dataset.data = values[i];
                });
            } else {
                chart.data.datasets[0].data = values;
            }

            chart.update();
            scope.$emit('chart-update', chart);
        }

        function isEmpty(value) {
            return !value ||
              (Array.isArray(value) && !value.length) ||
              (typeof value === 'object' && !Object.keys(value).length);
        }

        function isResponsive(type, scope) {
            var options = angular.extend({}, Chart.defaults.global, ChartJs.getOptions(type), scope.chartOptions);
            return options.responsive;
        }

        function destroyChart(chart, scope) {
            if (!chart) return;
            chart.destroy();
            scope.$emit('chart-destroy', chart);
        }
    }
}));