(function (angular) {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbTextSearchController', [
            '$scope', function ($scope) {
                var $ctrl = this;

                $ctrl.$onInit = () => {
                    $ctrl.minChars = $ctrl.minChars || 3;
                    $ctrl.lastSearch = $ctrl.$component.search.Text;
                };

                $scope.$watch('$ctrl.$component.search.Text', (val, prev) => {
                    if (angular.isUndefined(val) || val === prev) {
                        return;
                    }

                    $ctrl.$component.search.Text = val;

                    if ($ctrl.lastSearch && val === '') {
                        search('None');
                        return;
                    }

                    if (val === '' || val.length < $ctrl.minChars || val === $ctrl.lastSearch) {
                        return;
                    }

                    $ctrl.lastSearch = val;
                    search('Auto');
                });

                function search(operator) {
                    $ctrl.$component.saveSearch();
                    $ctrl.$component.search.Operator = operator;
                    $ctrl.$component.retrieveData();
                }
            }
        ]);


})(angular);