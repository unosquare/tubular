(function () {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'assets/home.html',
                        title: 'Home'
                    }).when('/WebApi', {
                        templateUrl: 'assets/webapi.html',
                        title: 'Home'
                    }).otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]);

    angular.module('app.controllers', ['tubular.services'])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', '$anchorScroll', '$templateCache', 'tubularOData',
        function ($scope, $location, $anchorScroll, $templateCache, tubularOData) {
            $scope.odata = tubularOData;
            $scope.source = [];
            $scope.tutorial = [
                {
                    title: 'Basic Layout with JSON datasource',
                    body: 'The next grid represents a basic layout, without any additional feature or special column. Just a plain grid using a JSON datasource.',
                    key: 'sample',
                    next: 'sample2'
                },
                {
                    title: 'Grid with Paginations using OData',
                    body: 'Now we are adding a new feature, the pagination. This demo is using an OData datasource.',
                    key: 'sample2',
                    next: 'sample3'
                },
                {
                    title: 'Grid with common features using OData',
                    body: 'In this sample, we can sort and filter columns. Press Ctrl key to sort by multiple columns.',
                    key: 'sample3',
                    next: 'sample4'
                },
                {
                    title: 'Inline editors (read-only)',
                    body: 'You can add inline editors just defining a Save URL and assigning some controls. This demo is read-only, but you can figure out.',
                    key: 'sample4',
                    next: null
                }
            ];

            $scope.$on('tbGrid_OnBeforeRequest', function(event, eventData) { console.log(eventData); });
            $scope.$on('tbGrid_OnSuccessfulUpdate', function(data) { toastr.success("Record updated"); });
            $scope.$on('tbGrid_OnRemove', function(data) { toastr.success("Record removed"); });
            $scope.$on('tbGrid_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });
            $scope.$on('tbGrid_OnSuccessfulForm', function(data) { $location.path('/'); });
            $scope.$on('tbGrid_OnSavingNoChanges', function(model) {
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

            $scope.scrollTo = function(id) {
                $location.hash(id);
                $anchorScroll();
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