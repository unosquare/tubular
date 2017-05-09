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
                    if (config.method === 'GET' && config.url.indexOf('.htm') === -1 && config.url.indexOf('blob:') === -1) {
                        const separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = `${config.url + separator  }noCache=${  new Date().getTime()}`;
                    }

                    return config;
                }
            };
        }]);
})(angular);