(function (angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.common
     *
     * @description
     * Tubular Common module.
     *
     * It contains common functions/utilities used in Tubular. ie. moment reference.
     */
    angular.module('tubular.core', [])
        .service('tubular', tubular);

    function tubular() {
        this.isValueInObject = function (val, obj) {
            return Object.values(obj).indexOf(val) >= 0;
        }

        this.isUrlInBypassList = function (bypassUrls, url) {
            const subsetUrls = Object.values(bypassUrls);

            if (subsetUrls.length == 0)
                return false;

            const plainUrls = [];

            subsetUrls.reduce((all, subset) => {
                subset.forEach((url) => all.push(url));
                return all;
            }, plainUrls);

            return plainUrls.find(item => url.indexOf(item) >= 0);
        }
    }
})(angular);
