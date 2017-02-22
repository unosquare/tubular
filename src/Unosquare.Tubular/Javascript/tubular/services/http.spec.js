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

            inject(function ($injector, _tubularHttp_) {
                $httpBackend = $injector.get('$httpBackend');

                $httpBackend.whenRoute('GET', '/api/get')
                    .respond(function () { return [200, { result: true }]; });
                tubularHttp = _tubularHttp_;
            });
        });

        it('should be defined', function () {
            expect(tubularHttp).toBeDefined();
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

        it('should retrieve data when GET', function () {
            tubularHttp.get('/api/get')
                .promise.then(function(data) {
                    expect(data).toBeDefined();
                    expect(data.result).toBe(true);
                });
        });
    });
});