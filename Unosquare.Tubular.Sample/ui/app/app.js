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
            function ($scope, $routeParams, tubularHttp, localStorageService) {
                $scope.items = [];
                $scope.reports = localStorageService.get('reports') || [];
                tubularHttp.setRequireAuthentication(false);

                tubularHttp.get('api/reports/datasources').promise.then(function(data) {
                    $scope.dataSources = data.DataSources;
                    $scope.aggregationFunctions = data.AggregationFunctions;
                    $scope.types = data.Types;
                });

                $scope.addItem = function () {
                    $scope.items.push({
                        DataSource: $scope.Model.DataSource.Name,
                        Column: $scope.Model.Column.Name,
                        DataType: $scope.Model.DataType,
                        Aggregation: $scope.Model.AggregationFunction,
                        Filter: $scope.Model.Filter
                    });

                    $scope.Model.Filter = '';
                };

                $scope.removeItem = function(item) {
                    var index = $scope.items.indexOf(item);
                    if (index > -1) {
                        $scope.items.splice(index, 1);
                    }
                };

                $scope.moveItem = function (from, to) {
                    $scope.items.splice(to, 0, $scope.items.splice(from, 1)[0]);
                }

                $scope.up = function (item) {
                    var oldIndex = $scope.items.indexOf(item);

                    $scope.moveItem(oldIndex, oldIndex - 1);
                };

                $scope.down = function (item) {
                    var oldIndex = $scope.items.indexOf(item);

                    $scope.moveItem(oldIndex, oldIndex + 1);
                };

                $scope.saveReport = function () {
                    $scope.reports.push({ Name: $scope.Model.CurrentReport, Data: $scope.items });
                    localStorageService.set('reports', $scope.reports);

                    toastr.success("Report saved");
                };

                $scope.removeReport = function () {
                    var report = $scope.reports.filter(function (el) { return el.Name === $scope.Model.CurrentReport.Name; });

                    if (report && report[0]) {
                        var index = $scope.reports.indexOf(report[0]);

                        if (index > -1) {
                            $scope.reports.splice(index, 1);
                            localStorageService.set('reports', $scope.reports);
                            toastr.success("Report removed");
                        }
                    } else {
                        toastr.error("Unknown report");
                    }
                };

                $scope.loadReport = function () {
                    var report = $scope.reports.filter(function (el) { return el.Name === $scope.Model.CurrentReport.Name; });

                    if (report && report[0]) {
                        $scope.items = report[0].Data;
                    } else {
                        toastr.error("Unknown report");
                    }
                };

                $scope.isValid = function () {
                    return $scope.items.length > 0;
                }
                $scope.generate = function() {
                    tubularHttp.setRequireAuthentication(false);
                    tubularHttp.post('api/reports/getmarkup', $scope.items).promise.then(function(data) {
                        $scope.autoCode = window.URL.createObjectURL(new Blob([data], { type: "text/html" }));
                    });
                };
            });

    angular.module('app', [
        'tubular',
        'tubular-chart.directives',
        'app.routes',
        'app.controllers'
    ]).config([
        '$sceDelegateProvider', function($sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist(['self', 'blob:**']);
        }
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