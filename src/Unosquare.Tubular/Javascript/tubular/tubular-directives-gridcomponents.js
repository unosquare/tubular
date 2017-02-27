(function (angular) {
    'use strict';

    angular.module('tubular.directives')

        /**
         * @ngdoc component
         * @name tbRemoveButton
         * @module tubular.directives
         *
         * @description
         * The `tbRemoveButton` component is visual helper to show a Remove button with a popover to confirm the action.
         * 
         * @param {object} model The row to remove.
         * @param {string} caption Set the caption to use in the button, default Remove.
         * @param {string} cancelCaption Set the caption to use in the Cancel button, default `CAPTION_REMOVE` i18n resource.
         * @param {string} legend Set the legend to warn user, default `UI_REMOVEROW` i18n resource.
         * @param {string} icon Set the CSS icon's class, the button can have only icon.
         */
        .component('tbRemoveButton', {
            require: '^tbGrid',
            templateUrl: 'tbRemoveButton.tpl.html',
            bindings: {
                model: '=',
                caption: '@',
                cancelCaption: '@',
                legend: '@',
                icon: '@'
            },
            controller: function () {
                var $ctrl = this;

                $ctrl.$onInit = function () {
                    $ctrl.showIcon = angular.isDefined($ctrl.icon);
                    $ctrl.showCaption = !($ctrl.showIcon && angular.isUndefined($ctrl.caption));

                    $ctrl.templateName = 'tbRemoveButtonPopover.tpl.html';
                };
            }
        })
        /**
         * @ngdoc directive
         * @name tbSaveButton
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbSaveButton` directive is visual helper to show a Save button and Cancel button.
         * 
         * @param {object} model The row to remove.
         * @param {boolean} isNew Set if the row is a new record.
         * @param {string} saveCaption Set the caption to use in Save the button, default Save.
         * @param {string} saveCss Add a CSS class to Save button.
         * @param {string} cancelCaption Set the caption to use in cancel the button, default Cancel.
         * @param {string} cancelCss Add a CSS class to Cancel button.
         */
        .directive('tbSaveButton', [
            function () {

                return {
                    require: '^tbGrid',
                    templateUrl: 'tbSaveButton.tpl.html',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        model: '=',
                        isNew: '=?',
                        saveCaption: '@',
                        saveCss: '@',
                        cancelCaption: '@',
                        cancelCss: '@'
                    },
                    controller: [
                        '$scope', function ($scope) {
                            $scope.isNew = $scope.isNew || false;

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
                };
            }
        ])
        /**
         * @ngdoc component
         * @name tbEditButton
         * @module tubular.directives
         *
         * @description
         * The `tbEditButton` component is visual helper to create an Edit button.
         * 
         * @param {object} model The row to remove.
         * @param {string} caption Set the caption to use in the button, default Edit.
         */
        .component('tbEditButton', {
            require: {
                $component: '^tbGrid'
            },
            templateUrl: 'tbEditButton.tpl.html',
            bindings: {
                model: '=',
                caption: '@'
            },
            controller: function () {
                var $ctrl = this;

                $ctrl.edit = function () {
                    if ($ctrl.$component.editorMode === 'popup') {
                        $ctrl.model.editPopup();
                    } else {
                        $ctrl.model.edit();
                    }
                };
            }
        })
        /**
         * @ngdoc component
         * @name tbPageSizeSelector
         * @module tubular.directives
         *
         * @description
         * The `tbPageSizeSelector` component is visual helper to render a dropdown to allow user select how many rows by page.
         * 
         * @param {string} caption Set the caption to use in the button, default "Page size:".
         * @param {string} css Add a CSS class to the `div` HTML element.
         * @param {string} selectorCss Add a CSS class to the `select` HTML element.
         * @param {array} options Set the page options array, default [10, 20, 50, 100].
         */
        .component('tbPageSizeSelector', {
            require: {
                $component: '^tbGrid'
            },
            templateUrl: 'tbPageSizeSelector.tpl.html',
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
         * @ngdoc component
         * @name tbExportButton
         * @module tubular.directives
         *
         * @description
         * The `tbExportButton` component is visual helper to render a button to export grid to CSV format.
         * 
         * @param {string} filename Set the export file name.
         * @param {string} css Add a CSS class to the `button` HTML element.
         * @param {string} caption Set the caption.
         * @param {string} captionMenuCurrent Set the caption.
         * @param {string} captionMenuAll Set the caption.
         */
        .component('tbExportButton', {
            require: {
                $component: '^tbGrid'
            },
            templateUrl: 'tbExportButton.tpl.html',
            bindings: {
                filename: '@',
                css: '@',
                caption: '@',
                captionMenuCurrent: '@',
                captionMenuAll: '@'
            },
            controller: ['tubularGridExportService', function (tubular) {
                var $ctrl = this;

                $ctrl.downloadCsv = function () {
                    tubular.exportGridToCsv($ctrl.filename, $ctrl.$component);
                };

                $ctrl.downloadAllCsv = function () {
                    tubular.exportAllGridToCsv($ctrl.filename, $ctrl.$component);
                };
            }
            ]
        })
        /**
         * @ngdoc component
         * @name tbPrintButton
         * @module tubular.directives
         *
         * @description
         * The `tbPrintButton` component is visual helper to render a button to print the `tbGrid`.
         * 
         * @param {string} title Set the document's title.
         * @param {string} printCss Set a stylesheet URL to attach to print mode.
         * @param {string} caption Set the caption.
         */
        .component('tbPrintButton', {
            require: {
                $component: '^tbGrid'
            },
            templateUrl: 'tbPrintButton.tpl.html',
            bindings: {
                title: '@',
                printCss: '@',
                caption: '@'
            },
            controller: ['$window', function ($window) {
                var $ctrl = this;

                $ctrl.printGrid = function () {
                    $ctrl.$component.getFullDataSource(function (data) {
                        var tableHtml = '<table class="table table-bordered table-striped"><thead><tr>'
                            + $ctrl.$component.columns
                            .filter(function (c) { return c.Visible; })
                            .map(function (el) {
                                return '<th>' + (el.Label || el.Name) + '</th>';
                            }).join(' ')
                            + '</tr></thead>'
                            + '<tbody>'
                            + data.map(function (row) {
                                if (angular.isObject(row)) {
                                    row = Object.keys(row).map(function (key) { return row[key] });
                                }

                                return '<tr>' + row.map(function (cell, index) {
                                    if (angular.isDefined($ctrl.$component.columns[index]) &&
                                        !$ctrl.$component.columns[index].Visible) {
                                        return '';
                                    }

                                    return '<td>' + cell + '</td>';
                                }).join(' ') + '</tr>';
                            }).join('  ')
                            + '</tbody>'
                            + '</table>';

                        var popup = $window.open('about:blank', 'Print', 'menubar=0,location=0,height=500,width=800');
                        popup.document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />');

                        if ($ctrl.printCss !== '') {
                            popup.document.write('<link rel="stylesheet" href="' + $ctrl.printCss + '" />');
                        }

                        popup.document.write('<body onload="window.print();">');
                        popup.document.write('<h1>' + $ctrl.title + '</h1>');
                        popup.document.write(tableHtml);
                        popup.document.write('</body>');
                        popup.document.close();
                    });
                };
            }]
        });
})(angular);