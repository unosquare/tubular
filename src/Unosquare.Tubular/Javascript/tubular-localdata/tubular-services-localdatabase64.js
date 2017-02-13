(function (angular) {
    'use strict';

    angular.module('tubular.services').factory('tubularLocalDataBase64', tubularLocalDataBase64);

    tubularLocalDataBase64.$inject = [];

    function tubularLocalDataBase64() {
        return {
            getFromUrl : getFromUrl
        }

        function getFromUrl(url) {
            if (url.indexOf('data:') !== 0)
                return null;

            var urlData = url.substr('data:application/json;base64,'.length);
            urlData = atob(urlData);
            return angular.fromJson(urlData);
        }

    }
})(angular);