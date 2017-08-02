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

                    if (checkIsBypassedUrl(config.url)) {
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

            function checkIsBypassedUrl(url) {
                let subsetUrls = Object.values(tubularConfig.webApi.noCacheBypassUrls());

                if (subsetUrls.length == 0)
                    return false;

                let plainUrls = [];

                subsetUrls.reduce(function (all, item) {
                    all.push(item);
                    return all;
                }, plainUrls);

                return plainUrls.find(item => url.indexOf(item) >= 0);
            }
        }]);
})(angular);