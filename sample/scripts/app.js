(function (angular) {
    'use strict'

    angular.module('app', ['ngRoute', 'tubular'])
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .otherwise({ redirectTo: '/' });
            }]).run(function ($rootScope, $location, $anchorScroll) {
                $rootScope.$on('$routeChangeSuccess', function (newRoute, oldRoute) {
                    if ($location.hash()) $anchorScroll();
                });
            });;

})(window.angular);