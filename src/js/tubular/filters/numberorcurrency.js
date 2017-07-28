(function(angular) {
  'use strict';

  angular.module('tubular.common')

    /**
     * @ngdoc filter
     * @name numberorcurrency
     * @kind function
     *
     * @description
     * `numberorcurrency` is a hack to hold `currency` and `number` in a single filter.
     */
    .filter('numberorcurrency', [
      'numberFilter',
      'currencyFilter',
      function(numberFilter, currencyFilter) {
        return (input, format, symbol, fractionSize) => {
          fractionSize = fractionSize || 2;

          if (format === 'C') {
            return currencyFilter(input, symbol || '$', fractionSize);
          }

          return format === 'I' ? parseInt(input) : numberFilter(input, fractionSize);
        };
      }
    ])
})(angular);
