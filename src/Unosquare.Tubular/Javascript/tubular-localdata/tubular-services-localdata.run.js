(function (angular) {
    'use strict';

    angular.module('tubular.services').run(['tubularHttp', 'tubularLocalData', registerAsLocal]);

    function registerAsLocal(tubularHttp, tubularLocalData) {
        tubularHttp.registerService('local', tubularLocalData);
    }
  
})(angular);