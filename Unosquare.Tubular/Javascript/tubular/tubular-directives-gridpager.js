(function() {
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
                    '<uib-pagination ng-disabled="$ctrl.$component.isEmpty" direction-links="true" ' +
                    'boundary-links="true" total-items="$ctrl.$component.filteredRecordCount" ' +
                    'items-per-page="$ctrl.$component.pageSize" max-size="5" ng-model="$ctrl.$component.currentPage" ng-change="$ctrl.pagerPageChanged()">' +
                    '</uib-pagination>' +
                    '<div>',
            transclude: false,
            scope: true,
            terminal: false,
            controller: [
                '$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
                    var $ctrl = this;

                    $scope.$watch('$ctrl.$component.currentPage', function () {
                        if ($ctrl.$component.currentPage != $ctrl.$component.requestedPage) {
                            $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                        }
                    });

                    $ctrl.pagerPageChanged = function () {
                        $ctrl.$component.requestedPage = $ctrl.$component.currentPage;
                        var allLinks = $element.find('li a');
                        $(allLinks).blur();
                    };

                    $ctrl.$postLink = function () {
                        $ctrl.firstButtonClass = $attrs.firstButtonClass || 'fa fa-fast-backward';
                        $ctrl.prevButtonClass = $attrs.prevButtonClass || 'fa fa-backward';

                        $ctrl.nextButtonClass = $attrs.nextButtonClass || 'fa fa-forward';
                        $ctrl.lastButtonClass = $attrs.lastButtonClass || 'fa fa-fast-forward';

                        var timer = $timeout(function () {
                            var allLinks = $element.find('li a');

                            $(allLinks[0]).html('<i class="' + $ctrl.firstButtonClass + '"></i>');
                            $(allLinks[1]).html('<i class="' + $ctrl.prevButtonClass + '"></i>');

                            $(allLinks[allLinks.length - 2]).html('<i class="' + $ctrl.nextButtonClass + '"></i>');
                            $(allLinks[allLinks.length - 1]).html('<i class="' + $ctrl.lastButtonClass + '"></i>');
                        }, 0);

                        $scope.$on('$destroy', function () { $timeout.cancel(timer); });
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
            transclude: true,
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
})();