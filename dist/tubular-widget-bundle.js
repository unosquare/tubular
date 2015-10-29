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
         */
        .directive('tbWidgetContainer', [
            function() {
                return {
                    template: '<div class="container"><ng-transclude></ng-transclude></div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.widgets = [];

                            $scope.redraw = function() {
                                angular.forEach($scope.widgets, function(widget) {
                                    var parent = widget.content.parent();

                                    if (!widget.oneColumn) {
                                        if (parent.find('div.widget-panel').length > 1) {
                                            $('<div class="row"></div>').insertBefore(parent).append(widget.content);
                                        }
                                    } else {
                                        if (parent.find('div.widget-panel').length === 1) {
                                            if (parent.next().hasClass('row') && parent.next().find('div.widget-panel').length === 1) {
                                                parent.append(parent.next().find('div.widget-panel'));
                                                parent.next().remove();
                                            }
                                        }
                                    }
                                });
                            };
                        }
                    ]
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
                        '<li ng-hide="!oneColumn"><a href="#" ng-click="oneColumn = false">Two columns</a></li>' +
                        '<li ng-hide="oneColumn"><a href="#" ng-click="oneColumn = true">One column</a></li>' +
                        '<li ng-hide="maximize"><a href="#" ng-click="maximize = true">Maximize</a></li>' +
                        '<li ng-hide="!maximize"><a href="#" ng-click="maximize = false">Restore</a></li>' +
                        '<li ng-hide="top"><a href="#" ng-click="move(-2)">Move up</a></li>' +
                        '<li ng-hide="bottom"><a href="#" ng-click="move(2)">Move down</a></li>' +
                        '<li ng-hide="!oneColumn || !even"><a href="#" ng-click="move(1)">Move right</a></li>' +
                        '<li ng-hide="!oneColumn || even"><a href="#" ng-click="move(-1)">Move left</a></li>' +
                        '</ul></div></div></div>' +
                        '<div class="panel-body">' +
                        '<ng-transclude></ng-transclude>' +
                        '</div></div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        title: '@'
                    },
                    controller: function($scope, $element) {
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
                            var tmp = $scope.container.widgets[$scope.pos + factor];

                            $scope.container.widgets[$scope.pos + factor] = $scope;
                            $scope.container.widgets[$scope.pos] = tmp;

                            tmp.calculatePositions($scope.pos);
                            $scope.calculatePositions($scope.pos + factor);
                            swapNodes(tmp.content[0], $element[0]);

                            $scope.container.redraw();
                        };
                    }
                }
            }
        ]);
})();