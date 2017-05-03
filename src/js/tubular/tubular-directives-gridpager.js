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
            templateUrl: 'tbGridPager.tpl.html',
            scope: true,
            terminal: false,
            controller: ['$scope', $scope => {
                    var $ctrl = this;

                    $scope.$watch('$ctrl.$component.currentPage', () => {
                        if ($ctrl.$component.currentPage !== $ctrl.$component.requestedPage) {
                            $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                        }
                    });

                    $ctrl.pagerPageChanged = () => $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
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
            templateUrl: 'tbGridPagerInfo.tpl.html',
            bindings: {
                cssClass: '@?'
            },
            controller: [
                '$scope', $scope => {
                    var $ctrl = this;

                    $ctrl.fixCurrentTop = () => {
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
                        
                        if ($ctrl.$component.pageSize > $ctrl.$component.filteredRecordCount)
                        {
                            $ctrl.currentInitial = 1;
                            $ctrl.currentTop = $ctrl.$component.filteredRecordCount;
                        }
                    };

                    $scope.$watch('$ctrl.$component.filteredRecordCount', () => {
                        $ctrl.filtered = $ctrl.$component.totalRecordCount !== $ctrl.$component.filteredRecordCount;
                        $ctrl.fixCurrentTop();
                    });

                    $scope.$watch('$ctrl.$component.currentPage', $ctrl.fixCurrentTop);
                    $scope.$watch('$ctrl.$component.pageSize', $ctrl.fixCurrentTop);

                    $ctrl.$onInit = $ctrl.fixCurrentTop;
                }
            ]
        });
})(angular);