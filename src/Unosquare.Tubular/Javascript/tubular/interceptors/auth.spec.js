'use strict';

describe('Module: tubular.services', function () {

    describe('Interceptor: Auth', function () {
        var AuthInterceptor, $httpBackend, tubularHttp, tubularConfig;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularAuthInterceptor_, _$httpBackend_, _tubularHttp_, _tubularConfig_) {
                AuthInterceptor = _tubularAuthInterceptor_;
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
                tubularConfig = _tubularConfig_;
            });
        });

        it('should be defined', function () {
            expect(AuthInterceptor).toBeDefined();
            expect($httpBackend).toBeDefined();
            expect(tubularConfig).toBeDefined();
            expect(AuthInterceptor.request).toBeDefined();
            expect(AuthInterceptor.requestError).toBeDefined();
            expect(AuthInterceptor.response).toBeDefined();
            expect(AuthInterceptor.responseError).toBeDefined();
        })

        it('should not add any authorization header', function () {
            var config = {
                method: 'GET',
                url: '/other/file.html'
            };

            expect(AuthInterceptor.request(config).headers).toBeDefined();
            expect(AuthInterceptor.request(config).headers.Authorization).toBeUndefined();
        });

        it('should add authorization header', function () {
            var config = {
                method: 'GET',
                url: '/api/dummy'
            };

            tubularConfig.webApi.requireAuthentication(true);
            tubularHttp.userData.bearerToken = "yeah";

            expect(AuthInterceptor.request(config).headers).toBeDefined();
            expect(AuthInterceptor.request(config).headers.Authorization).toBeDefined();
            expect(AuthInterceptor.request(config).headers.Authorization).toContain('yeah');
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

            $httpBackend.flush();
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

            expect(tubularConfig.webApi.enableRefreshTokens()).toBe(false);

            tubularConfig.webApi.enableRefreshTokens(true);
            tubularHttp.userData.refreshToken = 'original_refresh';

            tubularHttp.userData.bearerToken = "original_bearer";
            expect(rejection.triedRefreshTokens).toBeUndefined();

            $httpBackend.expectPOST(tubularConfig.webApi.refreshTokenUrl(), data => {
                return data === 'grant_type=refresh_token&refresh_token=' + tubularHttp.userData.refreshToken;
            }).respond(200, { access_token: 'modified_bearer', refresh_token: 'modified_refresh' });

            $httpBackend.expectGET('/api/dummy').respond(200);

            AuthInterceptor
                .responseError(rejection)
                .then(function (resp) {
                    expect(resp).toBeDefined();
                    expect(tubularHttp.userData.bearerToken).not.toBe('original_bearer');
                    expect(tubularHttp.userData.refreshToken).not.toBe('original_refresh');
                    done();
                }, rejection => {

                });

            $httpBackend.flush();
        });
    });
});