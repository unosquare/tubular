(function() {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: '/ui/app/common/view.html',
                        title: 'A Sample Data Grid!'
                    }).when('/format', {
                        templateUrl: '/ui/app/common/viewformat.html',
                        title: 'Another Data Grid!'
                    }).when('/form/:param', {
                        templateUrl: '/ui/app/common/form.html',
                        title: 'This is a form!'
                    }).when('/login', {
                        templateUrl: '/ui/app/common/login.html',
                        title: 'Login'
                    }).when('/new/', {
                        templateUrl: '/ui/app/common/formnew.html',
                        title: 'Add a new ORDER NOW!'
                    }).when('/reporting/', {
                        templateUrl: '/ui/app/common/reporting.html',
                        title: 'Create a custom Report'
                    }).when('/widget/', {
                        templateUrl: '/ui/app/common/widget.html',
                        title: 'Widgets'
                    }).otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]);

    angular.module('app.controllers', ['tubular.services'])
        .controller('titleController', [
            '$scope', '$route', function($scope, $route) {
                var me = this;
                me.content = "Home";

                $scope.$on('$routeChangeSuccess', function(currentRoute, previousRoute) {
                    me.content = $route.current.title;
                });
            }
        ]).controller('loginCtrl', [
            '$scope', '$location', function($scope, $location) {
                // TODO: Complete
            }
        ]).controller('i18nCtrl', [
            '$scope', 'tubularTranslate', function($scope, tubularTranslate) {
                $scope.toggle = function() {
                    tubularTranslate.setLanguage(tubularTranslate.currentLanguage === 'en' ? 'es' : 'en');
                    toastr.info('New language: ' + tubularTranslate.currentLanguage);
                };
            }
        ])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', function($scope, $location) {
                var me = this;
                me.onTableController = function() {
                    console.log('On Before Get Data Event: fired.');
                };

                me.defaultDate = new Date();

                // Grid Events
                $scope.$on('tbGrid_OnBeforeRequest', function(event, eventData) {
                    console.log(eventData);
                });

                $scope.$on('tbGrid_OnRemove', function(data) {
                    toastr.success("Record removed");
                });

                $scope.$on('tbGrid_OnConnectionError', function(error) {
                    toastr.error(error.statusText || "Connection error");
                });

                $scope.$on('tbGrid_OnSuccessfulSave', function(event, data, gridScope) {
                    toastr.success("Record updated");
                });

                // Form Events
                $scope.$on('tbForm_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });

                $scope.$on('tbForm_OnSuccessfulSave', function(event, data, formScope) {
                    toastr.success("Record updated");
                    formScope.clear();
                });

                $scope.$on('tbForm_OnSavingNoChanges', function(event, formScope) {
                    toastr.warning("Nothing to save");
                    $location.path('/');
                });

                $scope.$on('tbForm_OnCancel', function(model, error, formScope) {
                    $location.path('/');
                });
            }
        ]).controller("reportingCtrl",
            function ($scope) {
                $scope.$on('tbReporting_OnConnectionError', function (event, error) { toastr.error(error); });
                $scope.$on('tbReporting_OnSuccessfulSave', function (event, message) { toastr.success(message); });
                $scope.$on('tbReporting_OnRemoved', function (event, message) { toastr.success(message); });
            })
        .controller('widgetContainer', function($scope) {
            $scope.widgets = [];

            $scope.redraw = function() {
                angular.forEach($scope.widgets, function (widget) {
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
        })
        .directive('widget', [
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
                        $scope.$parent.widgets.push($scope);

                        $scope.calculatePositions = function(pos) {
                            $scope.top = pos === 0 || pos === 1;
                            $scope.bottom = pos === $scope.$parent.widgets.length - 1 || pos === $scope.$parent.widgets.length - 2;
                            $scope.even = pos % 2 === 0;
                            $scope.pos = pos;
                        };

                        $scope.$watch('$parent.widgets', function (val) {
                            var pos = $scope.$parent.widgets.indexOf($scope);
                            $scope.calculatePositions(pos);
                        });

                        $scope.$watch('oneColumn', function() {
                            $scope.$parent.redraw();
                        });

                        function swapNodes(a, b) {
                            var aparent = a.parentNode;
                            var asibling = a.nextSibling === b ? a : a.nextSibling;
                            b.parentNode.insertBefore(a, b);
                            aparent.insertBefore(b, asibling);
                        }

                        $scope.move = function(factor) {
                            var tmp = $scope.$parent.widgets[$scope.pos + factor];

                            $scope.$parent.widgets[$scope.pos + factor] = $scope;
                            $scope.$parent.widgets[$scope.pos] = tmp;

                            tmp.calculatePositions($scope.pos);
                            $scope.calculatePositions($scope.pos + factor);
                            swapNodes(tmp.content[0], $element[0]);
                            
                            $scope.$parent.redraw();
                        };
                    }
                }
            }]);

    angular.module('app', [
        'tubular',
        'tubular-chart.directives',
        'tubular-hchart.directives',
        'tubular-reporting.directives',
        'app.routes',
        'app.controllers'
    ]).run([
        'tubularTranslate', function (tubularTranslate) {
            // Uncomment if you want to start with Spanish
            //tubularTranslate.setLanguage('es');
            // I need to check this
            tubularTranslate.addTranslation('es', 'UI_LANG', 'English').addTranslation('en', 'UI_LANG', 'Español');
            console.log(tubularTranslate.translationTable);
        }
    ]);
})();