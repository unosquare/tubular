(function (angular) {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc component
         * @name tbGridPager
         * @module tubular.directives
         *
         * @description
         * The `tbGridPager` component generates a pager connected to the parent `tbGrid`.
         */
        .component('tbGridPager', {
            require: {
                $component : '^tbGrid'
            },
            template:
                '<div class="tubular-pager">' +
                    '<ul uib-pagination ng-disabled="$ctrl.$component.isEmpty" direction-links="true" ' +
                    'first-text="&#xf049;" previous-text="&#xf04a;" next-text="&#xf04e;" last-text="&#xf050;"' +
                    'boundary-links="true" total-items="$ctrl.$component.filteredRecordCount" ' +
                    'items-per-page="$ctrl.$component.pageSize" max-size="5" ng-model="$ctrl.$component.currentPage" ng-change="$ctrl.pagerPageChanged()">' +
                    '</ul>' +
                    '<div>',
            scope: true,
            terminal: false,
            controller: ['$scope', function ($scope) {
                    var $ctrl = this;

                    $scope.$watch('$ctrl.$component.currentPage', function () {
                        if ($ctrl.$component.currentPage !== $ctrl.$component.requestedPage) {
                            $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                        }
                    });

                    $ctrl.pagerPageChanged = function () {
                        $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbGridPagerInfo
         * @module tubular.directives
         *
         * @description
         * The `tbGridPagerInfo` component shows how many records are shown in a page and total rows.
         */
        .component('tbGridPagerInfo', {
            require: {
                $component: '^tbGrid'
            },
            template: '<div class="pager-info small" ng-hide="$ctrl.$component.isEmpty">' +
                '{{\'UI_SHOWINGRECORDS\' | translate: $ctrl.currentInitial:$ctrl.currentTop:$ctrl.$component.filteredRecordCount}} ' +
                '<span ng-show="$ctrl.filtered">' +
                '{{\'UI_FILTEREDRECORDS\' | translate: $ctrl.$component.totalRecordCount}}</span>' +
                '</div>',
            bindings: {
                cssClass: '@?'
            },
            controller: [
                '$scope', function ($scope) {
                    var $ctrl = this;

                    $ctrl.fixCurrentTop = function () {
                        $ctrl.currentTop = $ctrl.$component.pageSize * $ctrl.$component.currentPage;
                        $ctrl.currentInitial = (($ctrl.$component.currentPage - 1) * $ctrl.$component.pageSize) + 1;

                        if ($ctrl.currentTop > $ctrl.$component.filteredRecordCount) {
                            $ctrl.currentTop = $ctrl.$component.filteredRecordCount;
                        }

                        if ($ctrl.currentTop < 0) {
                            $ctrl.currentTop = 0;
                        }

                        if ($ctrl.currentInitial < 0 || $ctrl.$component.totalRecordCount === 0) {
                            $ctrl.currentInitial = 0;
                        }
                    };

                    $scope.$watch('$ctrl.$component.filteredRecordCount', function () {
                        $ctrl.filtered = $ctrl.$component.totalRecordCount != $ctrl.$component.filteredRecordCount;
                        $ctrl.fixCurrentTop();
                    });

                    $scope.$watch('$ctrl.$component.currentPage', function () {
                        $ctrl.fixCurrentTop();
                    });

                    $scope.$watch('$ctrl.$component.pageSize', function () {
                        $ctrl.fixCurrentTop();
                    });

                    $ctrl.$onInit = function () {
                        $ctrl.fixCurrentTop();
                    };
                }
            ]
        });
})(window.angular);