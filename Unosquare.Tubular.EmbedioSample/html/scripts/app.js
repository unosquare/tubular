(function () {
    'use strict';

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
                $scope.$on('tbGrid_OnBeforeRequest', function (event, eventData) { console.log(eventData); });
                $scope.$on('tbGrid_OnSuccessfulUpdate', function (data) { toastr.success("Record updated"); });
                $scope.$on('tbGrid_OnRemove', function (data) { toastr.success("Record removed"); });
                $scope.$on('tbGrid_OnConnectionError', function (error) { toastr.error(error.statusText || "Connection error"); });
                $scope.$on('tbGrid_OnSuccessfulForm', function (data) { $location.path('/'); });
                $scope.$on('tbGrid_OnSavingNoChanges', function (model) {
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
        'app.controllers'
    ]);
})();