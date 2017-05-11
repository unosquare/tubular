(function(angular) {
  'use strict';

  angular.module('tubular.services')
    /**
     * @ngdoc filter
     * @name translate
     *
     * @description
     * Translate a key to the current language
     */
    .filter('translate', [
      'tubularTranslate',
      function(tubularTranslate) {
        return function(input, param1, param2, param3, param4) {
          if (angular.isDefined(input)) {
            let translation = tubularTranslate.translate(input)
              .replace('{0}', param1 || '')
              .replace('{1}', param2 || '')
              .replace('{2}', param3 || '')
              .replace('{3}', param4 || '');

            return translation;
          }

          return input;
        };
      }
    ]);
})(angular);
