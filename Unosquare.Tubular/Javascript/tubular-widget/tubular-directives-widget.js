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
                        '<div class="panel-heading">{{title}}<div class="pull-right">' +
                        '<div class="dropdown"><button class="btn btn-xs btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                        '<span class="caret"></span>' +
                        '</button>' +
                        '<ul class="dropdown-menu dropdown-menu-right">' +
                        '<li ng-hide="!oneColumn || maximize"><a href="#" ng-click="oneColumn = false">{{\'UI_TWOCOLS\'| translate}}</a></li>' +
                        '<li ng-hide="oneColumn || maximize"><a href="#" ng-click="oneColumn = true">{{\'UI_ONECOL\'| translate}}</a></li>' +
                        '<li ng-hide="maximize"><a href="#" ng-click="maximize = true">{{\'UI_MAXIMIZE\'| translate}}</a></li>' +
                        '<li ng-hide="!maximize"><a href="#" ng-click="maximize = false">{{\'UI_RESTORE\'| translate}}</a></li>' +
                        '<li ng-hide="top || maximize"><a href="#" ng-click="move(-2)">{{\'UI_MOVEUP\'| translate}}</a></li>' +
                        '<li ng-hide="bottom || maximize"><a href="#" ng-click="move(2)">{{\'UI_MOVEDOWN\'| translate}}</a></li>' +
                        '<li ng-hide="!oneColumn || !even || maximize"><a href="#" ng-click="move(1)">{{\'UI_MOVERIGHT\'| translate}}</a></li>' +
                        '<li ng-hide="!oneColumn || even || maximize"><a href="#" ng-click="move(-1)">{{\'UI_MOVELEFT\'| translate}}</a></li>' +
                        '</ul></div></div></div>' +
                        '<div class="panel-body">' +
                        '<ng-transclude></ng-transclude>' +
                        '</div></div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        title: '@',
                        name: '@?widgetName'
                    },
                    controller: function ($scope, $element) {
                        $scope.name = $scope.name || 'tbwidget';
                        $scope.oneColumn = true;
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

                        $scope.$watch('$parent.widgets', function(val) {
                            var pos = $scope.container.widgets.indexOf($scope);
                            $scope.calculatePositions(pos);
                        });

                        $scope.$watch('oneColumn', function() {
                            $scope.container.redraw();
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