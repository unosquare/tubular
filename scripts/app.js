(function () {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'assets/home.html',
                        title: 'Home'
                    }).otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]);

    angular.module('app.services', []).service('myService', ['$q', function myService($q) {
        var me = this;

        me.saveDataAsync = function (model, request) {
            // DO NOTHING
        };

        me.retrieveDataAsync = function (request) {
            return {
                promise: $q(function (resolve, reject) {
                    resolve({
                        Payload: [["Pepe", "P"], ["Pepe 2", "P"]]
                    });
                }),
                cancel: function () { }
            };
        };
    }
    ]);

    angular.module('app.controllers', ['app.services'])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', '$templateCache', 'myService', function ($scope, $location, $templateCache, myService) {
            $scope.myService = myService;
            $scope.source = null;

            $scope.$on('tubularGrid_OnBeforeRequest', function(event, eventData) { console.log(eventData); });
            $scope.$on('tubularGrid_OnSuccessfulUpdate', function(data) { toastr.success("Record updated"); });
            $scope.$on('tubularGrid_OnRemove', function(data) { toastr.success("Record removed"); });
            $scope.$on('tubularGrid_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });
            $scope.$on('tubularGrid_OnSuccessfulForm', function(data) { $location.path('/'); });
            $scope.$on('tubularGrid_OnSavingNoChanges', function(model) {
                toastr.warning("Nothing to save");
                $location.path('/');
            });

            $scope.toggleCode = function() {
                if ($scope.source == null)
                    $scope.source = $templateCache.get('sample.html');
                else
                    $scope.source = null;
            };
        }
    ]);

    angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'ngCookies',
        'hljs',
        'tubular.models',
        'tubular.services',
        'tubular.directives',
        'app.routes',
        'app.services',
        'app.controllers'
    ]);
})();