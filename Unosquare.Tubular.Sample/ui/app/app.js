(function(angular) {
    'use strict';

    // define console methods if not defined
    if (typeof console === "undefined") {
        window.console = {
            log: function () { },
            debug: function () { },
            error: function () { },
            assert: function () { },
            info: function () { },
            warn: function () { }
        };
    }

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: '/ui/app/common/view.html',
                        title: 'A Sample Data Grid!'
                    }).when('/format', {
                        templateUrl: '/ui/app/common/viewformat.html',
                        title: 'Charts and grid'
                    }).when('/form/:param', {
                        templateUrl: '/ui/app/common/form.html',
                        title: 'This is a form!'
                    }).when('/login', {
                        templateUrl: '/ui/app/common/login.html',
                        title: 'Login'
                    }).when('/new/', {
                        templateUrl: '/ui/app/common/formnew.html',
                        title: 'Add a new ORDER NOW!'
                    }).when('/widget/', {
                        templateUrl: '/ui/app/common/widget.html',
                        title: 'Widgets',
                        controller: 'widgetCtrl'
                    }).otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]).config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('noCacheInterceptor');
        }
        ]).factory('noCacheInterceptor', function () {
            return {
                request: function (config) {
                    if (config.method == 'GET' && config.url.indexOf('.htm') === -1 && config.url.indexOf('blob:') === -1) {
                        var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = config.url + separator + 'noCache=' + new Date().getTime();
                    }
                    return config;
                }
            };
        });

    angular.module('app.controllers', ['tubular.services'])
        .controller('titleController', [
            '$scope', '$route', function ($scope, $route) {
                var me = this;
                me.content = "Home";

                $scope.$on('$routeChangeSuccess', function (currentRoute, previousRoute) {
                    me.content = $route.current.title;
                });
            }
        ]).controller('loginCtrl', [
            '$scope', '$location', function ($scope, $location) {
                // TODO: Complete
            }
        ]).controller('i18nCtrl', [
            '$scope', 'tubularTranslate', 'toastr', function ($scope, tubularTranslate, toastr) {
                $scope.toggle = function () {
                    tubularTranslate.setLanguage(tubularTranslate.currentLanguage === 'en' ? 'es' : 'en');
                    toastr.info('New language: ' + tubularTranslate.currentLanguage);
                };
            }
        ])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', 'toastr', function ($scope, $location, toastr) {
                var me = this;
                me.onTableController = function () {
                    console.log('On Before Get Data Event: fired.');
                };

                me.defaultDate = new Date();

                me.ColumnName = "Date";
                me.Filter = "Oxxo";

                // Grid Events
                $scope.$on('tbGrid_OnBeforeRequest', function (event, eventData) {
                    console.log(eventData);
                });

                $scope.$on('tbGrid_OnRemove', function (data) {
                    toastr.success("Record removed");
                });

                $scope.$on('tbGrid_OnConnectionError', function (error) {
                    toastr.error(error.statusText || "Connection error");
                });

                $scope.$on('tbGrid_OnSuccessfulSave', function (event, data, gridScope) {
                    toastr.success("Record updated");
                });

                // Form Events
                $scope.$on('tbForm_OnConnectionError', function (error) { toastr.error(error.statusText || "Connection error"); });

                $scope.$on('tbForm_OnSuccessfulSave', function (event, data, formScope) {
                    toastr.success("Record updated");
                    if (formScope) formScope.clear();
                });

                $scope.$on('tbForm_OnSavingNoChanges', function (event, formScope) {
                    toastr.warning("Nothing to save");
                    $location.path('/');
                });

                $scope.$on('tbForm_OnCancel', function (model, error, formScope) {
                    $location.path('/');
                });

                $scope.chartClick = function (points, evt) {
                    angular.forEach(points, function (point) {
                        toastr.success(points[0]._chart.config.data.datasets[point._datasetIndex].label);
                    });
                };

                $scope.pieClick = function (points, evt) {
                    angular.forEach(points, function (point) {
                        toastr.success(point._model.label + ': ' + point._model.y);
                    });
                };

                $scope.highchartClick = function (event) {
                    toastr.success(event.point.category + '-' + event.point.series.name + ': ' + event.point.y);
                };

                $scope.highpieClick = function (event) {
                    toastr.success(event.point.name + ': ' + event.point.y);
                };
            }
        ]).controller("widgetCtrl", [
            '$scope', function ($scope) {
                var grids = {};
                $scope.summaryGrid1 = "Summary for grid 1";
                $scope.summaryGrid2 = "Summary for grid 2";
                $scope.summaryForm1 = "Summary for form 1";
                $scope.summaryForm2 = "Summary for form 2";
                
                $scope.$on('tbGrid_OnGreetParentController', function(event, grid) {
                    grids[grid.name] = grid;
                });

                $scope.refreshGrid1 = function () {
                    grids['widgetgrid1'].retrieveData();
                }
                
            }
        ]);

    angular.module('app', [
        'tubular',
        'tubular-chart.directives',
        'tubular-hchart.directives',
        'tubular-widget.directives',
        'toastr',
        'app.routes',
        'app.controllers'
    ]).run([
        'tubularTranslate', function (tubularTranslate) {
            // Uncomment if you want to start with Spanish
            //tubularTranslate.setLanguage('es');
            // I need to check this
            tubularTranslate.addTranslation('es', 'UI_LANG', 'English').addTranslation('en', 'UI_LANG', 'Español');
            // console.log(tubularTranslate.translationTable);
        }
    ]);
})(window.angular);