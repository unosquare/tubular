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
                }).finally(done);

            $httpBackend.flush();
        });

        it('should not retrieve data when GET', function (done) {
            $httpBackend.expectGET('/api/get').respond(500);

            tubularHttp.setRequireAuthentication(false);
            tubularHttp.get('/api/get')
                .promise.then(function () { }, function (error) {
                    expect(error).toBeDefined();
                }).finally(done);

            $httpBackend.flush();
        });

        it('should authenticate', function () {
            $httpBackend.expectPOST('/api/token', function(data) {
                return data === 'grant_type=password&username=user&password=password';
            }).respond(200, { access_token: 'HOLA' });

            tubularHttp.authenticate('user', 'password', function(data) {
                expect(data).toBeDefined();
            }, function(error) {
                expect(error).toBeUndefined();
            });

            $httpBackend.flush();
        });
    });
});