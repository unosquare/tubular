/**
 * highcharts-ng
 * @version v1.0.0 - 2017-01-14
 * @link https://github.com/pablojim/highcharts-ng
 * @author Barry Fitzgerald <>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports){
  module.exports = 'highcharts-ng';
}

(function () {
  'use strict';
  /*global angular: false, Highcharts: false */


  angular.module('highcharts-ng', [])
    .component('highchart', {
        bindings: {
            config: '<',
            changeDetection: '<'
          },
          controller: HighChartNGController
    });

  HighChartNGController.$inject = ['$element', '$timeout'];

  function HighChartNGController($element, $timeout) {
    var seriesId = 0;
    var ctrl = this;
    var prevConfig = {};
    var mergedConfig = {};
    var detector = ctrl.changeDetection || angular.equals;
    this.$onInit = function() {
      ctrl.config.getChartObj = function(){
        return ctrl.chart;
      };
      prevConfig = angular.merge({}, ctrl.config);
      mergedConfig = getMergedOptions($element, ctrl.config, seriesId);
      ctrl.chart = new Highcharts[getChartType(mergedConfig)](mergedConfig);
    };

    this.$doCheck = function() {
      if(!detector(ctrl.config, prevConfig)) {
        prevConfig = angular.merge({}, ctrl.config);
        mergedConfig = getMergedOptions($element, ctrl.config, seriesId);
        var ids = ensureIds(mergedConfig.series, seriesId);
        if (mergedConfig.series) {
          //Remove any missing series
          for (var i = ctrl.chart.series.length - 1; i >= 0; i--) {
            var s = ctrl.chart.series[i];
            if (s.options.id !== 'highcharts-navigator-series' && ids.indexOf(s.options.id) < 0) {
              s.remove(false);
            }
          }
          // Add any new series
          angular.forEach(ctrl.config.series, function(s) {
            if (!ctrl.chart.get(s.id)) {
              ctrl.chart.addSeries(s);
            }
          });
        }
        ctrl.chart.update(mergedConfig, true);
      }
    };

    this.$onDestroy = function() {
        if (ctrl.chart) {
          try{
            ctrl.chart.destroy();
          }catch(ex){
            // fail silently as highcharts will throw exception if element doesn't exist
          }

          $timeout(function(){
            $element.remove();
          }, 0);
        }
      };
    }

  function getMergedOptions(element, config, seriesId) {
    var mergedOptions = {};

    var defaultOptions = {
      chart: {
        events: {}
      },
      title: {},
      subtitle: {},
      series: [],
      credits: {},
      plotOptions: {},
      navigator: {},
      xAxis: {
        events: {}
      },
      yAxis: {
        events: {}
      }
    };

    if (config) {
      //check all series and axis ids are set
      if(config.series) {
        ensureIds(config.series, seriesId);
      }

      mergedOptions = angular.merge(defaultOptions, config);
    } else {
      mergedOptions = defaultOptions;
    }
    mergedOptions.chart.renderTo = element[0];

    //check chart type is set
    return mergedOptions;
  }

  var chartTypeMap = {
    'stock': 'StockChart',
    'map':   'Map',
    'chart': 'Chart'
  };

  function getChartType(config) {
    if (config === undefined || config.chartType === undefined) return 'Chart';
    return chartTypeMap[('' + config.chartType).toLowerCase()];
  }

  function ensureIds(series, seriesId) {
    var ids = [];
    angular.forEach(series, function(s) {
      if (!angular.isDefined(s.id)) {
        s.id = 'series-' + seriesId++;
      }
      ids.push(s.id);
    });
    return ids;
  }

}());

(function (angular) {
    'use strict';

    angular.module('tubular-hchart.directives', ['tubular.services', 'highcharts-ng'])
        /**
         * @ngdoc component
         * @name tbHighcharts
         *
         * @description
         * The `tbHighcharts` component is the base to create any Highcharts component.
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} chartName Defines the chart name.
         * @param {string} chartType Defines the chart type.
         * @param {string} title Defines the title.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {function} onLoad Defines a method to run in chart data load
         * @param {string} emptyMessage The empty message.
         * @param {string} errorMessage The error message.
         * @param {object} options The Highcharts options method.
         */
        .component('tbHighcharts', {
            template: '<div class="tubular-chart">' +
                '<highchart config="$ctrl.options" ng-hide="$ctrl.isEmpty || $ctrl.hasError">' +
                '</highchart>' +
                '<div class="alert alert-info" ng-show="$ctrl.isEmpty">{{$ctrl.emptyMessage}}</div>' +
                '<div class="alert alert-warning" ng-show="$ctrl.hasError">{{$ctrl.errorMessage}}</div>' +
                '</div>',
            bindings: {
                serverUrl: '@',
                title: '@?',
                requireAuthentication: '=?',
                name: '@?chartName',
                chartType: '@?',
                emptyMessage: '@?',
                errorMessage: '@?',
                onLoad: '=?',
                options: '=?',
                onClick: '=?'
            },
            controller: [
                '$scope', 'tubularHttp', '$timeout',
                function ($scope, tubularHttp, $timeout) {
                    var $ctrl = this;

                    $ctrl.dataService = tubularHttp.getDataService($ctrl.dataServiceName);
                    $ctrl.showLegend = angular.isUndefined($ctrl.showLegend) ? true : $ctrl.showLegend;
                    $ctrl.chartType = $ctrl.chartType || 'line';

                    $ctrl.options = angular.extend({}, $ctrl.options, {
                        options: {
                            chart: { type: $ctrl.chartType },
                            plotOptions: {
                                pie: {
                                    point: {
                                        events: {
                                            click: ($ctrl.onClick || angular.noop)
                                        }
                                    }
                                },
                                series: {
                                    point: {
                                        events: {
                                            click: ($ctrl.onClick || angular.noop)
                                        }
                                    }
                                }
                            }
                        },
                        title: { text: $ctrl.title || '' },
                        xAxis: {
                            categories: []
                        },
                        yAxis: {},
                        series: []
                    });

                    // Setup require authentication
                    $ctrl.requireAuthentication = angular.isUndefined($ctrl.requireAuthentication) ? true : $ctrl.requireAuthentication;

                    $ctrl.loadData = function () {
                        tubularHttp.setRequireAuthentication($ctrl.requireAuthentication);
                        $ctrl.hasError = false;

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

                            if (data.Series) {
                                $ctrl.options.xAxis.categories = data.Labels;
                                $ctrl.options.series = data.Series.map(function (el, ix) {
                                    return {
                                        name: el,
                                        data: data.Data[ix]
                                    };
                                });
                            } else {
                                var uniqueSerie = data.Labels.map(function (el, ix) {
                                    return {
                                        name: el,
                                        y: data.Data[ix]
                                    };
                                });

                                $ctrl.options.series = [{ name: data.SerieName || '', data: uniqueSerie, showInLegend: (data.SerieName || '') !== '' }];
                            }

                            if ($ctrl.onLoad) {
                                $timeout(function () {
                                    $ctrl.onLoad($ctrl.options, {}, $ctrl.options.getHighcharts().series);
                                }, 100);

                                $ctrl.onLoad($ctrl.options, {}, null);
                            }
                        }, function (error) {
                            $scope.$emit('tbChart_OnConnectionError', error);
                            $ctrl.hasError = true;
                        });
                    };

                    $scope.$watch('$ctrl.serverUrl', function (val) {
                        if (angular.isDefined(val) && val != null && val != '') {
                            $ctrl.loadData();
                        }
                    });

                    $scope.$watch('$ctrl.chartType', function (val) {
                        if (angular.isDefined(val) && val != null) {
                            $ctrl.options.options.chart.type = val;
                        }
                    });
                }
            ]
        });
})(window.angular);