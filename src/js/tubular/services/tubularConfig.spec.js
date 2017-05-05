'use strict';

describe('Module: tubular.services', () => {

    describe('Provider: TubularConfig', () => {
        var TubularConfig;

        beforeEach(() => {
            module('tubular.services');

            inject(_tubularConfig_ => TubularConfig = _tubularConfig_);
        });

        it('should be defined', () => {
            expect(TubularConfig).toBeDefined();
        });

        it('should load default config', () => {
            expect(TubularConfig.webApi).toBeDefined();
            expect(TubularConfig.webApi.baseUrl()).toBe('/api');
            expect(TubularConfig.webApi.enableRefreshTokens()).toBe(false);
            expect(TubularConfig.webApi.requireAuthentication()).toBe(true);
            expect(TubularConfig.webApi.refreshTokenUrl()).toBe('/api/token');
            expect(TubularConfig.webApi.tokenUrl()).toBe('/api/token');
        });

        it('should change config settings', () => {
            expect(TubularConfig.webApi).toBeDefined();

            expect(TubularConfig.webApi.baseUrl()).toBe('/api');
            TubularConfig.webApi.baseUrl('/apimodified');
            expect(TubularConfig.webApi.baseUrl()).toBe('/apimodified');
        });
    });
});