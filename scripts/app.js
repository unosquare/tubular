(function () {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/Basic', {
                        templateUrl: 'assets/home.html',
                    }).when('/WebApi', {
                        templateUrl: 'assets/webapi.html',
                    }).when('/Generator', {
                        templateUrl: 'assets/generator.html',
                    }).otherwise({
                        redirectTo: '/'
                    });

                //$locationProvider.html5Mode(true);
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
                    body: 'First grid shows a basic layout, without any additional feature or special column. Just a plain grid using a JSON datasource.',
                    key: 'sample',
                    next: 'sample2'
                },
                {
                    title: 'Grid with Paginations using OData',
                    body: 'Adding a new feature: the pagination. This demo is using an OData datasource and you can move across the pages and change the size.',
                    key: 'sample2',
                    next: 'sample3'
                },
                {
                    title: 'Grid with common features using OData',
                    body: 'The grid can be extended to include features like sorting and filtering. Press Ctrl key to sort by multiple columns.',
                    key: 'sample3',
                    next: 'sample4'
                },
                {
                    title: 'Free-text search',
                    body: 'Adding a "searchable" attribute to your columns and you can perform free-text searches.',
                    key: 'sample4',
                    next: 'sample5'
                },
                {
                    title: 'Inline editors (read-only)',
                    body: 'You can add inline editors just defining a Save URL and assigning some controls. This demo is read-only, but you can get the idea.',
                    key: 'sample5',
                    next: null
                }
            ];

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
        ]).controller('tubularGeneratorCtrl', ['$scope', function($scope) {
        $scope.generate = function() {
            //$templateCache.put('tubulartemplate', result);
        }
    }]);

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