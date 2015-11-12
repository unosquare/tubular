(function() {
    'use strict';

    angular.module('tubular-widget.directives', ['tubular.services'])
        /**
         * @ngdoc directive
         * @name tbWidgetContainer
         * @restrict E
         *
         * @description
         * The `tbWidgetContainer` directive is a root node to attach widgets.
         * 
         * @scope
         * 
         * @param {string} container-name The container name
         */
        .directive('tbWidgetContainer', [
            function() {
                return {
                    template: '<div class="container"><ng-transclude></ng-transclude></div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        name: '@?containerName'
                    },
                    controller: [
                        '$scope', 'localStorageService', function ($scope, localStorageService) {
                            $scope.name = $scope.name || 'tbcontainer';
                            $scope.widgets = [];
                            $scope.settings = localStorageService.get($scope.name + "_data");

                            $scope.redraw = function () {
                                angular.forEach($scope.widgets, function(widget) {
                                    var parent = widget.content.parent();

                                    if (!widget.oneColumn) {
                                        if (parent.find('div.widget-panel').length > 1) {
                                            $('<div class="row"></div>').insertBefore(parent).append(widget.content);
                                        }
                                    } else {
                                        if (parent.find('div.widget-panel').length === 1) {
                                            if (parent.next().hasClass('row')) {
                                                parent.append(parent.next().find('div.widget-panel'));

                                                if (parent.next().find('div.widget-panel').length === 0) {
                                                    parent.next().remove();
                                                }
                                            }
                                        }

                                        if (parent.find('div.widget-panel').length > 2) {
                                            $('<div class="row"></div>').insertAfter(parent).append(parent.find('div.widget-panel').last());
                                        }
                                    }
                                });

                                $scope.saveSettings();
                            };

                            $scope.saveSettings = function () {
                                var newSettings = {};
                                angular.forEach($scope.widgets, function(widget) {
                                    newSettings[widget.name] = {
                                        position: widget.position,
                                        oneColumn: widget.oneColumn,
                                        collapsed: widget.collapsed
                                    };
                                });

                                localStorageService.set($scope.name + "_data", newSettings);
                            };
                        }
                    ],
                    compile: function compile() {
                        return {
                            post: function (scope) {
                                if (scope.settings) {
                                    angular.forEach(scope.widgets, function(widget) {
                                        var setting = scope.settings[widget.name];
                                        if (!setting) return;

                                        widget.oneColumn = setting.oneColumn;
                                        widget.collapsed = setting.collapsed;
                                        if (widget.position !== setting.position) {
                                            widget.moveAt(setting.position);
                                        }
                                    });
                                }
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
         * @scope
         * 
         * @param {string} title Set the widget title.
         * @param {string} widgetName Set the widget name.
         */
        .directive('tbWidget', [
            function() {
                return {
                    template: '<div class="widget-panel">' +
                        '<div class="tubular-overlay maximized" ng-show="maximized"></div>' +
                        '<div ng-class="{ \'col-md-6\': oneColumn, \'col-md-12\': !oneColumn, \'maximized\': maximized}">' +
                            '<div class="panel panel-default">' +
                            '<div class="panel-heading">' +
                                '<span>{{title}}</span> ' +
                                '<div class="pull-right">' +
                                    '<button ng-hide="maximized" ng-disabled="top" ng-click="move(-2)" class="btn btn-default btn-xs"  title="{{\'UI_MOVEUP\'| translate}}"><span><i class="glyphicon glyphicon-arrow-up"></i></span></button>' +
                                    '<button ng-hide="maximized" ng-disabled="bottom" ng-click="move(2)" class="btn btn-default btn-xs"  title="{{\'UI_MOVEDOWN\'| translate}}"><span><i class="glyphicon glyphicon-arrow-down"></i></span></button>' +
                                    '<button ng-hide="maximized" ng-disabled="!oneColumn || !even" ng-click="move(1)" class="btn btn-default btn-xs"  title="{{\'UI_MOVERIGHT\'| translate}}"><span><i class="glyphicon glyphicon-arrow-right"></i></span></button>' +
                                    '<button ng-hide="maximized" ng-disabled="!oneColumn || even" ng-click="move(-1)" class="btn btn-default btn-xs"  title="{{\'UI_MOVELEFT\'| translate}}"><span><i class="glyphicon glyphicon-arrow-left"></i></span></button>' +
                                    '<button ng-hide="!oneColumn || maximized" ng-click="oneColumn = false" class="btn btn-default btn-xs" title="{{\'UI_TWOCOLS\'| translate}}"><span><i class="glyphicon glyphicon-resize-horizontal"></i></span></button>' +
                                    '<button ng-hide="oneColumn || maximized" ng-click="oneColumn = true" class="btn btn-default btn-xs"  title="{{\'UI_ONECOL\'| translate}}"><span><i class="glyphicon glyphicon-resize-horizontal"></i></span></button>' +
                                    '<button ng-hide="collapsed || maximized" ng-click="collapsed = true" class="btn btn-default btn-xs"  title="{{\'UI_COLLAPSE\'| translate}}"><span><i class="glyphicon glyphicon-menu-up"></i></span></button>' +
                                    '<button ng-hide="!collapsed || maximized" ng-click="collapsed = false" class="btn btn-default btn-xs"  title="{{\'UI_EXPAND\'| translate}}"><span><i class="glyphicon glyphicon-menu-down"></i></span></button>' +
                                    '<button ng-hide="maximized" ng-click="maximized = true;" class="btn btn-default btn-xs"  title="{{\'UI_MAXIMIZE\'| translate}}"><span><i class="glyphicon glyphicon-resize-full"></i></span></button>' +
                                    '<button ng-hide="!maximized" ng-click="maximized = false" class="btn btn-default btn-xs"  title="{{\'UI_RESTORE\'| translate}}"><span><i class="glyphicon glyphicon-resize-small"></i></span></button>' +
                                '</div>'+
                            '</div>'+
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
                        summary: '=?widgetSummary'
                    },
                    controller: function ($scope, $element) {
                        $scope.name = $scope.name || 'tbwidget';
                        $scope.oneColumn = true;
                        $scope.collapsed = false;
                        $scope.maximized = false;
                        $scope.position = 0;
                        $scope.content = $element;
                        $scope.container = $scope.$parent.$parent;

                        $scope.container.widgets.push($scope);

                        $scope.calculatePositions = function(position) {
                            $scope.top = position === 0 || position === 1;
                            $scope.bottom = position === $scope.container.widgets.length - 1 || position === $scope.container.widgets.length - 2;
                            $scope.even = position % 2 === 0;
                            $scope.position = position;
                        };

                        $scope.$watch('$parent.widgets', function (val) {
                            var position = $scope.container.widgets.indexOf($scope);
                            $scope.calculatePositions(position);
                        });

                        $scope.$watch('oneColumn', function () {
                            $scope.container.redraw();
                        });

                        $scope.$watch('collapsed', function (v) {
                            $scope.container.saveSettings();
                        });

                        function swapNodes(a, b) {
                            var aparent = a.parentNode;
                            var asibling = a.nextSibling === b ? a : a.nextSibling;
                            b.parentNode.insertBefore(a, b);
                            aparent.insertBefore(b, asibling);
                        }

                        $scope.move = function(factor) {
                            $scope.moveAt($scope.position + factor);
                        };

                        $scope.moveAt = function (position) {
                            var tmp = $scope.container.widgets[position];
                            if (!tmp) return;

                            $scope.container.widgets[position] = $scope;
                            $scope.container.widgets[$scope.position] = tmp;

                            tmp.calculatePositions($scope.position);
                            $scope.calculatePositions(position);
                            swapNodes(tmp.content[0], $element[0]);

                            $scope.container.redraw();
                        }
                    }
                }
            }
        ]);
})();