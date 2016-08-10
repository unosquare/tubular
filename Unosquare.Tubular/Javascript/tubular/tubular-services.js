(function (angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.services
     * 
     * @description
     * Tubular Services module. 
     * It contains common services like HTTP client, filtering and printing services.
     */
    angular.module('tubular.services', ['ui.bootstrap'])
        /**
         * @ngdoc service
         * @name tubularPopupService
         *
         * @description
         * Use `tubularPopupService` to show or generate popups with a `tbForm` inside.
         */
        .service('tubularPopupService', [
            '$uibModal', '$rootScope', 'tubularTemplateService',
            function ($modal, $rootScope, tubularTemplateService) {
                var me = this;

                me.onSuccessForm = function (callback) {
                    $rootScope.$on('tbForm_OnSuccessfulSave', callback);
                };

                me.onConnectionError = function (callback) {
                    $rootScope.$on('tbForm_OnConnectionError', callback);
                };

                /**
                 * Opens a new Popup
                 * 
                 * @param {string} template 
                 * @param {object} model 
                 * @param {object} gridScope 
                 * @param {string} size 
                 * @returns {object} The Popup instance
                 */
                me.openDialog = function (template, model, gridScope, size) {
                    if (angular.isUndefined(template)) {
                        template = tubularTemplateService.generatePopup(model);
                    }

                    var dialog = $modal.open({
                        templateUrl: template,
                        backdropClass: 'fullHeight',
                        animation: false,
                        size: size,
                        controller: [
                            '$scope', function ($scope) {
                                $scope.Model = model;

                                $scope.savePopup = function (innerModel, forceUpdate) {
                                    innerModel = innerModel || $scope.Model;

                                    // If we have nothing to save and it's not a new record, just close
                                    if (!forceUpdate && !innerModel.$isNew && !innerModel.$hasChanges) {
                                        $scope.closePopup();
                                        return null;
                                    }

                                    var result = innerModel.save(forceUpdate);

                                    if (angular.isUndefined(result) || result === false) {
                                        return null;
                                    }

                                    result.then(
                                        function (data) {
                                            $scope.$emit('tbForm_OnSuccessfulSave', data);
                                            $rootScope.$broadcast('tbForm_OnSuccessfulSave', data);
                                            $scope.Model.$isLoading = false;
                                            if (gridScope.autoRefresh) gridScope.retrieveData();
                                            dialog.close();

                                            return data;
                                        }, function (error) {
                                            $scope.$emit('tbForm_OnConnectionError', error);
                                            $rootScope.$broadcast('tbForm_OnConnectionError', error);
                                            $scope.Model.$isLoading = false;

                                            return error;
                                        });

                                    return result;
                                };

                                $scope.closePopup = function () {
                                    if (angular.isDefined($scope.Model.revertChanges)) {
                                        $scope.Model.revertChanges();
                                    }

                                    dialog.close();
                                };
                            }
                        ]
                    });

                    return dialog;
                };
            }
        ])
        /**
         * @ngdoc service
         * @name tubularGridExportService
         *
         * @description
         * Use `tubularGridExportService` to export your `tbGrid` to a CSV file.
         */
        .service('tubularGridExportService', function () {
            var me = this;

            me.getColumns = function (gridScope) {
                return gridScope.columns.map(function (c) { return c.Label; });
            };

            me.getColumnsVisibility = function (gridScope) {
                return gridScope.columns
                    .map(function (c) { return c.Visible; });
            };

            me.exportAllGridToCsv = function (filename, gridScope) {
                var columns = me.getColumns(gridScope);
                var visibility = me.getColumnsVisibility(gridScope);

                gridScope.getFullDataSource(function (data) {
                    me.exportToCsv(filename, columns, data, visibility);
                });
            };

            me.exportGridToCsv = function (filename, gridScope) {
                var columns = me.getColumns(gridScope);
                var visibility = me.getColumnsVisibility(gridScope);

                gridScope.currentRequest = {};
                me.exportToCsv(filename, columns, gridScope.dataSource.Payload, visibility);
                gridScope.currentRequest = null;
            };

            me.exportToCsv = function (filename, header, rows, visibility) {
                var processRow = function (row) {
                    if (typeof (row) === 'object') {
                        row = Object.keys(row).map(function (key) { return row[key]; });
                    }

                    var finalVal = '';
                    for (var j = 0; j < row.length; j++) {
                        if (!visibility[j]) {
                            continue;
                        }

                        var innerValue = row[j] == null ? '' : row[j].toString();

                        if (row[j] instanceof Date) {
                            innerValue = row[j].toLocaleString();
                        }

                        var result = innerValue.replace(/"/g, '""');

                        if (result.search(/("|,|\n)/g) >= 0) {
                            result = '"' + result + '"';
                        }

                        if (j > 0) {
                            finalVal += ',';
                        }

                        finalVal += result;
                    }
                    return finalVal + '\n';
                };

                var csvFile = '';

                if (header.length > 0) {
                    csvFile += processRow(header);
                }

                for (var i = 0; i < rows.length; i++) {
                    csvFile += processRow(rows[i]);
                }

                // Add "\uFEFF" (UTF-8 BOM)
                var blob = new Blob(["\uFEFF" + csvFile], { type: 'text/csv;charset=utf-8;' });
                window.saveAs(blob, filename);
            };
        })
        /**
         * @ngdoc service
         * @name tubularEditorService
         *
         * @description
         * The `tubularEditorService` service is a internal helper to setup any `TubularModel` with a UI.
         */
        .service('tubularEditorService', ['$filter', function ($filter) {
            var me = this;

            /**
            * Simple helper to generate a unique name for Tubular Forms
            */
            me.getUniqueTbFormName = function () {
                // TODO: Maybe move this to another service
                window.tbFormCounter = window.tbFormCounter || (window.tbFormCounter = -1);
                window.tbFormCounter++;
                return "tbForm" + window.tbFormCounter;
            };

            /**
             * Setups a new Editor, this functions is like a common class constructor to be used
             * with all the tubularEditors.
             */
            me.setupScope = function (scope, defaultFormat, ctrl, setDirty) {
                if (angular.isUndefined(ctrl)) ctrl = scope;

                ctrl.isEditing = angular.isUndefined(ctrl.isEditing) ? true : ctrl.isEditing;
                ctrl.showLabel = ctrl.showLabel || false;
                ctrl.label = ctrl.label || (ctrl.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                ctrl.required = ctrl.required || false;
                ctrl.readOnly = ctrl.readOnly || false;
                ctrl.format = ctrl.format || defaultFormat;
                ctrl.$valid = true;

                // Get the field reference using the Angular way
                ctrl.getFormField = function () {
                    var parent = scope.$parent;

                    while (true) {
                        if (parent == null) break;
                        if (angular.isDefined(parent.tubularDirective) && parent.tubularDirective === 'tubular-form') {
                            var formScope = parent.getFormScope();

                            return formScope == null ? null : formScope[scope.Name];
                        }

                        parent = parent.$parent;
                    }

                    return null;
                };

                ctrl.$dirty = function () {
                    // Just forward the property
                    var formField = ctrl.getFormField();

                    return formField == null ? true : formField.$dirty;
                };

                ctrl.checkValid = function () {
                    ctrl.$valid = true;
                    ctrl.state.$errors = [];

                    if ((angular.isUndefined(ctrl.value) && ctrl.required) ||
                    (Object.prototype.toString.call(ctrl.value) === "[object Date]" && isNaN(ctrl.value.getTime()) && ctrl.required)) {
                        ctrl.$valid = false;
                        ctrl.state.$errors = [$filter('translate')('EDITOR_REQUIRED')];

                        if (angular.isDefined(scope.$parent.Model)) {
                            scope.$parent.Model.$state[scope.Name] = ctrl.state;
                        }

                        return;
                    }

                    // Check if we have a validation function, otherwise return
                    if (angular.isUndefined(ctrl.validate)) {
                        return;
                    }

                    ctrl.validate();
                };

                scope.$watch(function () {
                    return ctrl.value;
                }, function (newValue, oldValue) {
                    if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) {
                        return;
                    }

                    // This is the state API for every property in the Model
                    ctrl.state = {
                        $valid: function () {
                            ctrl.checkValid();
                            return this.$errors.length === 0;
                        },
                        $dirty: function () {
                            return ctrl.$dirty();
                        },
                        $errors: []
                    };

                    ctrl.$valid = true;

                    // Try to match the model to the parent, if it exists
                    if (angular.isDefined(scope.$parent.Model)) {
                        if (angular.isDefined(scope.$parent.Model[ctrl.name])) {
                            scope.$parent.Model[ctrl.name] = newValue;

                            if (angular.isUndefined(scope.$parent.Model.$state)) {
                                scope.$parent.Model.$state = [];
                            }

                            scope.$parent.Model.$state[scope.Name] = ctrl.state;
                        } else if (angular.isDefined(scope.$parent.Model.$addField)) {
                            scope.$parent.Model.$addField(ctrl.name, newValue, true);
                        }
                    }

                    ctrl.checkValid();
                });

                var parent = scope.$parent;

                // We try to find a Tubular Form in the parents
                while (true) {
                    if (parent == null) break;
                    if (angular.isDefined(parent.tubularDirective) &&
                    (parent.tubularDirective === 'tubular-form' ||
                        parent.tubularDirective === 'tubular-rowset')) {

                        if (ctrl.name === null) {
                            return;
                        }

                        if (parent.hasFieldsDefinitions !== false) {
                            throw 'Cannot define more fields. Field definitions have been sealed';
                        }

                        ctrl.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

                        scope.Name = ctrl.name;

                        ctrl.bindScope = function () {
                            scope.$parent.Model = parent.model;

                            if (angular.equals(ctrl.value, parent.model[scope.Name]) === false) {
                                if (angular.isDefined(parent.model[scope.Name])) {
                                    if (ctrl.DataType === 'date' && parent.model[scope.Name] != null) {
                                        // TODO: Include MomentJS
                                        var timezone = new Date(Date.parse(parent.model[scope.Name])).toString().match(/([-\+][0-9]+)\s/)[1];
                                        timezone = timezone.substr(0, timezone.length - 2) + ':' + timezone.substr(timezone.length - 2, 2);
                                        ctrl.value = new Date(Date.parse(parent.model[scope.Name] + timezone));
                                    } else {
                                        ctrl.value = parent.model[scope.Name];
                                    }
                                }

                                parent.$watch(function () {
                                    return ctrl.value;
                                }, function (value) {
                                    if (value === parent.model[scope.Name]) return;

                                    parent.model[scope.Name] = value;
                                });
                            }

                            scope.$watch(function () {
                                return parent.model[scope.Name];
                            }, function (value) {
                                if (value === ctrl.value) return;

                                ctrl.value = value;
                            }, true);

                            if ((!ctrl.value || ctrl.value == null) && (ctrl.defaultValue && ctrl.defaultValue != null)) {
                                if (ctrl.DataType === 'date' && ctrl.defaultValue != null) {
                                    ctrl.defaultValue = new Date(ctrl.defaultValue);
                                }
                                if (ctrl.DataType === 'numeric' && ctrl.defaultValue != null) {
                                    ctrl.defaultValue = parseFloat(ctrl.defaultValue);
                                }

                                ctrl.value = ctrl.defaultValue;
                            }

                            if (angular.isUndefined(parent.model.$state)) {
                                parent.model.$state = {};
                            }

                            // This is the state API for every property in the Model
                            parent.model.$state[scope.Name] = {
                                $valid: function () {
                                    ctrl.checkValid();
                                    return this.$errors.length === 0;
                                },
                                $dirty: function () {
                                    return ctrl.$dirty();
                                },
                                $errors: []
                            };

                            if (angular.equals(ctrl.state, parent.model.$state[scope.Name]) === false) {
                                ctrl.state = parent.model.$state[scope.Name];
                            }

                            if (setDirty) {
                                var formScope = ctrl.getFormField();
                                if (formScope) formScope.$setDirty();
                            }
                        };

                        parent.fields.push(ctrl);

                        break;
                    }

                    parent = parent.$parent;
                }
            };

            /**
             * True if browser has support for HTML5 date input.
             */
            me.canUseHtml5Date = function () {
                // TODO: Remove dup!
                var input = document.createElement('input');
                input.setAttribute('type', 'date');

                var notADateValue = 'not-a-date';
                input.setAttribute('value', notADateValue);

                return (input.value !== notADateValue);
            }();
        }
        ]);
})(window.angular);