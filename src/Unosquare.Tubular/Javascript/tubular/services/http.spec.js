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

        it('should get same instance ', () => {
            expect(tubularHttp.getDataService()).toBe(tubularHttp);
        });

        it('should be not authenticated ', () => {
            expect(tubularHttp.isAuthenticated()).toBe(false);
        });

        it('should has default refreshTokenUrl value', () => {
            expect(tubularHttp.refreshTokenUrl).toBe('/api/token');
        });

        it('should has default tokenUrl value', () => {
            expect(tubularHttp.tokenUrl).toBe('/api/token');
        });

        it('should has default apiBaseUrl value', () => {
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

        it('should retrieve data when GET', done => {
            $httpBackend.expectGET('/api/get').respond(200, { result: true });

            tubularHttp.setRequireAuthentication(false);
            tubularHttp.get('/api/get')
                .promise.then(data => {
                    expect(data).toBeDefined();
                    expect(data.result).toBe(true);
                    done();
                }, error => expect(error).toBeUndefined());

            $httpBackend.flush();
        });

        it('should not retrieve data when GET', done => {
            $httpBackend.expectGET('/api/get').respond(500);

            tubularHttp.setRequireAuthentication(false);
            tubularHttp.get('/api/get')
                .promise.then(function () { }, error => {
                    expect(error).toBeDefined();
                    done();
                });

            $httpBackend.flush();
        });

        it('should authenticate', done => {
            $httpBackend.expectPOST('/api/token', data => {
                return data === 'grant_type=password&username=user&password=password';
            }).respond(200, { access_token: 'HOLA' });

            tubularHttp.authenticate('user', 'password', data => {
                expect(data).toBeDefined();
                expect(tubularHttp.isAuthenticated()).toBe(true);
                done();
            }, error => expect(error).toBeUndefined());

            $httpBackend.flush();
        });
    });
});