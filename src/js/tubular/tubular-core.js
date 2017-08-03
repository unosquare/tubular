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
        .factory('tubular', tubular);

    function tubular() {

        return {
            isValueInObject: isValueInObject,
            isUrlInList: isUrlInList
        }

        function isValueInObject(val, obj) {
            return Object.values(obj).indexOf(val) >= 0;
        }

        function isUrlInList(bypassUrls, url) {
            return bypassUrls.some(item => url.indexOf(item) >= 0);
        }
    }
})(angular);
