(function(angular){
angular.module('tubular-chart.directives').run(['$templateCache', function ($templateCache) {
  "use strict";
  $templateCache.put("tbChartJs.tpl.html",
    "<div class=tubular-chart><canvas class=\"chart chart-base\" chart-type=$ctrl.chartType chart-data=$ctrl.data chart-labels=$ctrl.labels chart-series=$ctrl.series chart-click=$ctrl.onClick chart-options=$ctrl.options></canvas><ul ng-show=$ctrl.showLegend class=pie-legend><li ng-repeat=\"item in $ctrl.legends\"><span style=\"background-color: {{item.color}}\"></span>{{item.label}}</li></ul><div class=\"alert alert-info\" ng-show=$ctrl.isEmpty>{{$ctrl.emptyMessage}}</div><div class=\"alert alert-warning\" ng-show=$ctrl.hasError>{{$ctrl.errorMessage}}</div></div>");
}]);
})(angular);
