(function () {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbGridPager
         * @restrict E
         *
         * @description
         * The `tbGridPager` directive generates a pager connected to the parent `tbGrid`.
         * 
         * @scope
         */
        .directive('tbGridPager', [
            '$timeout', function ($timeout) {
                return {
                    require: '^tbGrid',
                    template:
                        '<div class="tubular-pager">' +
                            '<uib-pagination ng-disabled="$component.isEmpty" direction-links="true" ' +
                            'boundary-links="true" total-items="$component.filteredRecordCount" ' +
                            'items-per-page="$component.pageSize" max-size="5" ng-model="$component.currentPage" ng-change="pagerPageChanged()">' +
                            '</uib-pagination>' +
                            '<div>',
                    restrict: 'E',
                    replace: true,
                    transclude: false,
                    scope: true,
                    terminal: false,
                    controller: [
                        '$scope', '$element', function ($scope, $element) {
                            $scope.$component = $scope.$parent.$parent;
                            $scope.tubularDirective = 'tubular-grid-pager';

                            $scope.$watch('$component.currentPage', function () {
                                if ($scope.$component.currentPage != $scope.$component.requestedPage) {
                                    $scope.$component.requestedPage = $scope.$component.currentPage;
                                }
                            });

                            $scope.pagerPageChanged = function () {
                                $scope.$component.requestedPage = $scope.$component.currentPage;
                                var allLinks = $element.find('li a');
                                $(allLinks).blur();
                            };
                        }
                    ],
                    compile: function compile() {
                        return {
                            post: function (scope, lElement, lAttrs) {
                                scope.firstButtonClass = lAttrs.firstButtonClass || 'fa fa-fast-backward';
                                scope.prevButtonClass = lAttrs.prevButtonClass || 'fa fa-backward';

                                scope.nextButtonClass = lAttrs.nextButtonClass || 'fa fa-forward';
                                scope.lastButtonClass = lAttrs.lastButtonClass || 'fa fa-fast-forward';

                                var timer = $timeout(function () {
                                    var allLinks = lElement.find('li a');

                                    $(allLinks[0]).html('<i class="' + scope.firstButtonClass + '"></i>');
                                    $(allLinks[1]).html('<i class="' + scope.prevButtonClass + '"></i>');

                                    $(allLinks[allLinks.length - 2]).html('<i class="' + scope.nextButtonClass + '"></i>');
                                    $(allLinks[allLinks.length - 1]).html('<i class="' + scope.lastButtonClass + '"></i>');
                                }, 0);

                                scope.$on('$destroy', function () { $timeout.cancel(timer); });
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbGridPagerInfo
         * @restrict E
         *
         * @description
         * The `tbGridPagerInfo` directive shows how many records are shown in a page and total rows.
         * 
         * @scope
         */
          .component('tbGridPagerInfo', {
              require: '^tbGrid', // TODO: Find how to inject $scope here to change this line to=> $component: $scope.$parent.$parent
              template: '<div class="pager-info small" ng-hide="$ctrl.$component.isEmpty">' +
                  '{{\'UI_SHOWINGRECORDS\' | translate: $ctrl.currentInitial:$ctrl.currentTop:$ctrl.$component.$ctrl.filteredRecordCount}} ' +
                  '<span ng-show="$ctrl.filtered">' +
                  '{{\'UI_FILTEREDRECORDS\' | translate: $ctrl.$component.$ctrl.totalRecordCount}}</span>' +
                  '</div>',
              transclude: true,
              bindings: {
                  cssClass: '@?'
              },
              controller: [
                  '$scope', function ($scope) {
                      var $ctrl = this;

                      $ctrl.$component = $scope.$parent.$parent;

                      $ctrl.fixCurrentTop = function () {
                          $ctrl.currentTop = $ctrl.$component.$ctrl.pageSize * $ctrl.$component.$ctrl.currentPage;
                          $ctrl.currentInitial = (($ctrl.$component.$ctrl.currentPage - 1) * $ctrl.$component.$ctrl.pageSize) + 1;

                          if ($ctrl.currentTop > $ctrl.$component.$ctrl.filteredRecordCount) {
                              $ctrl.currentTop = $ctrl.$component.$ctrl.filteredRecordCount;
                          }

                          if ($ctrl.currentTop < 0) {
                              $ctrl.currentTop = 0;
                          }

                          if ($ctrl.currentInitial < 0 || $ctrl.$component.totalRecordCount === 0) {
                              $ctrl.currentInitial = 0;
                          }
                      };

                      $ctrl.$component.$watch('filteredRecordCount', function () {
                          $ctrl.filtered = $ctrl.$component.$ctrl.totalRecordCount != $ctrl.$component.$ctrl.filteredRecordCount;
                          $ctrl.fixCurrentTop();
                      });

                      $ctrl.$component.$watch('currentPage', function () {
                          $ctrl.fixCurrentTop();
                      });

                      $ctrl.$component.$watch('pageSize', function () {
                          $ctrl.fixCurrentTop();
                      });

                      $ctrl.fixCurrentTop();
                  }
              ]
          });
})();