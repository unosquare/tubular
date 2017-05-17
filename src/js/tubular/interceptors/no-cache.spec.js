'use strict';

describe('Module: tubular.services', () => {

    describe('Interceptor: NoCache', () => {
        var NoCacheInterceptor;

        beforeEach(() => {
            module('tubular.services');

            inject(function (_tubularNoCacheInterceptor_) {
                NoCacheInterceptor = _tubularNoCacheInterceptor_;
            });
        });

        it('should be defined', () => {
            expect(NoCacheInterceptor).toBeDefined();
            expect(NoCacheInterceptor.request).toBeDefined();
        })

        it('should add no cache', () => {
            var config = {
                method: 'GET',
                url: '/api/sample'
            };

            var actual = NoCacheInterceptor.request(config);

            expect(actual.url.indexOf('noCache=')).toBeGreaterThan(-1);
        });

        it('should not add no cache with POST', () => {
            var config = {
                method: 'POST',
                url: '/api/sample'
            };

            var actual = NoCacheInterceptor.request(config);

            expect(actual.url.length).toEqual(config.url.length);
        });

        it('should not add no cache again', () => {
            var config = {
                method: 'GET',
                url: '/api/sample?noCache=200'
            };

            var actual = NoCacheInterceptor.request(config);

            expect(actual.url.length).toEqual(config.url.length);
        });
    });
});
