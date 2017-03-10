'use strict';

describe('Module: tubular.services', () => {

    describe('Service: http', () => {
        var $httpBackend, tubularHttp, tubularConfig;

        beforeEach(function () {
            module('tubular.services');
            module(function ($filterProvider) {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', () => filter);
            });

            inject(function (_$httpBackend_, _tubularHttp_, _tubularConfig_) {
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
                tubularConfig = _tubularConfig_;
            });
        });

        it('should be defined', () => {
            expect(tubularHttp).toBeDefined();
        });

        it('should get same instance ', () => {
            expect(tubularHttp.getDataService()).toBe(tubularHttp);
        });

        it('should be not authenticated ', () => {
            expect(tubularHttp.isAuthenticated()).toBe(false);
        });

        it('should retrieve a promise when GET', () => {
            var getPromise = tubularHttp.get('/api/get');

            expect(getPromise).toBeDefined();
        });

        it('should retrieve data when GET', done => {
            $httpBackend.expectGET('/api/get').respond(200, { result: true });

            tubularConfig.webApi.requireAuthentication(false);

            tubularHttp.get('/api/get').then(data => {
                expect(data).toBeDefined();
                expect(data.result).toBe(true);
                done();
            }, error => expect(error).toBeUndefined());

            $httpBackend.flush();
        });

        it('should not retrieve data when GET', done => {
            $httpBackend.expectGET('/api/get').respond(500);

            tubularConfig.webApi.requireAuthentication(false);

            tubularHttp.get('/api/get').then(() => { }, error => {
                expect(error).toBeDefined();
                done();
            });

            $httpBackend.flush();
        });

        it('should authenticate', done => {
            $httpBackend
                .expectPOST('/api/token', data => data === 'grant_type=password&username=user&password=password')
                .respond(200, { access_token: 'HOLA' });

            tubularHttp.authenticate('user', 'password').then(result => {
                expect(result).toBeDefined();
                expect(result.authenticated).toBe(true);
                expect(tubularHttp.userData.bearerToken).toBe('HOLA');
                expect(tubularHttp.isAuthenticated()).toBe(true);
                done();
            });

            $httpBackend.flush();
        });

        it('should NOT authenticate', done => {
            $httpBackend
                .expectPOST('/api/token', data => data === 'grant_type=password&username=user&password=password')
                .respond(500, { error: 'WHAT' });

            tubularHttp.authenticate('user', 'password').then(result => {
                expect(result).toBeDefined();
                expect(result.authenticated).toBe(true);
                expect(tubularHttp.userData.bearerToken).toBe('HOLA');
                expect(tubularHttp.isAuthenticated()).toBe(true);
                done();
            }, error => {
                expect(error).toBeDefined();
                expect(error.status).toBeDefined();
                done();
            });

            $httpBackend.flush();
        });
    });
});