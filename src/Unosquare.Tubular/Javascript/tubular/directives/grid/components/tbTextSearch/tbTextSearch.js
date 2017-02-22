(function (angular) {
    'use strict';

    angular.module('tubular.directives')

        /**
        * @ngdoc component
        * @name tbTextSearch
        * @module tubular.directives
        *
        * @description
        * The `tbTextSearch` is visual component to enable free-text search in a grid.
        * 
        * @param {number} minChars How many chars before to search, default 3.
        * @param {string} placeholder The placeholder text, defaults `UI_SEARCH` i18n resource.
        */
    .component('tbTextSearch', {
        require: {
            $component: '^tbGrid'
        },
        templateUrl: 'tbTextSearch.tpl.html',
        bindings: {
            minChars: '@?',
            placeholder: '@'
        },
        controller: 'tbTextSearchController'
    });
    

})(angular);