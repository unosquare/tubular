'use strict';

describe('Module: tubular.services', function () {

    describe('Service: http', function () {
        var $httpBackend, tubularHttp;

        beforeEach(function () {
            module('tubular.services');
            module(function ($filterProvider) {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter; });
            });

            inject(function (_$httpBackend_, _tubularHttp_) {
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
            });
        });

        it('should be defined', function () {
            expect(tubularHttp).toBeDefined();
        });

        it('should get same instance ', function () {
            expect(tubularHttp.getDataService()).toBe(tubularHttp);
        });

        it('should be not authenticated ', function () {
            expect(tubularHttp.isAuthenticated()).toBe(false);
        });

        it('should has default values', function () {
            expect(tubularHttp.useRefreshTokens).toBe(false);
            expect(tubularHttp.refreshTokenUrl).toBe('/api/token');
            expect(tubularHttp.tokenUrl).toBe('/api/token');
            expect(tubularHttp.apiBaseUrl).toBe('/api');
        });

        it('should set require authentication', function() {
            tubularHttp.setRequireAuthentication(true);
            expect(tubularHttp.requireAuthentication).toBe(true);
            tubularHttp.setRequireAuthentication(false);
            expect(tubularHttp.requireAuthentication).toBe(false);
        });

        it('should retrieve a promise when GET', function() {
            var getPromise = tubularHttp.get('/api/get');

            expect(getPromise).toBeDefined();
            expect(getPromise.promise).toBeDefined();
        });

        it('should retrieve data when GET', function (done) {
            $httpBackend.expectGET('/api/get').respond(200, { result: true });

            tubularHttp.setRequireAuthentication(false);
            tubularHttp.get('/api/get')
                .promise.then(function(data) {
                    expect(data).toBeDefined();
                    expect(data.result).toBe(true);
                    done();
                }, function (error) {
                    expect(error).toBeUndefined();
                });

            $httpBackend.flush();
        });

        it('should not retrieve data when GET', function (done) {
            $httpBackend.expectGET('/api/get').respond(500);

            tubularHttp.setRequireAuthentication(false);
            tubularHttp.get('/api/get')
                .promise.then(function () { }, function (error) {
                    expect(error).toBeDefined();
                    done();
                });

            $httpBackend.flush();
        });

        it('should authenticate', function (done) {
            $httpBackend.expectPOST('/api/token', function(data) {
                return data === 'grant_type=password&username=user&password=password';
            }).respond(200, { access_token: 'HOLA' });

            tubularHttp.authenticate('user', 'password', function(data) {
                expect(data).toBeDefined();
                done();
            }, function(error) {
                expect(error).toBeUndefined();
            });

            $httpBackend.flush();

            /*$scope.isAuthenticated = function () {
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
                };*/
        });
    });
});