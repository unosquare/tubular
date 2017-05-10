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
            let translation = tubularTranslate.translate(input);

            translation = translation.replace('{0}', param1 || '');
            translation = translation.replace('{1}', param2 || '');
            translation = translation.replace('{2}', param3 || '');
            translation = translation.replace('{3}', param4 || '');

            return translation;
          }

          return input;
        };
      }
    ]);
})(angular);
