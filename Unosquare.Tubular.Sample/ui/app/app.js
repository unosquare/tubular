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
            });

    angular.module('app', [
        'tubular',
        'tubular-chart.directives',
        'tubular-hchart.directives',
        'tubular-reporting.directives',
        'tubular-widget.directives',
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