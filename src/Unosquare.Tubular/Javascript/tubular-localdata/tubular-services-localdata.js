(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularLocalData
         *
         * @description
         * Use `tubularLocalData` to connect a grid or a form to a local JSON file. This file can be 
         * stored in a BLOB as a BASE64 string.
         */
        .factory('tubularLocalData', ['tubularHttp', '$q', '$log', 'tubularLocalDataPager', 'tubularLocalDataBase64',tubularLocalData])

    function tubularLocalData(tubularHttp, $q, $log, pager, localDataBase64) {

        return {
            getByKey: tubularHttp.getByKey,
            get : tubularHttp.get,
            retrieveDataAsync: retrieveDataAsync
        }

        function retrieveDataAsync(request) {
            request.requireAuthentication = false;
            return {
                promise: getPromise(request),
                cancel: cancelFunc
            };

        }

        function cancelFunc(reason) {
            $log.info(reason);
            return $q.resolve(reason);
        }

        function getPromise(request) {
            return $q.resolve(getData(request)).then(function onData(data) {
                return pageRequest(request, data);
            });
        }

        function getData(request) {
            return dataFromUrl(request) || dataFromHttp(request);
        }

        function dataFromHttp(request) {
            return tubularHttp.retrieveDataAsync(request).promise;
        }

        function dataFromUrl(request){
            return localDataBase64.getFromUrl(request.serverUrl);
        }
       

        function pageRequest(request, data) {
            return pager.page(request, data);
        }
    }
})(angular);