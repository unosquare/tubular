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
        .factory('tubularNoCacheInterceptor', [function () {

            return {
                request: (config) => {

                    // patterns to escape: .htm | blob: | noCache=
                    const matchesEspacePatterns = (/\.htm|blob:|noCache\=/.test(config.url));

                    if (config.method === 'GET' && !matchesEspacePatterns) {
                        const separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = `${config.url + separator}noCache=${new Date().getTime()}`;
                    }

                    return config;
                }
            };
        }]);
})(angular);