(function() {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbTextSearch
         * @restrict E
         *
         * @description
         * The `tbTextSearch` directive is visual component to enable free-text search in a grid.
         * 
         * @scope
         */
        .directive('tbTextSearch', [function() {
            return {
                require: '^tbGrid',
                template:
                    '<div class="tubular-grid-search">' +
                        '<div class="input-group input-group-sm">' +
                        '<span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>' +
                        '<input type="search" class="form-control" placeholder="search . . ." maxlength="20" ' +
                        'ng-model="$component.search.Text" ng-model-options="{ debounce: 300 }">' +
                        '<span class="input-group-btn" ng-show="$component.search.Text.length > 0" ng-click="$component.search.Text = \'\'">' +
                        '<button class="btn btn-default"><i class="fa fa-times-circle"></i></button>' +
                        '</span>' +
                        '<div>' +
                        '<div>',
                restrict: 'E',
                replace: true,
                transclude: false,
                scope: {},
                terminal: false,
                controller: [
                    '$scope', function($scope) {
                        $scope.$component = $scope.$parent.$parent;
                        $scope.tubularDirective = 'tubular-grid-text-search';
                        $scope.lastSearch = "";

                        $scope.$watch("$component.search.Text", function(val, prev) {
                            if (angular.isUndefined(val)) return;
                            if (val === prev) return;

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
        ])
        /**
         * @ngdoc directive
         * @name tbRemoveButton
         * @restrict E
         *
         * @description
         * The `tbRemoveButton` directive is visual helper to show a Remove button with a popover to confirm the action.
         * 
         * @scope
         * 
         * @param {object} model The row to remove.
         * @param {string} caption Set the caption to use in the button, default Remove.
         * @param {string} icon Set the CSS icon's class, the button can have only icon.
         */
        .directive('tbRemoveButton', ['$compile', function($compile) {

            return {
                require: '^tbGrid',
                template: '<button ng-click="confirmDelete()" class="btn" ng-hide="model.$isEditing">' +
                    '<span ng-show="showIcon" class="{{icon}}"></span>' +
                    '<span ng-show="showCaption">{{ caption || \'Remove\' }}</span>' +
                    '</button>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    caption: '@',
                    icon: '@'
                },
                controller: [
                    '$scope', '$element', function($scope, $element) {
                        $scope.showIcon = angular.isDefined($scope.icon);
                        $scope.showCaption = !($scope.showIcon && angular.isUndefined($scope.caption));
                        $scope.confirmDelete = function() {
                            $element.popover({
                                html: true,
                                title: 'Do you want to delete this row?',
                                content: function() {
                                    var html = '<div class="tubular-remove-popover">' +
                                        '<button ng-click="model.delete()" class="btn btn-danger btn-xs">Remove</button>' +
                                        '&nbsp;<button ng-click="cancelDelete()" class="btn btn-default btn-xs">Cancel</button>' +
                                        '</div>';
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
        ])
        /**
         * @ngdoc directive
         * @name tbSaveButton
         * @restrict E
         *
         * @description
         * The `tbSaveButton` directive is visual helper to show a Save button and Cancel button.
         * 
         * @scope
         * 
         * @param {object} model The row to remove.
         * @param {boolean} isNew Set if the row is a new record.
         * @param {string} saveCaption Set the caption to use in Save the button, default Save.
         * @param {string} saveCss Add a CSS class to Save button.
         * @param {string} cancelCaption Set the caption to use in cancel the button, default Cancel.
         * @param {string} cancelCss Add a CSS class to Cancel button.
         */
        .directive('tbSaveButton', [function() {

            return {
                require: '^tbGrid',
                template: '<div ng-show="model.$isEditing"><button ng-click="save()" class="btn btn-default {{ saveCss || \'\' }}" ' +
                    'ng-disabled="!model.$valid()">' +
                    '{{ saveCaption || \'Save\' }}' +
                    '</button>' +
                    '<button ng-click="cancel()" class="btn {{ cancelCss || \'btn-default\' }}">' +
                    '{{ cancelCaption || \'Cancel\' }}' +
                    '</button></div>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    isNew: '=?',
                    saveCaption: '@',
                    saveCss: '@',
                    cancelCaption: '@',
                    cancelCss: '@'
                },
                controller: [
                    '$scope', function($scope) {
                        $scope.isNew = $scope.isNew || false;

                        $scope.save = function() {
                            if ($scope.isNew) {
                                $scope.model.$isNew = true;
                            }

                            $scope.currentRequest = $scope.model.save();

                            if ($scope.currentRequest === false) {
                                $scope.$emit('tbGrid_OnSavingNoChanges', $scope.model);
                                return;
                            }

                            $scope.currentRequest.then(
                                function(data) {
                                    $scope.model.$isEditing = false;
                                    $scope.$emit('tbGrid_OnSuccessfulSave', data, $scope.model.$component);
                                }, function(error) {
                                    $scope.$emit('tbGrid_OnConnectionError', error);
                                });
                        };

                        $scope.cancel = function() {
                            $scope.model.revertChanges();
                        };
                    }
                ]
            };
        }
        ])
        /**
         * @ngdoc directive
         * @name tbEditButton
         * @restrict E
         *
         * @description
         * The `tbEditButton` directive is visual helper to create an Edit button.
         * 
         * @scope
         * 
         * @param {object} model The row to remove.
         * @param {string} caption Set the caption to use in the button, default Edit.
         * @param {string} css Add a CSS class to the button.
         */
        .directive('tbEditButton', [function() {

            return {
                require: '^tbGrid',
                template: '<button ng-click="edit()" class="btn btn-default {{ css || \'\' }}" ' +
                    'ng-hide="model.$isEditing">{{ caption || \'Edit\' }}</button>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    caption: '@',
                    css: '@'
                },
                controller: [
                    '$scope', function($scope) {
                        $scope.component = $scope.$parent.$parent.$component;
                        $scope.edit = function() {
                            if ($scope.component.editorMode === 'popup') {
                                $scope.model.editPopup();
                            } else {
                                $scope.model.edit();
                            }
                        };
                    }
                ]
            };
        }
        ])
        /**
         * @ngdoc directive
         * @name tbPageSizeSelector
         * @restrict E
         *
         * @description
         * The `tbPageSizeSelector` directive is visual helper to render a dropdown to allow user select how many rows by page.
         * 
         * @scope
         * 
         * @param {string} caption Set the caption to use in the button, default "Page size:".
         * @param {string} css Add a CSS class to the `div` HTML element.
         * @param {string} selectorCss Add a CSS class to the `select` HTML element.
         * @param {array} options Set the page options array, default ['10', '20', '50', '100'].
         */
        .directive('tbPageSizeSelector', [function() {

            return {
                require: '^tbGrid',
                template: '<div class="{{css}}"><form class="form-inline">' +
                    '<div class="form-group">' +
                    '<label class="small">{{ caption || \'Page size:\' }}</label>' +
                    '<select ng-model="$parent.$parent.pageSize" class="form-control input-sm {{selectorCss}}" ' +
                    'ng-options="item for item in options">' +
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
                    options: '=?'
                },
                controller: [
                    '$scope', function($scope) {
                        $scope.options = angular.isDefined($scope.options) ? $scope.options : ['10', '20', '50', '100'];
                    }
                ]
            };
        }
        ])
        /**
         * @ngdoc directive
         * @name tbExportButton
         * @restrict E
         *
         * @description
         * The `tbExportButton` directive is visual helper to render a button to export grid to CSV format.
         * 
         * @scope
         * 
         * @param {string} filename Set the export file name.
         * @param {string} css Add a CSS class to the `button` HTML element.
         */
        .directive('tbExportButton', [function() {

            return {
                require: '^tbGrid',
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
        ])
        /**
         * @ngdoc directive
         * @name tbPrintButton
         * @restrict E
         *
         * @description
         * The `tbPrintButton` directive is visual helper to render a button to print the `tbGrid`.
         * 
         * @scope
         * 
         * @param {string} title Set the document's title.
         * @param {string} printCss Set a stylesheet URL to attach to print mode.
         */
        .directive('tbPrintButton', [function() {

            return {
                require: '^tbGrid',
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
                                    + $scope.$component.columns.map(function(el) {
                                        return "<th>" + (el.Label || el.Name) + "</th>";
                                    }).join(" ")
                                    + "</tr></thead>"
                                    + "<tbody>"
                                    + data.map(function(row) {
                                        if (typeof (row) === 'object')
                                            row = $.map(row, function(el) { return el; });

                                        return "<tr>" + row.map(function(cell) { return "<td>" + cell + "</td>"; }).join(" ") + "</tr>";
                                    }).join(" ")
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