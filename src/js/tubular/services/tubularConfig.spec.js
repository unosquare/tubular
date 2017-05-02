'use strict';

describe('Module: tubular.services', function () {

    describe('Provider: TubularConfig', function () {
        var TubularConfig;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularConfig_) {
                TubularConfig = _tubularConfig_;
            });
        });

        it('should be defined', function () {
            expect(TubularConfig).toBeDefined();
        });

        it('should load default config', function () {
            expect(TubularConfig.webApi).toBeDefined();
            expect(TubularConfig.webApi.baseUrl()).toBe('/api');
            expect(TubularConfig.webApi.enableRefreshTokens()).toBe(false);
            expect(TubularConfig.webApi.requireAuthentication()).toBe(true);
            expect(TubularConfig.webApi.refreshTokenUrl()).toBe('/api/token');
            expect(TubularConfig.webApi.tokenUrl()).toBe('/api/token');
        });

        it('should change config settings', function () {
            expect(TubularConfig.webApi).toBeDefined();

            expect(TubularConfig.webApi.baseUrl()).toBe('/api');
            TubularConfig.webApi.baseUrl('/apimodified');
            expect(TubularConfig.webApi.baseUrl()).toBe('/apimodified');
        });
    });
});