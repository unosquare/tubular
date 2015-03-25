(function() {
    'use strict';

    angular.module('tubular.directives').directive('tubularTextSearch', [
        function() {
            return {
                require: '^tubularGrid',
                template:
                    '<div>' +
                        '<div class="input-group">' +
                        '<span class="input-group-addon {{css}}"><i class="glyphicon glyphicon-search"></i></span>' +
                        '<input type="search" class="form-control {{css}}" placeholder="search . . ." maxlength="20" ' +
                        'ng-model="$component.search.Text" ng-model-options="{ debounce: 300 }">' +
                        '<div>' +
                    '<div>',
                restrict: 'E',
                replace: true,
                transclude: false,
                scope: {
                    css: '@'
                },
                terminal: false,
                controller: [
                    '$scope', function($scope) {
                        $scope.$component = $scope.$parent.$parent;
                        $scope.tubularDirective = 'tubular-grid-text-search';
                        $scope.lastSearch = "";

                        $scope.$watch("$component.search.Text", function(val) {
                            if (angular.isUndefined(val)) return;

                            if ($scope.lastSearch !== "" && val === "") {
                                $scope.$component.search.Operator = 'None';
                                $scope.$component.retrieveData();
                                return;
                            }

                            if (val === "" || val.length < 3) return;
                            if (val === $scope.lastSearch) return;

                            $scope.lastSearch = val;
                            $scope.$component.search.Operator = 'Auto';
                            $scope.$component.retrieveData();
                        });
                    }
                ]
            };
        }
    ]).directive('tubularRemoveButton', [
        '$compile', function($compile) {

            return {
                require: '^tubularGrid',
                template: '<button ng-click="confirmDelete()" class="btn" ng-hide="model.$isEditing">{{ caption || \'Remove\' }}</button>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    caption: '@'
                },
                controller: [
                    '$scope', '$element', function($scope, $element) {
                        $scope.confirmDelete = function() {
                            $element.popover({
                                html: true,
                                title: 'Do you want to delete this row?',
                                content: function() {
                                    var html = '<div class="tubular-remove-popover"><button ng-click="model.delete()" class="btn btn-danger btn-xs">Remove</button>' +
                                        '&nbsp;<button ng-click="cancelDelete()" class="btn btn-default btn-xs">Cancel</button></div>';
                                    return $compile(html)($scope);
                                }
                            });

                            $element.popover('show');
                        };

                        $scope.cancelDelete = function() {
                            $element.popover('destroy');
                        };
                    }
                ]
            };
        }
    ]).directive('tubularSaveButton', [
        function() {

            return {
                require: '^tubularGrid',
                template: '<div><button ng-click="save()" class="btn btn-default {{ saveCss || \'\' }}" ng-disabled="!model.$valid()" ng-show="model.$isEditing">' +
                    '{{ saveCaption || \'Save\' }}' +
                    '</button>' +
                    '<button ng-click="cancel()" class="btn {{ cancelCss || \'btn-default\' }}" ng-show="model.$isEditing">' +
                    '{{ cancelCaption || \'Cancel\' }}' +
                    '</button></div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    isNew: '=?',
                    component: '=?',
                    saveCaption: '@',
                    saveCss: '@',
                    cancelCaption: '@',
                    cancelCss: '@'
                },
                controller: [
                    '$scope', function($scope) {
                        $scope.isNew = $scope.isNew || false;

                        if ($scope.isNew) {
                            if (angular.isUndefined($scope.component))
                                throw 'Define component.';
                        }

                        $scope.save = function() {
                            if ($scope.isNew) {
                                $scope.component.createRow();
                            } else {
                                $scope.model.edit();
                            }
                        };

                        $scope.cancel = function() {
                            $scope.model.revertChanges();
                        };
                    }
                ]
            };
        }
    ]).directive('tubularEditButton', [
        function() {

            return {
                require: '^tubularGrid',
                template: '<button ng-click="model.edit()" class="btn btn-default {{ css || \'\' }}" ng-hide="model.$isEditing">{{ caption || \'Edit\' }}</button>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    caption: '@',
                    css: '@'
                }
            };
        }
    ]).directive('tubularPageSizeSelector', [
        function () {

            return {
                require: '^tubularGrid',
                template: '<div class="{{css}}"><form class="form-inline">' +
                    '<div class="form-group">' +
                        '<label class="small">{{ caption || \'Page size:\' }}</label>' +
                        '<select ng-model="$parent.$parent.pageSize" class="form-control input-sm {{selectorCss}}">' +
                        '<option ng-repeat="item in [10,20,50,100]" value="{{item}}">{{item}}</option>' +
                        '</select>' +
                    '</div>' +
                    '</form></div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    caption: '@',
                    css: '@',
                    selectorCss: '@',
                    options: '=' //TODO: Add support
                }
            };
        }
    ]).directive('tubularExportButton', [
        function() {

            return {
                require: '^tubularGrid',
                template: '<div class="btn-group">' +
                    '<button class="btn btn-default dropdown-toggle {{css}}" data-toggle="dropdown" aria-expanded="false">' +
                    '<span class="fa fa-download"></span>&nbsp;Export CSV&nbsp;<span class="caret"></span>' +
                    '</button>' +
                    '<ul class="dropdown-menu" role="menu">' +
                    '<li><a href="javascript:void(0)" ng-click="downloadCsv($parent)">Current rows</a></li>' +
                    '<li><a href="javascript:void(0)" ng-click="downloadAllCsv($parent)">All rows</a></li>' +
                    '</ul>' +
                    '</div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    filename: '@',
                    css: '@'
                },
                controller: [
                    '$scope', 'tubularGridExportService', function($scope, tubularGridExportService) {
                        $scope.$component = $scope.$parent.$parent;

                        $scope.downloadCsv = function() {
                            tubularGridExportService.exportGridToCsv($scope.filename, $scope.$component);
                        };

                        $scope.downloadAllCsv = function() {
                            tubularGridExportService.exportAllGridToCsv($scope.filename, $scope.$component);
                        };
                    }
                ]
            };
        }
    ]).directive('tubularPrintButton', [
        function() {

            return {
                require: '^tubularGrid',
                template: '<button class="btn btn-default" ng-click="printGrid()">' +
                        '<span class="fa fa-print"></span>&nbsp;Print' +
                        '</button>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    title: '@',
                    printCss: '@'
                },
                controller: [
                    '$scope', function($scope) {
                        $scope.$component = $scope.$parent.$parent;

                        $scope.printGrid = function() {
                            $scope.$component.getFullDataSource(function(data) {
                                var tableHtml = "<table class='table table-bordered table-striped'><thead><tr>"
                                    + $scope.$component.columns.map(function(el) { return "<th>" + (el.Label || el.Name) + "</th>"; }).join(" ")
                                    + "</tr></thead>"
                                    + "<tbody>"
                                    + data.map(function(row) { return "<tr>" + row.map(function(cell) { return "<td>" + cell + "</td>"; }).join(" ") + "</tr>"; }).join(" ")
                                    + "</tbody>"
                                    + "</table>";

                                var popup = window.open("about:blank", "Print", "menubar=0,location=0,height=500,width=800");
                                popup.document.write('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/css/bootstrap.min.css" />');

                                if ($scope.printCss != '')
                                    popup.document.write('<link rel="stylesheet" href="' + $scope.printCss + '" />');

                                popup.document.write('<body onload="window.print();">');
                                popup.document.write('<h1>' + $scope.title + '</h1>');
                                popup.document.write(tableHtml);
                                popup.document.write('</body>');
                                popup.document.close();
                            });
                        };
                    }
                ]
            };
        }
    ]);
})();