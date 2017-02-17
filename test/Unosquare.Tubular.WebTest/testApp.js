(function () {
    'use strict';

    angular.module('testApp.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider',
            function ($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/tbGridPagerTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbGridPager_tests.html',
                        title: 'Tubular Grid Pager (and related) Tests'
                    })
                    .when('/tbColumnTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbColumn_tests.html',
                        title: 'Tubular Column Tests'
                    })
                    .when('/tbFiltersTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbFilters_tests.html',
                        title: 'Tubular Column Tests'
                    })
                    .when('/tbFormTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbForm_tests.html',
                        title: 'Tubular Form Tests'
                    })
                    .when('/tbFormSavingTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbFormSaving_tests.html',
                        title: 'Tubular Form Saving Tests'
                    })
                    .when('/tbGridComponentsTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbGridComponent_tests.html',
                        title: 'Tubular Grid Components Tests'
                    })
                    .when('/tbSingleFormTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbSingleForm_tests.html',
                        title: 'Tubular Single Form Tests'
                    })
                    .when('/tbEmptyFormTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbEmptyForm_tests.html',
                        title: 'Tubular Empty Form Tests'
                    })
                    .when('/Login', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/login.html',
                        title: 'Login'
                    })
                    .when('/tbFormConnErrorNoModelKeyTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbFormConnErrorNoModelKey_tests.html',
                        title: 'Tubular Form Loading Test'
                    })
                    .when('/tbFormConnErrorNoServerUrlTests', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbFormConnErrorNoServerUrl_tests.html',
                        title: 'Tubular Form Loading Test'
                    })
                    .when('/expirationDate', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/expiration.html',
                        title: 'expiration test'
                    })
                    .when('/tbRowSelectable', {
                        templateUrl: '/test/Unosquare.Tubular.WebTest/common/tbRowSelectable.html',
                        title: 'selectedRows clearSelection isEmptySelection'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ])
        .controller("tbFormCtrl", function ($scope) {
            $scope.$on('tbForm_OnSuccessfulSave', function (event, data) {
                toastr.success(data || "Updated");
                alert("saved");
            });
            $scope.$on('tbForm_OnConnectionError', function (event, data) {
                $scope.Error = "No data found";
                toastr.error('No data found');
            });
        }).controller('LoginCtrl', [
            '$scope', '$location', 'tubularHttp',
            function ($scope, $location, tubularHttp) {
                $scope.loading = false;
                tubularHttp.tokenUrl = 'http://tubular.azurewebsites.net/api/token';

                $scope.submitForm = function () {
                    $scope.loading = true;

                    tubularHttp.authenticate($scope.username,
                        $scope.password,
                        function () { $location.path("/expirationDate"); },
                        function (error) {
                            $scope.isAuth = tubularHttp.isAuthenticated();
                            $scope.loading = false;
                            toastr.error(error);
                            $location.path("/expirationDate");
                        });
                };
            }
        ]).controller('GridCtrl', [
            '$scope', '$location', 'tubularHttp',
            function ($scope, $location, tubularHttp) {
                $scope.loading = false;
                tubularHttp.useRefreshTokens = true;
                tubularHttp.setRefreshTokenUrl('http://tubular.azurewebsites.net/api/token');
                tubularHttp.setTokenUrl('http://tubular.azurewebsites.net/api/token');
                tubularHttp.setApiBaseUrl('http://tubular.azurewebsites.net/api');

                $scope.submitForm = function () {
                    $scope.loading = true;

                    tubularHttp.authenticate($scope.username,
                        $scope.password,
                        function () { $location.path("/expirationDate"); },
                        function (error) {
                            $scope.isAuth = tubularHttp.isAuthenticated();
                            $scope.loading = false;
                            toastr.error(error);
                            $location.path("/expirationDate");
                        });
                };
            }
        ]).controller("navCtrl", function () {
            // TODO: Check login info
        }).controller('onSaved', function ($scope) {
            $scope.$on('tbForm_OnSuccessfulSave', function () {
                $scope.textSave = "Saved";
            });

        }).controller('expDate', [
            '$scope', 'tubularHttp', 'localStorageService',
            function ($scope, tubularHttp, localStorageService) {
                tubularHttp.setRefreshTokenUrl('http://tubular.azurewebsites.net/api/token');
                tubularHttp.setTokenUrl('http://tubular.azurewebsites.net/api/token');
                tubularHttp.setApiBaseUrl('http://tubular.azurewebsites.net/api');

                $scope.isAuthenticated = function () {
                    console.log("Auth", tubularHttp.isAuthenticated());
                    if (tubularHttp.isAuthenticated()) {
                        $scope.isAuth = "Is Authenticated";
                        return true;
                    } else {
                        $scope.isAuth = "Not Authenticated";
                        return false;
                    }
                };

                $scope.expireAccessToken = function () {
                    $scope.accessToken = tubularHttp.userData.bearerToken;
                    tubularHttp.setRequireAuthentication(true);
                    tubularHttp.setAccessTokenAsExpired();
                }

                $scope.removeAuthentication = function () {
                    tubularHttp.removeAuthentication();

                    tubularHttp.setRequireAuthentication(true);

                    if (tubularHttp.isAuthenticated()) {
                        $scope.redirected = "Authenticated";
                    } else {
                        $scope.redirected = "Not Authenticated";
                    }
                };
                $scope.retrieveData = function () {
                    var retData = tubularHttp.userData;
                    var savedDat = localStorageService.get('auth_data');
                    $scope.retSavData = retData.username === savedDat.username;
                    $scope.refreshToken = retData.refreshToken;
                };

                $scope.getTest = function () {
                    var getObject = tubularHttp.get('http://tubular.azurewebsites.net/api/orders/53');
                    if (getObject.cancel != null) {
                        $scope.getLog = "cancel";
                    }

                };

                $scope.postTest = function () {
                    tubularHttp.post('http://tubular.azurewebsites.net/api/orders/53', { 'ShipperCity': 'California' }).promise.then(function (data) {
                        $scope.postLog = data || 'null';
                    });
                };

                $scope.useRefreshToken = function () {
                    tubularHttp.setRefreshTokenUrl('http://tubular.azurewebsites.net/token');
                    tubularHttp.setTokenUrl('http://tubular.azurewebsites.net/token');
                    tubularHttp.setApiBaseUrl('http://tubular.azurewebsites.net/api');
                    tubularHttp.useRefreshTokens = true;

                    $scope.accessToken = tubularHttp.userData.bearerToken;
                    tubularHttp.setRequireAuthentication(true);
                    tubularHttp.setAccessTokenAsExpired();

                    console.log("Before going: ", tubularHttp.apiBaseUrl);

                    tubularHttp.useRefreshTokens = true;
                    var response = tubularHttp.get('http://tubular.azurewebsites.net/api/orders/10');

                    response.promise.then(function (data) {
                        console.log("Order", data);
                        $scope.accessToken = tubularHttp.userData.bearerToken;
                    });
                };
            }
        ]).controller('rwController', [
            '$scope', 'localStorageService',
            function ($scope, localStorageService) {
                $scope.selectRows = function () {
                    var rows = localStorageService.get('sampleshap1_rows');
                    $scope.rows = rows.length;
                };
            }
        ]).controller('tbColumnCtrl', [
            '$scope', 'localStorageService',
            function ($scope, localStorageService) {
                $scope.clearStorage = function () {
                    localStorageService.clearAll();
                };
            }
        ]);

    angular.module('app', [
        'tubular',
        'testApp.routes'
    ]);
})();