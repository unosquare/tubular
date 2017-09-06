(function (angular) {
    'use strict'

    angular.module('app', ['ngRoute', 'tubular'])
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .otherwise({ redirectTo: '/' });
            }]);

})(window.angular);