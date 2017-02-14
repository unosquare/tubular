(function (angular) {
    'use strict';

    angular.module('tubular.services').run(['tubularHttp', 'tubularOData', function registerService(tubularHttp, tubularOData) {
        tubularHttp.registerService('odata', tubularOData);
    }]);

})(angular);