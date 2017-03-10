﻿'use strict';

describe('Module: tubular.services', function () {

    describe('Service: http', function () {
        var $httpBackend, tubularHttp, tubularConfig;

        beforeEach(function () {
            module('tubular.services');
            module(function ($filterProvider) {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter; });
            });

            inject(function (_$httpBackend_, _tubularHttp_, _tubularConfig_) {
                $httpBackend = _$httpBackend_;
                tubularHttp = _tubularHttp_;
                tubularConfig = _tubularConfig_;
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

        it('should retrieve a promise when GET', function() {
            var getPromise = tubularHttp.get('/api/get');

            expect(getPromise).toBeDefined();
            expect(getPromise.promise).toBeDefined();
        });

        it('should retrieve data when GET', done => {
            $httpBackend.expectGET('/api/get').respond(200, { result: true });

            tubularConfig.webApi.requireAuthentication(false);

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

            tubularConfig.webApi.requireAuthentication(false);
            
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