(function () {
    'use strict';

    //angular.module('app.routes', ['ngRoute'])
    //    .config([
    //        '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    //            $routeProvider.
    //                when('/', {
    //                    title: 'A Sample Data Grid!'
    //                }).otherwise({
    //                    redirectTo: '/'
    //                });

    //            $locationProvider.html5Mode(true);
    //        }
    //    ]);

    angular.module('app.controllers', [])
        .controller('TitleController', [
            '$scope', '$route', function ($scope, $route) {
                var me = this;
                me.content = "Home";
                $scope.$on('$routeChangeSuccess', function (currentRoute, previousRoute) {
                    me.content = $route.current.title;
                });
            }
        ])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', function ($scope, $location) {
                $scope.$on('tubularGrid_OnBeforeRequest', function (event, eventData) { console.log(eventData); });
                $scope.$on('tubularGrid_OnSuccessfulUpdate', function (data) { toastr.success("Record updated"); });
                $scope.$on('tubularGrid_OnRemove', function (data) { toastr.success("Record removed"); });
                $scope.$on('tubularGrid_OnConnectionError', function (error) { toastr.error(error.statusText || "Connection error"); });
                $scope.$on('tubularGrid_OnSuccessfulForm', function (data) { $location.path('/'); });
                $scope.$on('tubularGrid_OnSavingNoChanges', function (model) {
                    toastr.warning("Nothing to save");
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
        //'app.routes',
        'app.controllers'
    ]);
})();