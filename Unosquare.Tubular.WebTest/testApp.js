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
                    .when('/tbEmptyFormTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbEmptyForm_tests.html',
                        title: 'Tubular Empty Form Tests'
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
                    .when('/tbFormConnErrorNoServerUrlTests2', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFormConnErrorNoServerUrl_tests2.html',
                        title: 'Tubular Form Loading Test 2'
                    })
                    .when('/expirationDate', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/expiration.html',
                        title: 'expiration test'
                    })
                    .when('/tbRowSelectable', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbRowSelectable.html',
                        title: 'selectedRows clearSelection isEmptySelection'
                    })
                    .when('/tbFormMoment',{
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFormMoment.html',
                        title: 'Date Moment'
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
        }).controller('LoginCtrl', [
            '$scope', '$location', 'tubularHttp', function($scope, $location, tubularHttp) {
                $scope.loading = false;
                tubularHttp.tokenUrl = 'http://tubular.azurewebsites.net/token';
                $scope.submitForm = function(valid) {
                    if (valid == false) {
                        toastr.error("Please complete form");
                    }

                    $scope.loading = true;

                    tubularHttp.authenticate($scope.username, $scope.password, $scope.redirectHome, function(error) {
                        var resul = tubularHttp.isAuthenticated();
                        $scope.isAuth = resul;
                        $scope.loading = false;
                        toastr.error(error);
                    }, true);
                };

                $scope.redirectHome = function() {
                    $location.path("/expirationDate");
                };
            }
        ]).controller("navCtrl", function($scope) {
            // TODO: Check login info
        }).controller('onSaved', function($scope) {
            $scope.$on('tbForm_OnSuccessfulSave', function() {
                $scope.textSave = "Saved";
            });

        }).controller('expDate', [
            '$scope', 'tubularHttp', 'localStorageService', '$location', function($scope, tubularHttp, localStorageService, $location) {
                $scope.isAuthenticated = function() {
                    if (tubularHttp.isAuthenticated()) {
                        $scope.isAuth = "is Authenticated!";
                        return true;
                    } else {
                        $scope.isAuth = "is not Authenticated :(";
                        return false;
                    }
                };
                $scope.changeExpirationDate = function() {
                    localStorageService.clearAll();
                    tubularHttp.setRequireAuthentication(true);
                    tubularHttp.userData.expirationDate = null;
                    $location.path("/expirationDate");

                    if (tubularHttp.isAuthenticated()) {
                        $scope.redirected = "Authenticated";
                    } else {
                        $scope.redirected = "Not Authenticated";
                    }
                };
                $scope.retrieveData = function() {
                    var retData = tubularHttp.userData;
                    var savedDat = localStorageService.get('auth_data');
                    $scope.retSavData = retData.username === savedDat.username;
                };
                $scope.getTest = function() {
                    var getObject = tubularHttp.get('http://tubular.azurewebsites.net/api/orders/53');
                    if (getObject.cancel != null) {
                        $scope.getLog = "cancel";
                    }
                };
                $scope.postTest = function() {
                    tubularHttp.post('http://tubular.azurewebsites.net/api/orders/53', { 'ShipperCity': 'California' }).promise.then(function(data) {
                        if (data == null) {
                            $scope.postLog = 'null';
                        } else {
                            $scope.postLog = data;
                        }
                    });
                };
            }
        ]).controller('rwController', [
            '$scope', 'localStorageService', function($scope, localStorageService) {
                $scope.selectRows = function() {
                    var rows = localStorageService.get('sampleshap1_rows');
                        $scope.rows = rows.length;
                };
            }
        ]);

    angular.module('app', [
        'tubular',
        'testApp.routes'
    ]);
})();