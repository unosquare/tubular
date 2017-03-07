'use strict';

describe('Module: tubular.services', function () {

    describe('Interceptor: Auth', function () {
        var AuthInterceptor, $httpBackend, tubularHttp;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularAuthInterceptor_, _$httpBackend_, _tubularHttp_) {
                AuthInterceptor = _tubularAuthInterceptor_;
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
            });
        });

        it('should be defined', function () {
            expect(AuthInterceptor).toBeDefined();
            expect($httpBackend).toBeDefined();
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

            tubularHttp.setRequireAuthentication(true);
            tubularHttp.userData.bearerToken = "yeah";

            expect(AuthInterceptor.request(config).headers).toBeDefined();
            expect(AuthInterceptor.request(config).headers.Authorization).toBeDefined();
            expect(AuthInterceptor.request(config).headers.Authorization).toContain('yeah');
        });
    });
});