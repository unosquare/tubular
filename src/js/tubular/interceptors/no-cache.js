(angular => {
    'use strict';
    /**
     * @ngdoc function
     * @name tubularNoCacheInterceptor
     * @description
     *
     * Implement a httpInterceptor to prevent browser caching
     *
     * @constructor
     * @returns {Object} A httpInterceptor
     */
    angular.module('tubular.services')
        .factory('tubularNoCacheInterceptor', ['tubularConfig', 'tubular', function (tubularConfig, tubular) {

            return {
                request: (config) => {

                    if (config.method !== 'GET') {
                        return config;
                    }

                    if (tubular.isUrlInBypassList(tubularConfig.webApi.noCacheBypassUrls(), config.url)) {
                        return config;
                    }

                    // patterns to escape: .htm | blob: | noCache=
                    const matchesEscapePatterns = (/\.htm|blob:|noCache\=/.test(config.url));

                    if (!matchesEscapePatterns) {
                        const separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = `${config.url + separator}noCache=${new Date().getTime()}`;
                    }

                    return config;
                }
            };
        }]);
})(angular);