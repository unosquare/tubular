'use strict';

describe('Module: tubular.services', () => {

    describe('Interceptor: NoCache', () => {
        var NoCacheInterceptor, tubularConfig;

        beforeEach(() => {
            module('tubular.core');
            module('tubular.services');

            inject(function (_tubularNoCacheInterceptor_, _tubularConfig_) {
                NoCacheInterceptor = _tubularNoCacheInterceptor_;
                tubularConfig = _tubularConfig_;
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

        all('should not add noCache to bypassed urls', ['html/nocache1', 'html/nocache2'], function (url) {
            var config = {
                method: 'GET',
                url: '/' + url + '?someendpoint=true'
            };

            tubularConfig.webApi.noCacheBypassUrls({ html: ['html/nocache1'], html2: ['html/nocache2'] });

            var actual = NoCacheInterceptor.request(config);

            expect(actual.url.length).toEqual(config.url.length);
        });
    });
});
