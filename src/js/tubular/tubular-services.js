
(function(angular) {
'use strict';


/**
 * @ngdoc module
 * @name tubular.services
 *
 * @description
 * Tubular Services module.
 * It contains common services like HTTP client, filtering and printing services.
 */
angular.module('tubular.services', ['ui.bootstrap', 'tubular.core'])
  .config([
    '$httpProvider',
    ($httpProvider) => {
      $httpProvider.interceptors.push('tubularAuthInterceptor');
      $httpProvider.interceptors.push('tubularNoCacheInterceptor');
    }
  ]);


})(angular);
