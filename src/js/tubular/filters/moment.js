(function (angular, moment) {
  'use strict';

  angular.module('tubular.core')

    /**
     * @ngdoc filter
     * @name moment
     * @kind function
     *
     * @description
     * `moment` is a filter to call format from moment or, if the input is a Date, call Angular's `date` filter.
     */
    .filter('moment', ['dateFilter',
      function (dateFilter) {
        return (input, format) => moment.isMoment(input) ? input.format(format || 'M/DD/YYYY') : dateFilter(input);
      }
    ]);
})(angular, moment);
