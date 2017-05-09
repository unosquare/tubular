'use strict';

describe('Module: tubular.services', () => {

    describe('Service: http', () => {
        var $httpBackend, tubularHttp, tubularConfig;

        beforeEach(() => {
            module('tubular.services');
            module(($filterProvider) => {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', () => filter);
            });

            inject((_$httpBackend_, _tubularHttp_, _tubularConfig_) => {
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
                tubularConfig = _tubularConfig_;
            });
        });

        it('should be defined', () => expect(tubularHttp).toBeDefined());

        it('should be not authenticated ', () => expect(tubularHttp.isAuthenticated()).toBe(false));

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
                expect(result).toBeUndefined();
                done();
            }, error => {
                expect(error).toBeDefined();
                done();
            });

            $httpBackend.flush();
        });
    });
});
