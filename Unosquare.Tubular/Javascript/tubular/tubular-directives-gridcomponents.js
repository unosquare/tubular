(function () {
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
         * 
         * @param {number} minChars How many chars before to search, default 3.
         */
        .component('tbTextSearch', {
            require: '^tbGrid',
            template:
                '<div class="tubular-grid-search">' +
                    '<div class="input-group input-group-sm">' +
                    '<span class="input-group-addon"><i class="fa fa-search"></i></span>' +
                    '<input type="search" class="form-control" placeholder="{{:: $ctrl.placeholder || (\'UI_SEARCH\' | translate) }}" maxlength="20" ' +
                    'ng-model="$component.search.Text" ng-model-options="{ debounce: 300 }">' +
                    '<span class="input-group-btn" ng-show="$component.search.Text.length > 0">' +
                    '<button class="btn btn-default" uib-tooltip="{{\'CAPTION_CLEAR\' | translate}}" ng-click="$component.search.Text = \'\'">' +
                    '<i class="fa fa-times-circle"></i>' +
                    '</button>' +
                    '</span>' +
                    '<div>' +
                    '<div>',
            transclude: false,
            bindings: {
                minChars: '@?',
                placeholder: '@'
            },
            controller: [
                '$scope', function ($scope) {
                    $scope.$component = $scope.$parent.$parent;
                    $scope.minChars = $scope.$ctrl.minChars || 3;
                    $scope.tubularDirective = 'tubular-grid-text-search';
                    $scope.lastSearch = $scope.$component.search.Text;

                    $scope.$watch("$component.search.Text", function (val, prev) {
                        if (angular.isUndefined(val) || val === prev) {
                            return;
                        }

                        if ($scope.lastSearch !== "" && val === "") {
                            $scope.$component.saveSearch();
                            $scope.$component.search.Operator = 'None';
                            $scope.$component.retrieveData();
                            return;
                        }

                        if (val === "" || val.length < $scope.minChars) {
                            return;
                        }

                        if (val === $scope.lastSearch) {
                            return;
                        }

                        $scope.lastSearch = val;
                        $scope.$component.saveSearch();
                        $scope.$component.search.Operator = 'Auto';
                        $scope.$component.retrieveData();
                    });
                }
            ]
        })
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
         * @param {string} cancelCaption Set the caption to use in the Cancel button, default Cancel.
         * @param {string} legend Set the legend to warn user, default 'Do you want to delete this row?'.
         * @param {string} icon Set the CSS icon's class, the button can have only icon.
         */
        .directive('tbRemoveButton', ['$compile', function ($compile) {
            return {
                require: '^tbGrid',
                template: '<button ng-click="confirmDelete()" class="btn" ng-hide="model.$isEditing">' +
                    '<span ng-show="showIcon" class="{{::icon}}"></span>' +
                    '<span ng-show="showCaption">{{:: caption || (\'CAPTION_REMOVE\' | translate) }}</span>' +
                    '</button>',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    model: '=',
                    caption: '@',
                    cancelCaption: '@',
                    legend: '@',
                    icon: '@'
                },
                controller: [
                    '$scope', '$element', '$filter', function ($scope, $element, $filter) {
                        $scope.showIcon = angular.isDefined($scope.icon);
                        $scope.showCaption = !($scope.showIcon && angular.isUndefined($scope.caption));
                        $scope.confirmDelete = function () {
                            $element.popover({
                                html: true,
                                title: $scope.legend || $filter('translate')('UI_REMOVEROW'),
                                content: function () {
                                    var html = '<div class="tubular-remove-popover">' +
                                        '<button ng-click="model.delete()" class="btn btn-danger btn-xs">' + ($scope.caption || $filter('translate')('CAPTION_REMOVE')) + '</button>' +
                                        '&nbsp;<button ng-click="cancelDelete()" class="btn btn-default btn-xs">' + ($scope.cancelCaption || $filter('translate')('CAPTION_CANCEL')) + '</button>' +
                                        '</div>';

                                    return $compile(html)($scope);
                                }
                            });

                            $element.popover('show');
                        };

                        $scope.cancelDelete = function () {
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
         .component('tbSaveButton', {
             require: '^tbGrid',
             template: '<div ng-show="model.$isEditing">' +
                 '<button ng-click="save()" class="btn btn-default {{:: $ctrl.saveCss || \'\' }}" ' +
                 'ng-disabled="!model.$valid()">' +
                 '{{:: $ctrl.saveCaption || (\'CAPTION_SAVE\' | translate) }}' +
                 '</button>' +
                 '<button ng-click="cancel()" class="btn {{:: $ctrl.cancelCss || \'btn-default\' }}">' +
                 '{{:: $ctrl.cancelCaption || (\'CAPTION_CANCEL\' | translate) }}' +
                 '</button></div>',
             transclude: true,
             bindings: {
                 model: '=',
                 isNew: '=?',
                 saveCaption: '@',
                 saveCss: '@',
                 cancelCaption: '@',
                 cancelCss: '@'
             },
             controller: [
                 '$scope', function ($scope) {
                     $scope.isNew = $scope.$ctrl.isNew || false;
                     $scope.model = $scope.$ctrl.model

                     $scope.save = function () {
                         if ($scope.isNew) {
                             $scope.model.$isNew = true;
                         }

                         if (!$scope.model.$valid()) {
                             return;
                         }

                         $scope.currentRequest = $scope.model.save();

                         if ($scope.currentRequest === false) {
                             $scope.$emit('tbGrid_OnSavingNoChanges', $scope.model);
                             return;
                         }

                         $scope.currentRequest.then(
                             function (data) {
                                 $scope.model.$isEditing = false;

                                 if (angular.isDefined($scope.model.$component) &&
                                     angular.isDefined($scope.model.$component.autoRefresh) &&
                                     $scope.model.$component.autoRefresh) {
                                     $scope.model.$component.retrieveData();
                                 }

                                 $scope.$emit('tbGrid_OnSuccessfulSave', data, $scope.model.$component);
                             }, function (error) {
                                 $scope.$emit('tbGrid_OnConnectionError', error);
                             });
                     };

                     $scope.cancel = function () {
                         $scope.model.revertChanges();
                     };
                 }
             ]
         })
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
         */
        .component('tbEditButton', {
            require: '^tbGrid',
            template: '<button ng-click="edit()" class="btn btn-xs btn-default" ' +
                'ng-hide="$ctrl.model.$isEditing">{{:: $ctrl.caption || (\'CAPTION_EDIT\' | translate) }}</button>',
            transclude: true,
            bindings: {
                model: '=',
                caption: '@'
            },
            controller: [
                '$scope', function ($scope) {
                    $scope.component = $scope.$parent.$parent.$component;

                    $scope.edit = function () {
                        if ($scope.component.editorMode === 'popup') {
                            $scope.$ctrl.model.editPopup();
                        } else {
                            $scope.$ctrl.model.edit();
                        }
                    };
                }
            ]
        })
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
         * @param {array} options Set the page options array, default [10, 20, 50, 100].
         */
        .component('tbPageSizeSelector', {
            require: '^tbGrid',
            template: '<div class="{{::$ctrl.css}}"><form class="form-inline">' +
                '<div class="form-group">' +
                '<label class="small">{{:: $ctrl.caption || (\'UI_PAGESIZE\' | translate) }} </label>&nbsp;' +
                '<select ng-model="$parent.$parent.pageSize" class="form-control input-sm {{::$ctrl.selectorCss}}" ' +
                'ng-options="item for item in options">' +
                '</select>' +
                '</div>' +
                '</form></div>',
            transclude: true,
            bindings: {
                caption: '@',
                css: '@',
                selectorCss: '@',
                options: '=?'
            },
            controller: [
                '$scope', function ($scope) {
                    $scope.options = angular.isDefined($scope.$ctrl.options) ? $scope.$ctrl.options : [10, 20, 50, 100];
                }
            ]
        })
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
         * @param {string} caption Set the caption.
         * @param {string} captionMenuCurrent Set the caption.
         * @param {string} captionMenuAll Set the caption.
         */
        .component('tbExportButton', {
            require: '^tbGrid',
            template: '<div class="btn-group">' +
                '<button class="btn btn-default dropdown-toggle {{::$ctrl.css}}" data-toggle="dropdown" aria-expanded="false">' +
                '<span class="fa fa-download"></span>&nbsp;{{:: $ctrl.caption || (\'UI_EXPORTCSV\' | translate)}}&nbsp;<span class="caret"></span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu">' +
                '<li><a href="javascript:void(0)" ng-click="downloadCsv($parent)">{{:: $ctrl.captionMenuCurrent || (\'UI_CURRENTROWS\' | translate)}}</a></li>' +
                '<li><a href="javascript:void(0)" ng-click="downloadAllCsv($parent)">{{:: $ctrl.captionMenuAll || (\'UI_ALLROWS\' | translate)}}</a></li>' +
                '</ul>' +
                '</div>',
            transclude: true,
            bindings: {
                filename: '@',
                css: '@',
                caption: '@',
                captionMenuCurrent: '@',
                captionMenuAll: '@'
            },
            controller: [
                '$scope', 'tubularGridExportService', function ($scope, tubularGridExportService) {
                    $scope.$component = $scope.$parent.$parent;

                    $scope.downloadCsv = function () {
                        tubularGridExportService.exportGridToCsv($scope.$ctrl.filename, $scope.$component);
                    };

                    $scope.downloadAllCsv = function () {
                        tubularGridExportService.exportAllGridToCsv($scope.$ctrl.filename, $scope.$component);
                    };
                }
            ]
        })

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
         * @param {string} caption Set the caption.
         */
        .component('tbPrintButton', {
            require: '^tbGrid',
            template: '<button class="btn btn-default" ng-click="printGrid()">' +
                '<span class="fa fa-print"></span>&nbsp;{{$ctrl.caption || (\'CAPTION_PRINT\' | translate)}}' +
                '</button>',
            transclude: true,
            bindings: {
                title: '@',
                printCss: '@',
                caption: '@'
            },
            controller: [
                '$scope', function ($scope) {
                    $scope.$component = $scope.$parent.$parent;

                    $scope.printGrid = function () {
                        $scope.$component.getFullDataSource(function (data) {
                            var tableHtml = "<table class='table table-bordered table-striped'><thead><tr>"
                                + $scope.$component.columns
                                .filter(function (c) { return c.Visible; })
                                .map(function (el) {
                                    return "<th>" + (el.Label || el.Name) + "</th>";
                                }).join(" ")
                                + "</tr></thead>"
                                + "<tbody>"
                                + data.map(function (row) {
                                    if (typeof (row) === 'object') {
                                        row = $.map(row, function (el) { return el; });
                                    }

                                    return "<tr>" + row.map(function (cell, index) {
                                        if (angular.isDefined($scope.$component.columns[index]) &&
                                        !$scope.$component.columns[index].Visible) {
                                            return "";
                                        }

                                        return "<td>" + cell + "</td>";
                                    }).join(" ") + "</tr>";
                                }).join(" ")
                                + "</tbody>"
                                + "</table>";

                            var popup = window.open("about:blank", "Print", "menubar=0,location=0,height=500,width=800");
                            popup.document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />');

                            if ($scope.$ctrl.printCss != '') {
                                popup.document.write('<link rel="stylesheet" href="' + $scope.$ctrl.printCss + '" />');
                            }

                            popup.document.write('<body onload="window.print();">');
                            popup.document.write('<h1>' + $scope.$ctrl.title + '</h1>');
                            popup.document.write(tableHtml);
                            popup.document.write('</body>');
                            popup.document.close();
                        });
                    };
                }
            ]
        });
})();