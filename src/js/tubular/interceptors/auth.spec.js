'use strict';

describe('Module: tubular.services', function () {

    describe('Interceptor: Auth', function () {
        var AuthInterceptor, $httpBackend, tubularHttp, tubularConfig, $rootScope;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularAuthInterceptor_, _$httpBackend_, _tubularHttp_, _tubularConfig_, _$rootScope_) {
                AuthInterceptor = _tubularAuthInterceptor_;
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
                tubularConfig = _tubularConfig_;
                $rootScope = _$rootScope_;
            });
        });

        it('should be defined', function () {
            expect(AuthInterceptor).toBeDefined();
            expect(AuthInterceptor.request).toBeDefined();
            expect(AuthInterceptor.requestError).toBeDefined();
            expect(AuthInterceptor.response).toBeDefined();
            expect(AuthInterceptor.responseError).toBeDefined();
        })

        it('should not add any authorization header for tokenUrl', function () {
            var config = {
                method: 'GET',
                url: '/api/token'
            };

            tubularConfig.webApi.tokenUrl('/api/token');
            tubularConfig.webApi.requireAuthentication(true);
            tubularHttp.userData.bearerToken = "yeah";

            var actual = AuthInterceptor.request(config);

            expect(actual.headers).toBeDefined();
            expect(actual.headers.Authorization).toBeUndefined();
        });

        all('should not add any authorization header for static files', ['html', 'htm', 'js', 'css'], function (extension) {
            var config = {
                method: 'GET',
                url: '/api/archivo.' + extension + '/?nocache=12345'
            };
            tubularConfig.webApi.tokenUrl('/api/token');
            tubularConfig.webApi.requireAuthentication(true);
            tubularHttp.userData.bearerToken = "yeah";

            var actual = AuthInterceptor.request(config);

            expect(actual.headers).toBeDefined();
            expect(actual.headers.Authorization).toBeUndefined();
        });

        it('should NOT add authorization header (Unauthenticated user)', function () {
            var config = {
                method: 'GET',
                url: '/api/dummy'
            };
            tubularConfig.webApi.tokenUrl('/api/token');
            tubularConfig.webApi.requireAuthentication(true);

            var actual = AuthInterceptor.request(config)

            expect(actual.headers).toBeUndefined();
        });

        it('should NOT try to use refresh tokens', done => {
            var config = {
                method: 'GET',
                url: '/api/dummy',
                headers: {
                }
            };

            var rejection = {
                config: config,
                status: 401
            };

            expect(tubularConfig.webApi.enableRefreshTokens()).toBe(false);

            tubularHttp.userData.bearerToken = "newOne";
            expect(rejection.triedRefreshTokens).toBeUndefined();

            AuthInterceptor
                .responseError(rejection)
                .then(function () { }, rejection => {
                    expect(rejection).toBeDefined();
                    expect(rejection.triedRefreshTokens).toBeUndefined();

                    done();
                });

            $rootScope.$digest();
        });

        it('should try to use refresh tokens', done => {
            var config = {
                method: 'GET',
                url: '/api/dummy',
                headers: {
                }
            };

            var rejection = {
                config: config,
                status: 401
            };

            expect(tubularConfig.webApi.enableRefreshTokens()).toBe(false, 'Should not use refresh tokens by default');

            tubularConfig.webApi.enableRefreshTokens(true);
            tubularHttp.userData.isAuthenticated = true;
            tubularHttp.userData.expirationDate = new Date((new Date()).getTime() - 10000)
            tubularHttp.userData.refreshToken = 'original_refresh';
            tubularHttp.userData.bearerToken = "original_bearer";

            expect(rejection.triedRefreshTokens).toBeUndefined();

            $httpBackend.expectPOST(tubularConfig.webApi.refreshTokenUrl(), data => {
                return data === 'grant_type=refresh_token&refresh_token=' + tubularHttp.userData.refreshToken;
            }).respond(200, { access_token: 'modified_bearer', refresh_token: 'modified_refresh', expires_in : 14399 });

            $httpBackend.expectGET(/.*?api\/dummy?.*/).respond(200);

            AuthInterceptor
                .responseError(rejection)
                .then(function (resp) {
                    expect(resp).toBeDefined();
                    expect(tubularHttp.userData.bearerToken).not.toBe('original_bearer', 'Bearer Token was not modified');
                    expect(tubularHttp.userData.refreshToken).not.toBe('original_refresh', 'Refresh Token was not modified');
                    done();
                }, rejection => {

                });

            $httpBackend.flush();
            $rootScope.$digest();
        });

        it('should reject with 401 when refresh token not working', done => {
            var config = {
                method: 'GET',
                url: '/api/dummy',
                headers: {
                }
            };

            var rejection = {
                config: config,
                status: 401
            };

            expect(tubularConfig.webApi.enableRefreshTokens()).toBe(false, 'Should not use refresh tokens by default');

            tubularConfig.webApi.enableRefreshTokens(true);
            tubularHttp.userData.isAuthenticated = true;
            tubularHttp.userData.expirationDate = new Date((new Date()).getTime() - 10000);
            tubularHttp.userData.refreshToken = 'original_refresh';
            tubularHttp.userData.bearerToken = "original_bearer";

            expect(rejection.triedRefreshTokens).toBeUndefined();

            $httpBackend.expectPOST(tubularConfig.webApi.refreshTokenUrl(), data => {
                return data === 'grant_type=refresh_token&refresh_token=' + tubularHttp.userData.refreshToken;
            }).respond(401, { access_token: 'modified_bearer', refresh_token: 'modified_refresh' });

            AuthInterceptor
                .responseError(rejection)
                .then(function (resp) {
                    expect(resp).toBeUndefined();
                    done();
                }, rejection => {
                    expect(rejection).toBeDefined();
                    expect(tubularHttp.userData.bearerToken).toBe('');
                    done();
                });

            $httpBackend.flush();
            $rootScope.$digest();
        });
    });
});
