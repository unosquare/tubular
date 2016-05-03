(function (angular) {
    'use strict';

    function setupFilter($scope, $element, $compile, $filter, $ctrl, openCallback) {
        var filterOperators = {
            'string': {
                'None': $filter('translate')('OP_NONE'),
                'Equals': $filter('translate')('OP_EQUALS'),
                'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                'Contains': $filter('translate')('OP_CONTAINS'),
                'NotContains': $filter('translate')('OP_NOTCONTAINS'),
                'StartsWith': $filter('translate')('OP_STARTSWITH'),
                'NotStartsWith': $filter('translate')('OP_NOTSTARTSWITH'),
                'EndsWith': $filter('translate')('OP_ENDSWITH'),
                'NotEndsWith': $filter('translate')('OP_NOTENDSWITH')
            },
            'numeric': {
                'None': $filter('translate')('OP_NONE'),
                'Equals': $filter('translate')('OP_EQUALS'),
                'Between': $filter('translate')('OP_BETWEEN'),
                'Gte': '>=',
                'Gt': '>',
                'Lte': '<=',
                'Lt': '<'
            },
            'date': {
                'None': $filter('translate')('OP_NONE'),
                'Equals': $filter('translate')('OP_EQUALS'),
                'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                'Between': $filter('translate')('OP_BETWEEN'),
                'Gte': '>=',
                'Gt': '>',
                'Lte': '<=',
                'Lt': '<'
            },
            'datetime': {
                'None': $filter('translate')('OP_NONE'),
                'Equals': $filter('translate')('OP_EQUALS'),
                'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                'Between': $filter('translate')('OP_BETWEEN'),
                'Gte': '>=',
                'Gt': '>',
                'Lte': '<=',
                'Lt': '<'
            },
            'datetimeutc': {
                'None': $filter('translate')('OP_NONE'),
                'Equals': $filter('translate')('OP_EQUALS'),
                'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                'Between': $filter('translate')('OP_BETWEEN'),
                'Gte': '>=',
                'Gt': '>',
                'Lte': '<=',
                'Lt': '<'
            },
            'boolean': {
                'None': $filter('translate')('OP_NONE'),
                'Equals': $filter('translate')('OP_EQUALS'),
                'NotEquals': $filter('translate')('OP_NOTEQUALS')
            }
        };

        $ctrl.filter = {
            Text: $ctrl.text || null,
            Argument: $ctrl.argument ? [$ctrl.argument] : null,
            Operator: $ctrl.operator || "Contains",
            OptionsUrl: $ctrl.optionsUrl || null,
            HasFilter: !($ctrl.text == null),
            Name: $scope.$parent.$parent.column.Name
        };

        $ctrl.filterTitle = $ctrl.title || $filter('translate')('CAPTION_FILTER');

        $scope.$watch(function() {
            var columns = $ctrl.$component.columns.filter(function($element) {
                return $element.Name === $ctrl.filter.Name;
            });

            return columns.length !== 0 ? columns[0] : null;
        }, function(val) {
            if (val && val != null) {
                if ($ctrl.filter.HasFilter != val.Filter.HasFilter) {
                    $ctrl.filter.HasFilter = val.Filter.HasFilter;
                    $ctrl.filter.Text = val.Filter.Text;
                    $ctrl.retrieveData();
                }
            }
        }, true);

        $ctrl.retrieveData = function() {
            var columns = $ctrl.$component.columns.filter(function($element) {
                return $element.Name === $ctrl.filter.Name;
            });

            if (columns.length !== 0) {
                columns[0].Filter = $ctrl.filter;
            }

            $ctrl.$component.retrieveData();
            $ctrl.close();
        };

        $ctrl.clearFilter = function() {
            if ($ctrl.filter.Operator !== 'Multiple') {
                $ctrl.filter.Operator = 'None';
            }

            $ctrl.filter.Text = '';
            $ctrl.filter.Argument = [];
            $ctrl.filter.HasFilter = false;
            $ctrl.retrieveData();
        };

        $ctrl.applyFilter = function() {
            $ctrl.filter.HasFilter = true;
            $ctrl.retrieveData();
        };

        $ctrl.close = function() {
            $ctrl.isOpen = false;
        };

        $ctrl.checkEvent = function(keyEvent) {
            if (keyEvent.which === 13) {
                $ctrl.applyFilter();
                keyEvent.preventDefault();
            }
        };

        var columns = $ctrl.$component.columns.filter(function($element) {
            return $element.Name === $ctrl.filter.Name;
        });

        $scope.$watch('$ctrl.filter.Operator', function (val) {
            if (val === 'None') $ctrl.filter.Text = '';
        });

        if (columns.length === 0) return;

        $scope.$watch('$ctrl.filter', function (n) {
            if (columns[0].Filter.Text !== n.Text) {
                n.Text = columns[0].Filter.Text;

                if (columns[0].Filter.Operator !== n.Operator) {
                    n.Operator = columns[0].Filter.Operator;
                }
            }

            $ctrl.filter.HasFilter = columns[0].Filter.HasFilter;
        });

        columns[0].Filter = $ctrl.filter;
        $ctrl.dataType = columns[0].DataType;
        $ctrl.filterOperators = filterOperators[$ctrl.dataType];

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
    };

    angular.module('tubular.directives')
         /**
         * @ngdoc component
         * @name tbColumnFilterButtons
         * @module tubular.directives
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
            controller: ['$scope',
                function ($scope) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        // Set currentFilter to either one of the parent components or for when this template is being rendered by $compile
                        $ctrl.currentFilter = $ctrl.$columnFilter || $ctrl.$columnDateTimeFilter || $ctrl.$columnOptionsFilter || $scope.$parent.$ctrl;
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbColumnSelector
         * @module tubular.directives
         *
         * @description
         * The `tbColumnSelector` is a button to show columns selector popup.
         */
        .component('tbColumnSelector', {
            require: {
                $component: '^tbGrid'
            },
            template: '<button class="btn btn-sm btn-default" ng-click="$ctrl.openColumnsSelector()">{{\'CAPTION_SELECTCOLUMNS\' | translate}}</button></div>',
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
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbColumnFilter` directive is a the basic filter popover. You need to define it inside a `tbColumn`.
         * 
         * The parent scope will provide information about the data type.
         * 
         * @param {string} title Set the popover title.
         * @param {string} text Set the search text.
         * @param {string} operator Set the initial operator, default depends on data type.
         * @param {object} argument Set the argument.
         */
        .component('tbColumnFilter', {
            require: {
                $component: '^tbGrid'
            },
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ' +
                'uib-popover-template="$ctrl.templateName" popover-placement="bottom" popover-title="{{$ctrl.filterTitle}}" popover-is-open="$ctrl.isOpen"' +
                ' popover-trigger="click outsideClick" ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '</div>',
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', 'tubularTemplateService', function ($scope, $element, $compile, $filter, tubularTemplateService) {
                    var $ctrl = this;

                    $ctrl.$onInit = function () {
                        $ctrl.templateName = tubularTemplateService.tbColumnFilterPopoverTemplateName;
                        setupFilter($scope, $element, $compile, $filter, $ctrl);
                    };
                }
            ]
        })
        /**
         * @ngdoc directive
         * @name tbColumnDateTimeFilter
         * @module tubular.directives
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
            template: '<div class="tubular-column-menu">' +
                '<button class="btn btn-xs btn-default btn-popover" ng-click="$ctrl.open()" ' +
                'ng-class="{ \'btn-success\': $ctrl.filter.HasFilter }">' +
                '<i class="fa fa-filter"></i></button>' +
                '</div>',
            bindings: {
                text: '@',
                argument: '@',
                operator: '@',
                title: '@'
            },
            controller: [
                '$scope', '$element', '$compile', '$filter', function ($scope, $element, $compile, $filter) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        $ctrl.format = 'yyyy-MM-dd';
                        $ctrl.dialogTemplate = '<button type="button" class="close" data-dismiss="modal" ng-click="$ctrl.close()"><span aria-hidden="true">×</span></button>' +
                            '<h4>{{$ctrl.filterTitle}}</h4>' +
                            '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                            '<select class="form-control" ng-model="$ctrl.filter.Operator" ng-options="key as value for (key , value) in $ctrl.filterOperators"></select>&nbsp;' +
                            '<input type="date" class="form-control" ng-model="$ctrl.filter.Text" ng-keypress="$ctrl.checkEvent($event)" />&nbsp;' +
                            '<input type="date" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ' +
                            'ng-show="$ctrl.filter.Operator == \'Between\'" />' +
                            '<hr />' +
                            '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                            '</form>';

                        setupFilter($scope, $element, $compile, $filter, $ctrl);
                    };
                }
            ]
        })
        /**
         * @ngdoc component
         * @name tbColumnOptionsFilter
         * @module tubular.directives
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
                '</div>',
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

                    $ctrl.$onInit = function() {
                        $ctrl.dataIsLoaded = false;
                        $ctrl.dialogTemplate = '<button type="button" class="close" data-dismiss="modal" ng-click="$ctrl.close()"><span aria-hidden="true">×</span></button>' +
                            '<h4>{{::$ctrl.filterTitle}}</h4>' +
                            '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                            '<select class="form-control checkbox-list" ng-model="$ctrl.filter.Argument" ng-options="item for item in $ctrl.optionsItems" ' +
                            ' multiple ng-disabled="$ctrl.dataIsLoaded == false"></select>' +
                            '<hr />' +
                            '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                            '</form>';

                        setupFilter($scope, $element, $compile, $filter, $ctrl, $ctrl.getOptionsFromUrl);
                        $ctrl.filter.Operator = 'Multiple';
                    };
                }
            ]
        });
})(window.angular);