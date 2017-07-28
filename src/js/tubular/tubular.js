﻿(function (angular) {
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
    .module('tubular', ['tubular.core', 'tubular.directives', 'tubular.services', 'tubular.models', 'tubular.common'])
    .info({ version: '1.8.1' });

})(angular);
