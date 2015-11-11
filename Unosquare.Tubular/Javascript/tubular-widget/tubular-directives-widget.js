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
                                var newSettings = {};
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

                                    newSettings[widget.name] = {
                                        position: widget.pos,
                                        oneColumn: widget.oneColumn
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
                                        if (widget.pos !== setting.pos) {
                                            widget.moveAt(setting.pos);
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
                        '<div class="tubular-overlay maximize" ng-show="maximize"></div>' +
                        '<div ng-class="{ \'col-md-6\': oneColumn, \'col-md-12\': !oneColumn, \'maximize\': maximize}">' +
                            '<div class="panel panel-default">' +
                            '<div class="panel-heading">' +
                                '<span><strong>{{title}}</strong></span> ' +
                                '<span ng-show="collapsed">{{summary}}</span>' +
                                '<div class="pull-right">' +
                                    '<button ng-disabled="top || maximize" ng-click="move(-2)" class="btn btn-default btn-xs"  title="{{\'UI_MOVEUP\'| translate}}"><span><i class="glyphicon glyphicon-arrow-up"></i></span></button>' +
                                    '<button ng-disabled="bottom || maximize" ng-click="move(2)" class="btn btn-default btn-xs"  title="{{\'UI_MOVEDOWN\'| translate}}"><span><i class="glyphicon glyphicon-arrow-down"></i></span></button>' +
                                    '<button ng-disabled="!oneColumn || !even || maximize" ng-click="move(1)" class="btn btn-default btn-xs"  title="{{\'UI_MOVERIGHT\'| translate}}"><span><i class="glyphicon glyphicon-arrow-right"></i></span></button>' +
                                    '<button ng-disabled="!oneColumn || even || maximize" ng-click="move(-1)" class="btn btn-default btn-xs"  title="{{\'UI_MOVELEFT\'| translate}}"><span><i class="glyphicon glyphicon-arrow-left"></i></span></button>' +
                                    '<button ng-hide="!oneColumn || maximize" ng-click="oneColumn = false" class="btn btn-default btn-xs" title="{{\'UI_TWOCOLS\'| translate}}"><span><i class="glyphicon glyphicon-resize-horizontal"></i></span></button>' +
                                    '<button ng-hide="oneColumn || maximize" ng-click="oneColumn = true" class="btn btn-default btn-xs"  title="{{\'UI_ONECOL\'| translate}}"><span><i class="glyphicon glyphicon-resize-horizontal"></i></span></button>' +
                                    '<button ng-hide="collapsed" ng-click="collapsed = true" class="btn btn-default btn-xs"  title="{{\'UI_COLLAPSE\'| translate}}"><span><i class="glyphicon glyphicon-triangle-top"></i></span></button>' +
                                    '<button ng-hide="!collapsed" ng-click="collapsed = false" class="btn btn-default btn-xs"  title="{{\'UI_EXPAND\'| translate}}"><span><i class="glyphicon glyphicon-triangle-bottom"></i></span></button>' +
                                    '<button ng-hide="maximize" ng-click="maximize = true" class="btn btn-default btn-xs"  title="{{\'UI_MAXIMIZE\'| translate}}"><span><i class="glyphicon glyphicon-resize-full"></i></span></button>' +
                                    '<button ng-hide="!maximize" ng-click="maximize = false" class="btn btn-default btn-xs"  title="{{\'UI_RESTORE\'| translate}}"><span><i class="glyphicon glyphicon-resize-small"></i></span></button>' +
                                '</div>'+
                            '</div>'+
                            '<div class="panel-body">' +
                                '<ng-transclude></ng-transclude>' +
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
                        $scope.maximize = false;
                        $scope.pos = 0;
                        $scope.content = $element;
                        $scope.container = $scope.$parent.$parent;

                        $scope.container.widgets.push($scope);

                        $scope.calculatePositions = function(pos) {
                            $scope.top = pos === 0 || pos === 1;
                            $scope.bottom = pos === $scope.container.widgets.length - 1 || pos === $scope.container.widgets.length - 2;
                            $scope.even = pos % 2 === 0;
                            $scope.pos = pos;
                        };

                        $scope.$watch('$parent.widgets', function (val) {
                            var pos = $scope.container.widgets.indexOf($scope);
                            $scope.calculatePositions(pos);
                        });

                        $scope.$watch('oneColumn', function() {
                            $scope.container.redraw();
                        });

                        $scope.$watch('collapsed', function (v) {
                            var el = $scope.content.find('.panel-body');
                            $scope.collapsed ? el.hide() : el.show();
                        });

                        function swapNodes(a, b) {
                            var aparent = a.parentNode;
                            var asibling = a.nextSibling === b ? a : a.nextSibling;
                            b.parentNode.insertBefore(a, b);
                            aparent.insertBefore(b, asibling);
                        }

                        $scope.move = function(factor) {
                            $scope.moveAt($scope.pos + factor);
                        };

                        $scope.moveAt = function (pos) {
                            var tmp = $scope.container.widgets[pos];
                            if (!tmp) return;

                            $scope.container.widgets[pos] = $scope;
                            $scope.container.widgets[$scope.pos] = tmp;

                            tmp.calculatePositions($scope.pos);
                            $scope.calculatePositions(pos);
                            swapNodes(tmp.content[0], $element[0]);

                            $scope.container.redraw();
                        }
                    }
                }
            }
        ]);
})();