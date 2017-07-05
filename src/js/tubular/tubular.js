(function(angular) {
  'use strict';

  /**
   * @ngdoc module
   * @name tubular
   *
   * @description
   * Tubular module. Entry point to get all the Tubular functionality.
   *
   * It depends upon  {@link tubular.directives}, {@link tubular.services} and {@link tubular.models}.
   */
  angular
    .module('tubular', ['tubular.directives', 'tubular.services', 'tubular.models'])
    .info({ version: '1.7.11' });

})(angular);
