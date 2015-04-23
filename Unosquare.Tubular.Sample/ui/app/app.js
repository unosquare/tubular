(function() {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: '/ui/app/common/view.html',
                        title: 'A Sample Data Grid!'
                    }).when('/form/:param', {
                        templateUrl: '/ui/app/common/form.html',
                        title: 'This is a form!'
                    }).when('/new/', {
                        templateUrl: '/ui/app/common/formnew.html',
                        title: 'Add a new ORDER NOW!'
                    }).otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]);

    angular.module('app.services', []).service('myService', [
        '$q', function myService($q) {
            var me = this;

            me.saveDataAsync = function(model, request) {
                // DO NOTHING
            };

            me.retrieveDataAsync = function(request) {
                return {
                    promise: $q(function(resolve, reject) {
                        resolve({
                            Payload: [["Pepe", "P"], ["Pepe 2", "P"]]
                        });
                    }),
                    cancel: function() {}
                };
            };
        }
    ]);

    angular.module('app.controllers', ['app.services'])
        .controller('TitleController', [
            '$scope', '$route', function($scope, $route) {
                var me = this;
                me.content = "Home";
                $scope.$on('$routeChangeSuccess', function(currentRoute, previousRoute) {
                    me.content = $route.current.title;
                });
            }
        ])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', 'myService', function($scope, $location, myService) {
                var me = this;
                me.alert = function(arg, component) {
                    if (angular.isUndefined(component)) {
                        alert(arg);
                    } else {
                        alert('fired from sample controller:' + arg + '; record count is: ' + component.rows.length);
                    }
                };

                me.onTableController = function() {
                    console.log('On Before Get Data Event: fired.');
                };

                me.defaultDate = new Date();

                me.myService = myService;

                // Grid Events
                $scope.$on('tbGrid_OnBeforeRequest', function(event, eventData) { console.log(eventData); });
                $scope.$on('tbGrid_OnSuccessfulUpdate', function(data) { toastr.success("Record updated"); });
                $scope.$on('tbGrid_OnRemove', function(data) { toastr.success("Record removed"); });
                $scope.$on('tbGrid_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });

                // Form Events
                $scope.$on('tbForm_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });

                $scope.$on('tbForm_OnSuccessfulSave', function(data) {
                    toastr.success("Record updated");
                    $location.path('/');
                });

                $scope.$on('tbForm_OnSavingNoChanges', function(model) {
                    toastr.warning("Nothing to save");
                    $location.path('/');
                });

                $scope.$on('tbForm_OnCancel', function(model) {
                    $location.path('/');
                });
            }
        ]);

    angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'ngCookies',
        'tubular.models',
        'tubular.services',
        'tubular.directives',
        'app.routes',
        'app.services',
        'app.controllers'
    ]);
})();