(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc factory
         * @name modelSaver
         *
         * @description
         * Use `modelSaver` to save a `tubularModel`
         */
        .factory('modelSaver', [
            '$http',
            function ($http) {
                function addTimeZoneToUrl(url) {
                    return `${url}${(url.indexOf('?') === -1 ? '?' : '&')}timezoneOffset=${new Date().getTimezoneOffset()}`;
                }

                return {
                    /**
                     * Save a model using the url and method
                     *
                     * @param {string} url
                     * @param {string} method
                     * @param {any} model
                     */
                    save: (url, method, model) => {
                        // TODO: RequiredAuthentication bypass?
                        if (!url) {
                            throw 'Define a Save URL.';
                        }

                        model.$isLoading = true;
                        const clone = angular.copy(model);
                        const originalClone = angular.copy(model.$original);

                        delete clone.$isEditing;
                        delete clone.$original;
                        delete clone.$state;
                        delete clone.$valid;
                        delete clone.$isLoading;
                        delete clone.$isNew;
                        delete clone.$fields;
                        delete clone.$key;

                        return $http({
                            url: model.$isNew ? addTimeZoneToUrl(url) : url,
                            method: model.$isNew ? (method || 'POST') : 'PUT',
                            data: model.$isNew ? clone : {
                                Old: originalClone,
                                New: clone,
                                TimezoneOffset: new Date().getTimezoneOffset()
                            }
                        });

                    }
                };
            }
        ]);
})(angular);