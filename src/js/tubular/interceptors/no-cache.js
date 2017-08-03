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
        .factory('tubularNoCacheInterceptor', ['tubularConfig', function (tubularConfig) {

            return {
                request: (config) => {

                    if (config.method !== 'GET') {
                        return config;
                    }

                    if (tubularConfig.webApi.noCacheBypassUrls().some(item => config.url.indexOf(item) >= 0)) {
                        return config;
                    }

                    // patterns to escape: .htm | blob: | noCache=
                    const matchesEscapePatterns = (/\.htm|blob:|noCache\=/.test(config.url));

                    if (!matchesEscapePatterns) {
                        const separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = `${config.url}${separator}noCache=${new Date().getTime()}`;
                    }

                    return config;
                }
            };
        }]);
})(angular);