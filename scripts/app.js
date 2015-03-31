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

    angular.module('app.controllers', ['tubular.services'])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', '$templateCache', 'tubularOData',
            function ($scope, $location, $templateCache, tubularOData) {
            $scope.odata = tubularOData;
            $scope.source = [];
            $scope.tutorial = [
                {
                    title: 'Basic layout',
                    body: 'The next grid represents a basic layout, without any additional feature or special column. Just a plain grid using a JSON datasource.',
                    key: 'sample',
                    next: 'sample2'
                },
                {
                    title: 'Basic layout 102',
                    body: 'Now we are adding a new feature, the pagination. This demo is using an ODATA datasource.',
                    key: 'sample2',
                    next: 'sample3'
                },
                {
                    title: 'Columns and columns',
                    body: 'In this sample, we can sort and filter columns. Press Ctrl key to sort by multiple columns.',
                    key: 'sample3',
                    next: null
                }
            ];

            $scope.$on('tubularGrid_OnBeforeRequest', function(event, eventData) { console.log(eventData); });
            $scope.$on('tubularGrid_OnSuccessfulUpdate', function(data) { toastr.success("Record updated"); });
            $scope.$on('tubularGrid_OnRemove', function(data) { toastr.success("Record removed"); });
            $scope.$on('tubularGrid_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });
            $scope.$on('tubularGrid_OnSuccessfulForm', function(data) { $location.path('/'); });
            $scope.$on('tubularGrid_OnSavingNoChanges', function(model) {
                toastr.warning("Nothing to save");
                $location.path('/');
            });

            $scope.toggleCode = function(tag) {
                if ($scope.source[tag] == null) {
                    $scope.source[tag] = $templateCache.get('assets/' + tag + '.html')[1];
                } else {
                    $scope.source[tag] = null;
                }
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
        'app.controllers'
    ]);
})();