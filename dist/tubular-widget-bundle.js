(function(angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular-widget.directives
     * @module tubular-widget.directives
     * 
     * @description 
     * Tubular Widgets Directives. You require jQuery to run this directives.
     */
    angular.module('tubular-widget.directives', ['tubular.services'])
        /**
         * @ngdoc directive
         * @name tbWidgetContainer
         * @restrict E
         *
         * @description
         * The `tbWidgetContainer` directive is a root node to attach widgets.
         * 
         * @param {string} container-name The container name
         * @param {bool} fixed-widgets Set if the widgets are fixed
         */
        .directive('tbWidgetContainer', [
            function() {
                return {
                    template: '<div class="container-fluid"><ng-transclude></ng-transclude></div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        name: '@?containerName',
                        fixedWidgets: '@?fixedWidgets'
                    },
                    controller: [
                        '$scope', '$element', 'localStorageService', function($scope, $element, localStorageService) {
                            $scope.name = $scope.name || 'tbcontainer';
                            $scope.fixedWidgets = angular.isDefined($scope.fixedWidgets) && $scope.fixedWidgets == "true";
                            $scope.widgets = [];
                            $scope.settings = localStorageService.get($scope.name + "_data");

                            $scope.redraw = function() {
                                var currentRows = $element.children('div.row');

                                angular.forEach($scope.widgetsAsRows, function(row) {
                                    if (row[0].isHidden) return;
                                    var newRow = angular.element('<div class="row"></div>');
                                    $element.append(newRow);
                                    angular.forEach(row, function(widget) {
                                        newRow.append(widget.content);
                                    });
                                });

                                currentRows.remove();
                            };

                            $scope.divideIntoRows = function() {
                                var widgets = $scope.widgets.slice(0);
                                var rows = [];
                                while (widgets.length) {
                                    if (widgets[0].fullWidth || widgets[0].isHidden) {
                                        widgets[0].row = rows.length;
                                        rows.push(widgets.splice(0, 1));
                                    } else if (widgets[1] && widgets[1].fullWidth) {
                                        widgets[1].row = rows.length;
                                        rows.push(widgets.splice(1, 1));
                                    } else {
                                        widgets[0].row = rows.length;
                                        widgets[1] && (widgets[1].row = rows.length);
                                        rows.push(widgets.splice(0, 2));
                                    }
                                }

                                return $scope.widgetsAsRows = rows;
                            };

                            $scope.setWidgetsCapabilities = function() {
                                angular.forEach($scope.widgets, function(widget) { widget.canUp = widget.canDown = widget.canLeft = widget.canRight = true; });
                                angular.forEach($scope.widgetsAsRows[0], function(widget) {
                                    widget.canUp = false;
                                });
                                angular.forEach($scope.widgetsAsRows[$scope.widgetsAsRows.length - 1], function(widget) {
                                    widget.canDown = false;
                                });
                                angular.forEach($scope.widgetsAsRows, function(row) {
                                    if (row.length == 1) {
                                        row[0].canRight = false;
                                        row[0].canLeft = false;
                                    } else {
                                        row[0].canRight = true;
                                        row[0].canLeft = false;
                                        row[1].canRight = false;
                                        row[1].canLeft = true;
                                    }
                                });
                            };

                            $scope.move = function(widget, direction) {
                                var rowNumber = widget.row;
                                var targetRowNumber = direction == 'up' ? rowNumber - 1 : direction == 'down' ? rowNumber + 1 : rowNumber;
                                var widgetRow = $scope.widgetsAsRows[rowNumber];
                                var targetRow = $scope.widgetsAsRows[targetRowNumber];
                                switch (direction) {
                                case 'up':
                                case 'down':
                                    if (widgetRow[0].fullWidth || targetRow[0].fullWidth) {
                                        var tmp = $scope.widgetsAsRows[rowNumber];
                                        $scope.widgetsAsRows[rowNumber] = $scope.widgetsAsRows[targetRowNumber];
                                        $scope.widgetsAsRows[targetRowNumber] = tmp;
                                    } else {
                                        if (widget.canLeft) {
                                            var swapWithIndex = $scope.widgetsAsRows[targetRowNumber].length == 2 ? 1 : 0;
                                            var tmp = $scope.widgetsAsRows[rowNumber][1];
                                            $scope.widgetsAsRows[rowNumber][1] = $scope.widgetsAsRows[targetRowNumber][swapWithIndex];
                                            $scope.widgetsAsRows[targetRowNumber][swapWithIndex] = tmp;
                                        } else {
                                            var tmp = $scope.widgetsAsRows[rowNumber][0];
                                            $scope.widgetsAsRows[rowNumber][0] = $scope.widgetsAsRows[targetRowNumber][0];
                                            $scope.widgetsAsRows[targetRowNumber][0] = tmp;
                                        }
                                    }
                                    break;
                                case 'left':
                                case 'right':
                                    var tmp = widgetRow[0];
                                    widgetRow[0] = widgetRow[1];
                                    widgetRow[1] = tmp;
                                    break;
                                }

                                $scope.widgets = [].concat.apply([], $scope.widgetsAsRows);
                                angular.forEach($scope.widgets, function(widget, index) {
                                    widget.position = index;
                                });

                                $scope.recalculate();
                            };

                            $scope.recalculate = function() {
                                $scope.divideIntoRows();
                                $scope.setWidgetsCapabilities();
                                $scope.saveSettings();
                            };

                            $scope.saveSettings = function() {
                                var newSettings = {};
                                angular.forEach($scope.widgets, function(widget) {
                                    newSettings[widget.name] = {
                                        position: widget.position,
                                        fullWidth: widget.fullWidth,
                                        collapsed: widget.collapsed
                                    };
                                });

                                localStorageService.set($scope.name + "_data", newSettings);
                            };
                        }
                    ],
                    compile: function compile() {
                        return {
                            post: function(scope) {
                                if (!scope.fixedWidgets && scope.settings) {
                                    angular.forEach(scope.widgets, function(widget, index) {
                                        var setting = scope.settings[widget.name];
                                        widget.position = index;

                                        if (!setting) return;

                                        widget.fullWidth = setting.fullWidth;
                                        widget.collapsed = setting.collapsed;
                                        widget.position = setting.position;
                                    });

                                    scope.widgets.sort(function(a, b) { return a.position > b.position; });
                                }

                                scope.recalculate();
                                scope.redraw();
                            }
                        }
                    }
                }
            }
        ])
        /**
         * @ngdoc directive
         * @name tbWidget
         * @restrict E
         *
         * @description
         * The `tbWidget` directive to transclude your content in a panel with several options.
         * 
         * @param {string} title Set the widget title.
         * @param {string} widgetName Set the widget name.
         */
        .directive('tbWidget', [
            function() {
                return {
                    template: '<div class="widget-panel" ng-hide="isHidden">' +
                        '<div class="tubular-overlay maximized" ng-show="maximized"></div>' +
                        '<div ng-class="{ \'col-md-6\': !fullWidth, \'col-md-12\': fullWidth, \'maximized\': maximized}">' +
                        '<div class="panel panel-default">' +
                        '<div class="tubular-overlay row" ng-show="showOverlay"><div><div class="fa fa-refresh fa-2x fa-spin"></div></div></div>' +
                        '<div class="panel-heading">' +
                        '<span>{{title}}</span> ' +
                        '<div class="pull-right">' +
                        '<button ng-hide="container.fixedWidgets || maximized" ng-disabled="!canUp" ng-click="move(\'up\')" class="btn btn-default btn-xs"  title="{{\'UI_MOVEUP\'| translate}}"><span><i class="fa fa-arrow-up"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || maximized" ng-disabled="!canDown" ng-click="move(\'down\')" class="btn btn-default btn-xs"  title="{{\'UI_MOVEDOWN\'| translate}}"><span><i class=fa fa-arrow-down"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || maximized" ng-disabled="!canRight" ng-click="move(\'left\')" class="btn btn-default btn-xs"  title="{{\'UI_MOVERIGHT\'| translate}}"><span><i class="fa fa-arrow-right"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || maximized" ng-disabled="!canLeft" ng-click="move(\'right\')" class="btn btn-default btn-xs"  title="{{\'UI_MOVELEFT\'| translate}}"><span><i class="fa fa-arrow-left"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || fullWidth || maximized" ng-click="setWidth(2)" class="btn btn-default btn-xs" title="{{\'UI_TWOCOLS\'| translate}}"><span><i class="fa fa-arrows-h"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || !fullWidth || maximized" ng-click="setWidth(1)" class="btn btn-default btn-xs" title="{{\'UI_ONECOL\'| translate}}"><span><i class="fa fa-arrows-h"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || collapsed || maximized" ng-click="collapsed = true" class="btn btn-default btn-xs" title="{{\'UI_COLLAPSE\'| translate}}"><span><i class="fa fa-angle-up"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || !collapsed || maximized" ng-click="collapsed = false" class="btn btn-default btn-xs" title="{{\'UI_EXPAND\'| translate}}"><span><i class="fa fa-angle-down"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || maximized" ng-click="maximized = true;" class="btn btn-default btn-xs" title="{{\'UI_MAXIMIZE\'| translate}}"><span><i class="fa fa-expand"></i></span></button>' +
                        '<button ng-hide="container.fixedWidgets || !maximized" ng-click="maximized = false" class="btn btn-default btn-xs" title="{{\'UI_RESTORE\'| translate}}"><span><i class="fa fa-compress"></i></span></button>' +
                        '</div>' +
                        '</div>' +
                        '<div class="panel-body" ng-hide="collapsed && !maximized">' +
                        '<ng-transclude></ng-transclude>' +
                        '</div>' +
                        '<div class="panel-body" ng-show="collapsed && !maximized">' +
                        '{{summary}}' +
                        '</div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        title: '@',
                        name: '@?widgetName',
                        summary: '@?widgetSummary',
                        isHidden: '@?isHidden',
                        fullWidth: '@?fullWidth',
                        showOverlay: '=?showOverlay'
                    },
                    controller: [
                        '$scope', '$element', function($scope, $element) {
                            $scope.name = $scope.name || 'tbwidget';
                            $scope.fullWidth = angular.isDefined($scope.fullWidth) && $scope.fullWidth == "true";
                            $scope.isHidden = angular.isDefined($scope.isHidden) && $scope.isHidden == "true";
                            $scope.collapsed = false;
                            $scope.maximized = false;
                            $scope.position = 0;
                            $scope.content = $element;
                            $scope.container = $scope.$parent.$parent;

                            $scope.canUp = false;
                            $scope.canDown = false;
                            $scope.canLeft = false;
                            $scope.canRight = false;

                            $scope.container.widgets.push($scope);

                            $scope.setWidth = function(width) {
                                $scope.fullWidth = width == 2;
                                $scope.container.recalculate();
                                $scope.container.redraw();
                            };

                            $scope.$watch('collapsed', function(v) {
                                $scope.container.saveSettings();
                            });

                            $scope.move = function(direction) {
                                $scope.container.move(this, direction);
                                $scope.container.redraw();
                            };
                        }
                    ]
                }
            }
        ])
        /**
         * @ngdoc directive
         * @name tbWidgetActions
         * @restrict E
         *
         * @description
         * The `tbWidgetActios` directive to transclude your content in a header panel with several options.
         * 
         * Actions will need to be sent to the $parent scope.
         */
        .directive('tbWidgetActions', [
            function() {
                return {
                    template: '<div class="pull-right"><ng-transclude></ng-transclude></div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    require: '^tbWidget',
                    controller: [
                        '$scope', function($scope) {
                            $scope.$widget = $scope.$parent.$parent.$parent;
                        }
                    ],
                    link: function (scope, iElement) {
                        // TODO: Remove jQuery dependency
                        var header = iElement.parents('.panel').find('.panel-heading');
                        header.append(iElement);
                    }
                }
            }
        ]);
})(window.angular);