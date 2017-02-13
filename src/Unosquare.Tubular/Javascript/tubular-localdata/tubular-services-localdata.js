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
        .factory('tubularLocalData', tubularLocalData)
        .run(registerAsLocal);

    registerAsLocal.$inject = ['tubularHttp', 'tubularLocalData'];
    tubularLocalData.$inject = ['tubularHttp', '$q', '$log', 'tubularLocalDataPager'];

    
    function registerAsLocal(tubularHttp, tubularLocalData) {
                // register data services
          tubularHttp.registerService('local', tubularLocalData);
    }

    function tubularLocalData(tubularHttp, $q, $log, pager) {

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

            function cancelFunc(reason) {
                $log.info(reason);
                return $q.resolve(reason);
            }

        }

        

        function getPromise(request) {
            return $q.resolve(getData(request)).then(function gotData(data) {
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
            if (request.serverUrl.indexOf('data:') !== 0)
                return null;
            
            var urlData = request.serverUrl.substr('data:application/json;base64,'.length);
            urlData = atob(urlData);
            return angular.fromJson(urlData);
        }
       

        function pageRequest(request, data) {
            return pager.page(request, data);
        }
    }


})(angular);