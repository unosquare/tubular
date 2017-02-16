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
        template:
            '<div class="tubular-grid-search">' +
                '<div class="input-group input-group-sm">' +
                '<span class="input-group-addon"><i class="fa fa-search"></i></span>' +
                '<input type="search" class="form-control" placeholder="{{:: $ctrl.placeholder || (\'UI_SEARCH\' | translate) }}" maxlength="20" ' +
                'ng-model="$ctrl.$component.search.Text" ng-model-options="{ debounce: 300 }">' +
                '<span class="input-group-btn" ng-show="$ctrl.$component.search.Text.length > 0">' +
                '<button class="btn btn-default" uib-tooltip="{{\'CAPTION_CLEAR\' | translate}}" ng-click="$ctrl.$component.search.Text = \'\'">' +
                '<i class="fa fa-times-circle"></i>' +
                '</button>' +
                '</span>' +
                '<div>' +
                '<div>',
        bindings: {
            minChars: '@?',
            placeholder: '@'
        },
        controller: 'tbTextSearchController'
    });
    

})(angular);