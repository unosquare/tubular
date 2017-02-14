(function (angular) {
    'use strict';

    angular.module('tubular.services').run(['tubularHttp', 'tubularLocalData', function registerAsLocal(tubularHttp, tubularLocalData) {
        tubularHttp.registerService('local', tubularLocalData);
    }])
  
})(angular);