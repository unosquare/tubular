(angular => {
    'use strict';

    angular.module('tubular.services')
        .provider('tubularConfig', function () {

            var provider = this;
            provider.platform = {};
            var PLATFORM = 'platform';

            var configProperties = {
                webApi: {
                    tokenUrl: PLATFORM,
                    refreshTokenUrl: PLATFORM,
                    enableRefreshTokens: PLATFORM,
                    requireAuthentication: PLATFORM,
                    baseUrl: PLATFORM
                },
                platform: {},
                localStorage: {
                    prefix: PLATFORM
                }
            };

            createConfig(configProperties, provider, '');

            // Default
            // -------------------------
            setPlatformConfig('default', {
                webApi: {
                    tokenUrl: '/api/token',
                    refreshTokenUrl: '/api/token',
                    enableRefreshTokens: false,
                    requireAuthentication: true,
                    baseUrl: '/api'
                },
                localStorage: {
                    prefix: 'tubular.'
                }
            });

            // private: used to set platform configs
            function setPlatformConfig(platformName, platformConfigs) {
                configProperties.platform[platformName] = platformConfigs;
                provider.platform[platformName] = {};

                addConfig(configProperties, configProperties.platform[platformName]);

                createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
            }


            // add new platform configs
            function addConfig(configObj, platformObj) {
                for (var n in configObj) {
                    if (n != PLATFORM && configObj.hasOwnProperty(n)) {
                        if (angular.isObject(configObj[n])) {
                            if (angular.isUndefined(platformObj[n])) {
                                platformObj[n] = {};
                            }
                            addConfig(configObj[n], platformObj[n]);

                        } else if (angular.isUndefined(platformObj[n])) {
                            platformObj[n] = null;
                        }
                    }
                }
            }


            // create get/set methods for each config
            function createConfig(configObj, providerObj, platformPath) {
                angular.forEach(configObj, function (value, namespace) {

                    if (angular.isObject(configObj[namespace])) {
                        // recursively drill down the config object so we can create a method for each one
                        providerObj[namespace] = {};
                        createConfig(configObj[namespace], providerObj[namespace], platformPath + '.' + namespace);

                    } else {
                        // create a method for the provider/config methods that will be exposed
                        providerObj[namespace] = function (newValue) {
                            if (arguments.length) {
                                configObj[namespace] = newValue;
                                return providerObj;
                            }
                            if (configObj[namespace] == PLATFORM) {
                                // if the config is set to 'platform', then get this config's platform value
                                // var platformConfig = stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
                                // if (platformConfig || platformConfig === false) {
                                //     return platformConfig;
                                // }
                                // didnt find a specific platform config, now try the default
                                return stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
                            }
                            return configObj[namespace];
                        };
                    }

                });
            }

            function stringObj(obj, str) {
                str = str.split('.');
                for (var i = 0; i < str.length; i++) {
                    if (obj && angular.isDefined(obj[str[i]])) {
                        obj = obj[str[i]];
                    } else {
                        return null;
                    }
                }
                return obj;
            }

            provider.setPlatformConfig = setPlatformConfig;


            // private: Service definition for internal Tubular use
            provider.$get = function () {
                return provider;
            };
        });
})(angular);