(function() {
    'use strict';

    angular.module('testApp.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/tbGridPagerTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbGridPager_tests.html',
                        title: 'Tubular Grid Pager (and related) Tests'
                    })
                    .when('/tbColumnTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbColumn_tests.html',
                        title: 'Tubular Column Tests'
                    })
                    .when('/tbFiltersTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFilters_tests.html',
                        title: 'Tubular Column Tests'
                    })
                    .when('/tbFormTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbForm_tests.html',
                        title: 'Tubular Form Tests'
                    })
                    .when('/tbFormSavingTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFormSaving_tests.html',
                        title: 'Tubular Form Saving Tests'
                    })
                    .when('/tbGridComponentsTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbGridComponent_tests.html',
                        title: 'Tubular Grid Components Tests'
                    })
                    .when('/tbODataTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbOData_tests.html',
                        title: 'Tubular Grid OData Tests'
                    })
                    .when('/tbLocalDataTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbLocalData_tests.html',
                        title: 'Tubular Grid Local Data Tests'
                    })
                    .when('/tbSingleFormTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbSingleForm_tests.html',
                        title: 'Tubular Single Form Tests'
                    })
                    .when('/Login', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/login.html',
                        title: 'Login'
                    })
                    .when('/tbFormConnErrorNoModelKeyTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFormConnErrorNoModelKey_tests.html',
                        title: 'Tubular Form Loading Test'
                    })
                    .when('/tbFormConnErrorNoServerUrlTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFormConnErrorNoServerUrl_tests.html',
                        title: 'Tubular Form Loading Test'
                    })
                    .when('/tbFormConnErrorNoServerUrlTests2',{
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFormConnErrorNoServerUrl_tests2.html',
                        title: 'Tubular Form Loading Test 2'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]).controller("tbFormCtrl", function($scope) {
            $scope.$on('tbForm_OnSuccessfulSave', function(event, data, form) {
                toastr.success(data || "Updated");
                alert("saved");
            });
            $scope.$on('tbForm_OnConnectionError', function(event, data) {
                $scope.Error = "No data found";
                toastr.error('No data found');
            });
        }).controller('LoginCtrl', ['$scope', '$location', 'tubularHttp', function ($scope, $location, tubularHttp) {
            $scope.loading = false;
            tubularHttp.tokenUrl = '/token';

            $scope.submitForm = function (valid) {
                if (valid == false) {
                    toastr.error("Please complete form");
                }

                $scope.loading = true;

                tubularHttp.authenticate($scope.username, $scope.password, $scope.redirectHome, function (error) {
                    $scope.loading = false;
                    toastr.error(error);
                }, true);
            };

            $scope.redirectHome = function () {
                $location.path("/");
            };
        }]).controller("navCtrl", function($scope) {
            // TODO: Check login info
        }).controller('onSaved',function($scope){
        $scope.$on('tbForm_OnSuccessfulSave', function(event, data, form) {
                $scope.svText = "Saved";
            });
        });

    angular.module('app', [
        'tubular',
        'testApp.routes'
    ]);
})();