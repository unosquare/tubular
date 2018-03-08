'use strict';

describe('Module: tubular.services', () => {

    describe('Service: http', () => {
        var $httpBackend, tubularHttp, tubularConfig, $window;

        beforeEach(() => {
            module('tubular.services');

            inject((_$httpBackend_, _tubularHttp_, _tubularConfig_, _$window_) => {
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
                tubularConfig = _tubularConfig_;
                $window = _$window_;
                tubularHttp.removeAuthentication();
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

        it('should use localStorage as default', done => {
            $httpBackend
                .expectPOST('/api/token', data => data === 'grant_type=password&username=user&password=password')
                .respond(200, { access_token: 'HOLA' });

            tubularHttp.authenticate('user', 'password').then(result => {
                expect(result).toBeDefined();
                expect(result.authenticated).toBe(true);
                expect(tubularHttp.userData.bearerToken).toBe('HOLA');
                expect(tubularHttp.isAuthenticated()).toBe(true);

                const authData = 'auth_data';
                const localPrefix = tubularConfig.localStorage.prefix();
                const sessionPrefix = tubularConfig.localStorage.prefix();

                expect($window.localStorage.getItem(localPrefix + authData)).toBeDefined;
                expect($window.sessionStorage.getItem(sessionPrefix + authData)).toBeUndefined;
                done();
            });

            $httpBackend.flush();
        });

        it('should use sessionStorage when specified', done => {

            tubularConfig.useSessionForAuthData(true);

            $httpBackend
                .expectPOST('/api/token', data => data === 'grant_type=password&username=user&password=password')
                .respond(200, { access_token: 'HOLA' });

            tubularHttp.authenticate('user', 'password').then(result => {
                expect(result).toBeDefined();
                expect(result.authenticated).toBe(true);
                expect(tubularHttp.userData.bearerToken).toBe('HOLA');
                expect(tubularHttp.isAuthenticated()).toBe(true);

                const authData = 'auth_data';
                const localPrefix = tubularConfig.localStorage.prefix();
                const sessionPrefix = tubularConfig.localStorage.prefix();

                expect($window.localStorage.getItem(localPrefix + authData)).toBeUndefined;
                expect($window.sessionStorage.getItem(sessionPrefix + authData)).toBeDefined;
                done();
            });

            $httpBackend.flush();
        });
    });
});
