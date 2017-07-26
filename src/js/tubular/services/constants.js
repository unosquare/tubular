(angular => {
    'use strict';

    angular.module('tubular.services')
        .constant('dataTypes', {
            STRING: 'string',
            BOOLEAN: 'boolean',
            NUMERIC: 'numeric',
            DATE_TIME: 'datetime',
            DATE: 'date',
            DATE_TIME_UTC: 'datetimeutc'
        })
        .constant('sortDirection', {
            NONE : 'None',
            ASCENDING: 'Ascending',
            DESCENDING: 'Descending'
        })
        .constant('compareOperators', {
            NONE : 'None',
            AUTO: 'Auto',
            EQUALS: 'Equals',
            NOT_EQUALS: 'NotEquals',
            CONTAINS: 'Contains',
            STARTS_WITH: 'StartsWith',
            ENDS_WITH: 'EndsWith',
            GTE: 'Gte',
            GT: 'Gt',
            LTE: 'Lte',
            LT: 'Lt',
            MULTIPLE: 'Multiple',
            BETWEEN: 'Between',
            NOT_CONTAINS: 'NotContains',
            NOT_STARTS_WITH: 'NotStartsWith',
            NOT_ENDS_WITH: 'NotEndsWith'
        })
        .constant('aggregateFunctions', {
            NONE : 'None',
            SUM: 'Sum',
            AVERAGE: 'Average',
            COUNT: 'Count',
            DISTINCT_COUNT: 'Distinctcount',
            MAX: 'Max',
            MIN: 'Min'
        });
})(angular);