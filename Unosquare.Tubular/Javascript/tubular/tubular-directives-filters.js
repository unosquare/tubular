(function (angular) {
    'use strict';

    function setupFilter($scope, $element, $compile, $filter, $ctrl, openCallback) {
        $scope.$watch('$ctrl.filter.Operator', function (val) {
            if (val === 'None') $ctrl.filter.Text = '';
        });

        $scope.$watch(function () {
            var columns = $ctrl.$component.columns.filter(function ($element) {
                return $element.Name === $ctrl.filter.Name;
            });

            return columns.length !== 0 ? columns[0] : null;
        }, function (val) {
            if (val && val != null) {
                if ($ctrl.filter.HasFilter != val.Filter.HasFilter) {
                    $ctrl.filter.HasFilter = val.Filter.HasFilter;
                    $ctrl.filter.Text = val.Filter.Text;
                    $ctrl.retrieveData();
                }
            }
        }, true);

        $ctrl.retrieveData = function () {
            var columns = $ctrl.$component.columns.filter(function ($element) {
                return $element.Name === $ctrl.filter.Name;
            });

            if (columns.length !== 0) {
                columns[0].Filter = $ctrl.filter;
            }

            $ctrl.$component.retrieveData();
            $ctrl.close();
        };

        $ctrl.clearFilter = function () {
            if ($ctrl.filter.Operator != 'Multiple') {
                $ctrl.filter.Operator = 'None';
            }

            $ctrl.filter.Text = '';
            $ctrl.filter.Argument = [];
            $ctrl.filter.HasFilter = false;
            $ctrl.retrieveData();
        };

        $ctrl.applyFilter = function () {
            $ctrl.filter.HasFilter = true;
            $ctrl.retrieveData();
        };

        $ctrl.close = function () {
            $element.find('.btn-popover').popover('hide');
        };

        $ctrl.open = function () {
            $element.find('.btn-popover').popover('toggle');
        };

        $ctrl.checkEvent = function (keyEvent) {
            if (keyEvent.which === 13) {
                $ctrl.applyFilter();
                keyEvent.preventDefault();
            }
        };

        $element.find('.btn-popover').popover({
            html: true,
            placement: 'bottom',
            trigger: 'manual',
            content: function () {
                var selectEl = $(this).next().find('select').find('option').remove().end();
                angular.forEach($ctrl.filterOperators, function (val, key) {
                    $(selectEl).append('<option value="' + key + '">' + val + '</option>');
                });

                return $compile($(this).next().html())($scope);
            }
        });

        $element.find('.btn-popover').on('show.bs.popover', function (e) {
            $('.btn-popover').not(e.target).popover("hide");
        });

        if (angular.isDefined(openCallback)) {
            $element.find('.btn-popover').on('shown.bs.popover', openCallback);
        }

        $ctrl.$postLink = function () {
            $ctrl.filter = {
                Text: $ctrl.text || null,
                Argument: $ctrl.argument ? [$ctrl.argument] : null,
                Operator: $ctrl.operator || "Contains",
                OptionsUrl: $ctrl.optionsUrl || null,
                HasFilter: !($ctrl.text == null)
            };

            $ctrl.filter.Name = $scope.$parent.$parent.column.Name;

            var columns = $ctrl.$component.columns.filter(function ($element) {
                return $element.Name === $ctrl.filter.Name;
            });

            if (columns.length === 0) return;

            $scope.$watch('$ctrl.filter', function (n) {
                if (columns[0].Filter.Text != n.Text) {
                    n.Text = columns[0].Filter.Text;

                    if (columns[0].Filter.Operator != n.Operator) {
                        n.Operator = columns[0].Filter.Operator;
                    }
                }

                $ctrl.filter.HasFilter = columns[0].Filter.HasFilter;
            });

            columns[0].Filter = $ctrl.filter;
            $ctrl.dataType = columns[0].DataType;
            $ctrl.filterOperators = columns[0].FilterOperators[$ctrl.dataType];

            if ($ctrl.dataType === 'date' || $ctrl.dataType === 'datetime' || $ctrl.dataType === 'datetimeutc') {
                $ctrl.filter.Argument = [new Date()];

                if ($ctrl.filter.Operator === 'Contains') {
                    $ctrl.filter.Operator = 'Equals';
                }
            }

            if ($ctrl.dataType === 'numeric' || $ctrl.dataType === 'boolean') {
                $ctrl.filter.Argument = [1];

                if ($ctrl.filter.Operator === 'Contains') {
                    $ctrl.filter.Operator = 'Equals';
                }
            }

            $ctrl.filterTitle = $ctrl.title || $filter('translate')('CAPTION_FILTER');

            if (angular.isDefined($element[0]) && $element[0].localName == "tb-column-options-filter") {
                $ctrl.filter.Operator = 'Multiple';
            }
        }
    };

    angular.module('tubular.directives')
         /**
         * @ngdoc component
         * @name tbColumnFilterButtons
         *
         * @description
         * The `tbColumnFilterButtons` is an internal component, and it is used to show basic filtering buttons.
         */
        .component('tbColumnFilterButtons', {
            require: {
                $columnFilter: '^?tbColumnFilter',
                $columnDateTimeFilter: '^?tbColumnDateTimeFilter',
                $columnOptionsFilter: '^?tbColumnOptionsFilter'
            },
            template: '<div class="text-right">' +
                      '<a class="btn btn-sm btn-success" ng-click="$ctrl.currentFilter.applyFilter()"' +
                      'ng-disabled="$ctrl.currentFilter.filter.Operator == \'None\'">{{\'CAPTION_APPLY\' | translate}}</a>&nbsp;' +
                      '<button class="btn btn-sm btn-danger" ng-click="$ctrl.currentFilter.clearFilter()">{{\'CAPTION_CLEAR\' | translate}}</button>' +
                      '</div>',
            transclude: true,
            controller: ['$scope',
                function ($scope) {
                    var $ctrl = this;

                    $ctrl.$onInit = function () {
                        // Set currentFilter to either one of the parent components or for when this template is being rendered by $compile
                        $ctrl.currentFilter = $ctrl.$columnFilter || $ctrl.$columnDateTimeFilter || $ctrl.$columnOptionsFilter || $scope.$parent.$ctrl;
                    }
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbColumnSelector
         *
         * @description
         * The `tbColumnSelector` is a button to show columns selector popup.
         */
        .component('tbColumnSelector', {
            require: {
                $component: '^tbGrid'
            },
            template: '<button class="btn btn-sm btn-default" ng-click="$ctrl.openColumnsSelector()">{{\'CAPTION_SELECTCOLUMNS\' | translate}}</button></div>',
            transclude: true,
            controller: [
                '$scope', '$uibModal', function ($scope, $modal) {
                    var $ctrl = this;

                    $ctrl.openColumnsSelector = function () {
                        var model = $ctrl.$component.columns;

                        var dialog = $modal.open({
                            template: '<div class="modal-header">' +
                                '<h3 class="modal-title">{{\'CAPTION_SELECTCOLUMNS\' | translate}}</h3>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                '<table class="table table-bordered table-responsive table-striped table-hover table-condensed">' +
                                '<thead><tr><th>Visible?</th><th>Name</th><th>Grouping?</th></tr></thead>' +
                                '<tbody><tr ng-repeat="col in Model">' +
                                '<td><input type="checkbox" ng-model="col.Visible" ng-disabled="col.Visible && isInvalid()" /></td>' +
                                '<td>{{col.Label}}</td>' +
                                '<td><input type="checkbox" ng-disabled="true" ng-model="col.IsGrouping" /></td>' +
                                '</tr></tbody></table></div>' +
                                '</div>' +
                                '<div class="modal-footer"><button class="btn btn-warning" ng-click="closePopup()">{{\'CAPTION_CLOSE\' | translate}}</button></div>',
                            backdropClass: 'fullHeight',
                            animation: false,
                            controller: [
                                '$scope', function ($innerScope) {
                                    $innerScope.Model = model;
                                    $innerScope.isInvalid = function () {
                                        return $innerScope.Model.filter(function (el) { return el.Visible; }).length === 1;
                                    }

                                    $innerScope.closePopup = function () {
                                        dialog.close();
                                    };
                                }
                            ]
                        });
                    };
                }
            ]
        })
        /**
         * @ngdoc directive
         * @name tbColumnFilter
         * @restrict E
         *
         * @description
         * The `tbColumnFilter` directive is a the basic filter popover. You need to define it inside a `tbColumn`.
         * 
         * The parent scope will provide information about the data type.
         * 
         * @param {string} text Set the search text.
         * @param {string} operator Set the initial operator, default depends on data type.
         */
        .component('tbColumnFilter', {
            require: {
                $component: '^tbGrid'
            },
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ng-click="$ctrl.open()" ' +
                'ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '<div style="display: none;">' +
                '<button type="button" class="close" data-dismiss="modal" ng-click="$ctrl.close()"><span aria-hidden="true">×</span></button>' +
                '<h4>{{$ctrl.filterTitle}}</h4>' +
                '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                '<select class="form-control" ng-model="$ctrl.filter.Operator" ng-hide="$ctrl.dataType == \'boolean\'"></select>&nbsp;' +
                '<input class="form-control" type="search" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ng-hide="$ctrl.dataType == \'boolean\'"' +
                'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                '<div class="text-center" ng-show="$ctrl.dataType == \'boolean\'">' +
                '<button type="button" class="btn btn-default btn-md" ng-disabled="$ctrl.filter.Text === true" ng-click="$ctrl.filter.Text = true; $ctrl.filter.Operator = \'Equals\';">' +
                '<i class="fa fa-check"></i></button>&nbsp;' +
                '<button type="button" class="btn btn-default btn-md" ng-disabled="$ctrl.filter.Text === false" ng-click="$ctrl.filter.Text = false; $ctrl.filter.Operator = \'Equals\';">' +
                '<i class="fa fa-times"></i></button></div>' +
                '<input type="search" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />' +
                '<hr />' +
                '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                '</form></div>' +
                '</div>',
            transclude: true,
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                optionsUrl: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', function ($scope, $element, $compile, $filter) {
                    var $ctrl = this;

                    $ctrl.$onInit = function () {
                        setupFilter($scope, $element, $compile, $filter, $ctrl, null);
                    }
                }
            ]
        })
        /**
         * @ngdoc directive
         * @name tbColumnDateTimeFilter
         * @restrict E
         *
         * @description
         * The `tbColumnDateTimeFilter` directive is a specific filter with Date and Time editors, instead regular inputs.
         * 
         * The parent scope will provide information about the data type.
         * 
         * @param {string} text Set the search text.
         * @param {object} argument Set the search object (if the search is text use text attribute).
         * @param {string} operator Set the initial operator, default depends on data type.
         */
        .component('tbColumnDateTimeFilter', {
            require: {
                $component: '^tbGrid'
            },
            template: '<div ngTransclude class="btn-group tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ng-click="$ctrl.open()" ' +
                'ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '<div style="display: none;">' +
                '<button type="button" class="close" data-dismiss="modal" ng-click="$ctrl.close()"><span aria-hidden="true">×</span></button>' +
                '<h4>{{filterTitle}}</h4>' +
                '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                '<select class="form-control" ng-model="$ctrl.filter.Operator"></select>' +
                '<input type="date" class="form-control" ng-model="$ctrl.filter.Text" ng-keypress="$ctrl.checkEvent($event)" />&nbsp;' +
                '<input type="date" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ' +
                'ng-show="$ctrl.filter.Operator == \'Between\'" />' +
                '<hr />' +
                '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                '</form></div>' +
                '</div>',
            transclude: true,
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                optionsUrl: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', function ($scope, $element, $compile, $filter) {
                    var $ctrl = this;

                    $ctrl.$onInit = function () {
                        $ctrl.filter = {};
                        $ctrl.format = 'yyyy-MM-dd';

                        setupFilter($scope, $element, $compile, $filter, $ctrl, function () {
                            var inp = $element.find("input[type=date]")[0];

                            if (inp.type !== 'date') {
                                $(inp).datepicker({
                                    dateFormat: scope.format.toLowerCase()
                                }).on("dateChange", function (e) {
                                    scope.filter.Text = e.date;
                                });
                            }

                            var inpLev = $element.find("input[type=date]")[1];

                            if (inpLev.type !== 'date') {
                                $(inpLev).datepicker({
                                    dateFormat: scope.format.toLowerCase()
                                }).on("dateChange", function (e) {
                                    scope.filter.Argument = [e.date];
                                });
                            }
                        });
                    }
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbColumnOptionsFilter
         * @restrict E
         *
         * @description
         * The `tbColumnOptionsFilter` directive is a filter with an dropdown listing all the possible values to filter.
         * 
         * @param {object} argument Set the search object.
         * @param {string} operator Set the initial operator, default depends on data type.
         * @param {string} optionsUrl Set the URL to retrieve options
         */
        .component('tbColumnOptionsFilter', {
            require: {
                $component: '^tbGrid'
            },
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ng-click="$ctrl.open()" ' +
                'ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '<div style="display: none;">' +
                '<button type="button" class="close" data-dismiss="modal" ng-click="$ctrl.close()"><span aria-hidden="true">×</span></button>' +
                '<h4>{{::$ctrl.filterTitle}}</h4>' +
                '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                '<select class="form-control checkbox-list" ng-model="$ctrl.filter.Argument" ng-options="item for item in $ctrl.optionsItems" ' +
                ' multiple ng-disabled="$ctrl.dataIsLoaded == false"></select>' +
                '<hr />' +
                '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                '</form></div>' +
                '</div>',
            transclude: true,
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                optionsUrl: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', function ($scope, $element, $compile, $filter) {
                    var $ctrl = this;

                    $ctrl.getOptionsFromUrl = function () {
                        if ($ctrl.dataIsLoaded) {
                            $scope.$apply();
                            return;
                        }

                        var currentRequest = $ctrl.$component.dataService.retrieveDataAsync({
                            serverUrl: $ctrl.filter.OptionsUrl,
                            requestMethod: 'GET'
                        });

                        currentRequest.promise.then(
                            function (data) {
                                $ctrl.optionsItems = data;
                                $ctrl.dataIsLoaded = true;
                            }, function (error) {
                                $scope.$emit('tbGrid_OnConnectionError', error);
                            });
                    };

                    $ctrl.$onInit = function () {
                        $ctrl.dataIsLoaded = false;

                        setupFilter($scope, $element, $compile, $filter, $ctrl, function () {
                            $ctrl.getOptionsFromUrl();
                        });
                    }
                }
            ]
        });
})(window.angular);