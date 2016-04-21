(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.services
     * 
     * @description
     * Tubular Services module. 
     * It contains common services like Http and OData clients, and filtering and printing services.
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
            function tubularPopupService($modal, $rootScope, tubularTemplateService) {
                var me = this;

                me.onSuccessForm = function(callback) {
                    $rootScope.$on('tbForm_OnSuccessfulSave', callback);
                };

                me.onConnectionError = function(callback) {
                    $rootScope.$on('tbForm_OnConnectionError', callback);
                };

                /**
                 * Opens a new Popup
                 * @param {string} template 
                 * @param {object} model 
                 * @param {object} gridScope 
                 * @param {string} size 
                 * @returns {object} The Popup instance
                 */
                me.openDialog = function(template, model, gridScope, size) {
                    if (angular.isUndefined(template)) {
                        template = tubularTemplateService.generatePopup(model);
                    }

                    var dialog = $modal.open({
                        templateUrl: template,
                        backdropClass: 'fullHeight',
                        animation: false,
                        size: size,
                        controller: [
                            '$scope', function($scope) {
                                $scope.Model = model;

                                $scope.savePopup = function(innerModel, forceUpdate) {
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
                                        function(data) {
                                            $scope.$emit('tbForm_OnSuccessfulSave', data);
                                            $rootScope.$broadcast('tbForm_OnSuccessfulSave', data);
                                            $scope.Model.$isLoading = false;
                                            if (gridScope.autoRefresh) gridScope.retrieveData();
                                            dialog.close();

                                            return data;
                                        }, function(error) {
                                            $scope.$emit('tbForm_OnConnectionError', error);
                                            $rootScope.$broadcast('tbForm_OnConnectionError', error);
                                            $scope.Model.$isLoading = false;

                                            return error;
                                        });

                                    return result;
                                };

                                $scope.closePopup = function() {
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
        .service('tubularGridExportService', function tubularGridExportService() {
            var me = this;

            me.getColumns = function(gridScope) {
                return gridScope.columns.map(function(c) { return c.Label; });
            };

            me.getColumnsVisibility = function(gridScope) {
                return gridScope.columns
                    .map(function(c) { return c.Visible; });
            };

            me.exportAllGridToCsv = function(filename, gridScope) {
                var columns = me.getColumns(gridScope);
                var visibility = me.getColumnsVisibility(gridScope);

                gridScope.getFullDataSource(function(data) {
                    me.exportToCsv(filename, columns, data, visibility);
                });
            };

            me.exportGridToCsv = function(filename, gridScope) {
                var columns = me.getColumns(gridScope);
                var visibility = me.getColumnsVisibility(gridScope);

                gridScope.currentRequest = {};
                me.exportToCsv(filename, columns, gridScope.dataSource.Payload, visibility);
                gridScope.currentRequest = null;
            };

            me.exportToCsv = function(filename, header, rows, visibility) {
                var processRow = function(row) {
                    if (typeof (row) === 'object') {
                        row = Object.keys(row).map(function(key) { return row[key]; });
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
         * @name tubularGridFilterService
         *
         * @description
         * The `tubularGridFilterService` service is a internal helper to setup any `FilterModel` with a UI.
         */
        .service('tubularGridFilterService', [
            'tubularGridFilterModel', '$compile', '$filter', function tubularGridFilterService(FilterModel, $compile, $filter) {
                var me = this;

                me.applyFilterFuncs = function(scope, el, attributes, openCallback) {
                    scope.$component = scope.$parent.$component;

                    scope.$watch('filter.Operator', function(val) {
                        if (val === 'None') scope.filter.Text = '';
                    });

                    scope.$watch(function() {
                        var columns = scope.$component.columns.filter(function(el) {
                            return el.Name === scope.filter.Name;
                        });

                        return columns.length !== 0 ? columns[0] : null;
                    }, function(val) {
                        if (val && val != null) {
                            if (scope.filter.HasFilter != val.Filter.HasFilter) {
                                scope.filter.HasFilter = val.Filter.HasFilter;
                                scope.filter.Text = val.Filter.Text;
                                scope.retrieveData();
                            }
                        }
                    }, true);

                    scope.retrieveData = function() {
                        var columns = scope.$component.columns.filter(function(el) {
                            return el.Name === scope.filter.Name;
                        });

                        if (columns.length !== 0) {
                            columns[0].Filter = scope.filter;
                        }

                        scope.$component.retrieveData();
                        scope.close();
                    };

                    scope.clearFilter = function() {
                        if (scope.filter.Operator != 'Multiple') {
                            scope.filter.Operator = 'None';
                        }

                        scope.filter.Text = '';
                        scope.filter.Argument = [];
                        scope.filter.HasFilter = false;
                        scope.retrieveData();
                    };

                    scope.applyFilter = function() {
                        scope.filter.HasFilter = true;
                        scope.retrieveData();
                    };

                    scope.close = function() {
                        $(el).find('.btn-popover').popover('hide');
                    };

                    scope.open = function() {
                        $(el).find('.btn-popover').popover('toggle');
                    };

                    scope.checkEvent = function(keyEvent) {
                        if (keyEvent.which === 13) {
                            scope.applyFilter();
                            keyEvent.preventDefault();
                        }
                    };

                    $(el).find('.btn-popover').popover({
                        html: true,
                        placement: 'bottom',
                        trigger: 'manual',
                        content: function() {
                            var selectEl = $(this).next().find('select').find('option').remove().end();
                            angular.forEach(scope.filterOperators, function(val, key) {
                                $(selectEl).append('<option value="' + key + '">' + val + '</option>');
                            });

                            return $compile($(this).next().html())(scope);
                        }
                    });

                    $(el).find('.btn-popover').on('show.bs.popover', function(e) {
                        $('.btn-popover').not(e.target).popover("hide");
                    });

                    if (angular.isDefined(openCallback)) {
                        $(el).find('.btn-popover').on('shown.bs.popover', openCallback);
                    }
                };

                /**
                 * Creates a `FilterModel` using a scope and an Attributes array
                 */
                me.createFilterModel = function(scope, lAttrs) {
                    scope.filter = new FilterModel(lAttrs);
                    scope.filter.Name = scope.$parent.column.Name;
                    var columns = scope.$component.columns.filter(function(el) {
                        return el.Name === scope.filter.Name;
                    });

                    if (columns.length === 0) return;

                    scope.$watch('filter', function(n) {
                        if (columns[0].Filter.Text != n.Text) {
                            n.Text = columns[0].Filter.Text;

                            if (columns[0].Filter.Operator != n.Operator) {
                                n.Operator = columns[0].Filter.Operator;
                            }
                        }

                        scope.filter.HasFilter = columns[0].Filter.HasFilter;
                    });

                    columns[0].Filter = scope.filter;
                    scope.dataType = columns[0].DataType;
                    scope.filterOperators = columns[0].FilterOperators[scope.dataType];

                    if (scope.dataType === 'date' || scope.dataType === 'datetime' || scope.dataType === 'datetimeutc') {
                        scope.filter.Argument = [new Date()];

                        if (scope.filter.Operator === 'Contains') {
                            scope.filter.Operator = 'Equals';
                        }
                    }

                    if (scope.dataType === 'numeric' || scope.dataType === 'boolean') {
                        scope.filter.Argument = [1];

                        if (scope.filter.Operator === 'Contains') {
                            scope.filter.Operator = 'Equals';
                        }
                    }

                    scope.filterTitle = lAttrs.title || $filter('translate')('CAPTION_FILTER');
                };
            }
        ])
        /**
         * @ngdoc service
         * @name tubularEditorService
         *
         * @description
         * The `tubularEditorService` service is a internal helper to setup any `TubularModel` with a UI.
         */
        .service('tubularEditorService', [
            '$filter', function tubularEditorService($filter) {
                var me = this;

                /*
                 * Returns the Default Scope parameters
                 */
                me.defaultScope = {
                    value: '=?',
                    isEditing: '=?',
                    editorType: '@',
                    showLabel: '=?',
                    label: '@?',
                    required: '=?',
                    format: '@?',
                    min: '=?',
                    max: '=?',
                    name: '@',
                    placeholder: '@?',
                    readOnly: '=?',
                    help: '@?',
                    defaultValue: '@?',
                    match: '@?'
                };

                /**
                 * Setups a basic Date Editor Controller
                 * @param {string} format 
                 * @returns {array}  The controller definition
                 */
                me.dateEditorController = function(format) {
                    return [
                        '$scope', function(innerScope) {
                            innerScope.DataType = "date";

                            innerScope.$watch('value', function(val) {
                                if (typeof (val) === 'string') {
                                    innerScope.value = new Date(val);
                                }
                            });

                            innerScope.validate = function() {
                                if (angular.isDefined(innerScope.min)) {
                                    if (Object.prototype.toString.call(innerScope.min) !== "[object Date]") {
                                        innerScope.min = new Date(innerScope.min);
                                    }

                                    innerScope.$valid = innerScope.value >= innerScope.min;

                                    if (!innerScope.$valid) {
                                        innerScope.state.$errors = [$filter('translate')('EDITOR_MIN_DATE', $filter('date')(innerScope.min, innerScope.format))];
                                    }
                                }

                                if (!innerScope.$valid) {
                                    return;
                                }

                                if (angular.isDefined(innerScope.max)) {
                                    if (Object.prototype.toString.call(innerScope.max) !== "[object Date]") {
                                        innerScope.max = new Date(innerScope.max);
                                    }

                                    innerScope.$valid = innerScope.value <= innerScope.max;

                                    if (!innerScope.$valid) {
                                        innerScope.state.$errors = [$filter('translate')('EDITOR_MAX_DATE', $filter('date')(innerScope.max, innerScope.format))];
                                    }
                                }
                            };

                            me.setupScope(innerScope, format);
                        }
                    ];
                };

                /**
                * Simple helper to generate a unique name for Tubular Forms
                */
                me.getUniqueTbFormName = function() {
                    // TODO: Maybe move this to another service
                    window.tbFormCounter = window.tbFormCounter || (window.tbFormCounter = -1);
                    window.tbFormCounter++;
                    return "tbForm" + window.tbFormCounter;
                };

                /**
                 * Setups a new Editor, this functions is like a common class constructor to be used
                 * with all the tubularEditors.
                 */
                me.setupScope = function (scope, defaultFormat, ctrl) {
                    if (angular.isUndefined(ctrl)) {
                        scope.isEditing = angular.isUndefined(scope.isEditing) ? true : scope.isEditing;
                        scope.showLabel = scope.showLabel || false;
                        scope.label = scope.label || (scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                        scope.required = scope.required || false;
                        scope.readOnly = scope.readOnly || false;
                        scope.format = scope.format || defaultFormat;
                        scope.$valid = true;

                        // Get the field reference using the Angular way
                        // Get the field reference using the Angular way
                        scope.getFormField = function () {
                            var parent = scope.$parent;

                            while (true) {
                                if (parent == null) break;
                                if (angular.isDefined(parent.tubularDirective) && parent.tubularDirective === 'tubular-form') {
                                    var formScope = parent.getFormScope();

                                    return formScope == null ? null : formScope[scope.Name];
                                }

                                parent = parent.$parent;
                            }
                        };

                        scope.$dirty = function () {
                            // Just forward the property
                            var formField = scope.getFormField();

                            return formField == null ? true : formField.$dirty;
                        };

                        scope.checkValid = function () {
                            scope.$valid = true;
                            scope.state.$errors = [];

                            if ((angular.isUndefined(scope.value) && scope.required) ||
                            (Object.prototype.toString.call(scope.value) === "[object Date]" && isNaN(scope.value.getTime()) && scope.required)) {
                                scope.$valid = false;

                                // Although this property is invalid, if it is not $dirty
                                // then there should not be any errors for it
                                if (scope.$dirty()) {
                                    scope.state.$errors = [$filter('translate')('EDITOR_REQUIRED')];
                                }

                                if (angular.isDefined(scope.$parent.Model)) {
                                    scope.$parent.Model.$state[scope.Name] = scope.state;
                                }

                                return;
                            }

                            // Check if we have a validation function, otherwise return
                            if (angular.isUndefined(scope.validate)) {
                                return;
                            }

                            scope.validate();
                        };

                        // HACK: I need to know why
                        scope.$watch('label', function (n, o) {
                            if (angular.isUndefined(n)) {
                                scope.label = (scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                            }
                        });

                        scope.$watch('value', function (newValue, oldValue) {
                            if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) {
                                return;
                            }

                            // This is the state API for every property in the Model
                            scope.state = {
                                $valid: function () {
                                    scope.checkValid();
                                    return this.$errors.length === 0;
                                },
                                $dirty: function () {
                                    return scope.$dirty;
                                },
                                $errors: []
                            };

                            scope.$valid = true;

                            // Try to match the model to the parent, if it exists
                            if (angular.isDefined(scope.$parent.Model)) {
                                if (angular.isDefined(scope.$parent.Model[scope.name])) {
                                    scope.$parent.Model[scope.name] = newValue;

                                    if (angular.isUndefined(scope.$parent.Model.$state)) {
                                        scope.$parent.Model.$state = [];
                                    }

                                    scope.$parent.Model.$state[scope.Name] = scope.state;
                                } else if (angular.isDefined(scope.$parent.Model.$addField)) {
                                    scope.$parent.Model.$addField(scope.name, newValue, true);
                                }
                            }

                            scope.checkValid();
                        });

                        var parent = scope.$parent;

                        // We try to find a Tubular Form in the parents
                        while (true) {
                            if (parent == null) break;
                            if (angular.isDefined(parent.tubularDirective) &&
                            (parent.tubularDirective === 'tubular-form' ||
                                parent.tubularDirective === 'tubular-rowset')) {

                                if (scope.name === null) {
                                    return;
                                }

                                if (parent.hasFieldsDefinitions !== false) {
                                    throw 'Cannot define more fields. Field definitions have been sealed';
                                }

                                scope.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

                                scope.Name = scope.name;

                                scope.bindScope = function () {
                                    scope.$parent.Model = parent.model;

                                    if (angular.equals(scope.value, parent.model[scope.Name]) === false) {
                                        if (angular.isDefined(parent.model[scope.Name])) {
                                            scope.value = (scope.DataType === 'date' && parent.model[scope.Name] != null) ?
                                                new Date(parent.model[scope.Name]) :
                                                parent.model[scope.Name];
                                        }

                                        parent.$watch(function () {
                                            return scope.value;
                                        }, function (value) {
                                            parent.model[scope.Name] = value;
                                        });
                                    }

                                    if ((!scope.value || scope.value == null) && (scope.defaultValue && scope.defaultValue != null)) {
                                        if (scope.DataType === 'date' && scope.defaultValue != null) {
                                            scope.defaultValue = new Date(scope.defaultValue);
                                        }
                                        if (scope.DataType === 'numeric' && scope.defaultValue != null) {
                                            scope.defaultValue = parseFloat(scope.defaultValue);
                                        }

                                        scope.value = scope.defaultValue;
                                    }

                                    if (angular.isUndefined(parent.model.$state)) {
                                        parent.model.$state = {};
                                    }

                                    // This is the state API for every property in the Model
                                    parent.model.$state[scope.Name] = {
                                        $valid: function () {
                                            scope.checkValid();
                                            return this.$errors.length === 0;
                                        },
                                        $dirty: function () {
                                            return scope.$dirty;
                                        },
                                        $errors: []
                                    };

                                    if (angular.equals(scope.state, parent.model.$state[scope.Name]) === false) {
                                        scope.state = parent.model.$state[scope.Name];
                                    }
                                };

                                parent.fields.push(scope);

                                break;
                            }

                            parent = parent.$parent;
                        }
                    }
                    else
                    {
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

                                // Although this property is invalid, if it is not $dirty
                                // then there should not be any errors for it
                                if (ctrl.$dirty()) {
                                    ctrl.state.$errors = [$filter('translate')('EDITOR_REQUIRED')];
                                }

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

                        // HACK: I need to know why
                        scope.$watch('label', function (n, o) {
                            if (angular.isUndefined(n)) {
                                ctrl.label = (ctrl.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                            }
                        });

                        scope.$watch('value', function (newValue, oldValue) {
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
                                    return ctrl.$dirty;
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
                                        if (angular.isDefined(parent.model[ctrl.Name])) {
                                            ctrl.value = (ctrl.DataType === 'date' && parent.model[ctrl.Name] != null) ?
                                                new Date(parent.model[scope.Name]) :
                                                parent.model[scope.Name];
                                        }

                                        parent.$watch(function () {
                                            return ctrl.value;
                                        }, function (value) {
                                            parent.model[scope.Name] = value;
                                        });
                                    }

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
                                            return ctrl.$dirty;
                                        },
                                        $errors: []
                                    };

                                    if (angular.equals(ctrl.state, parent.model.$state[scope.Name]) === false) {
                                        ctrl.state = parent.model.$state[scope.Name];
                                    }
                                };

                                parent.fields.push(ctrl);

                                break;
                            }

                            parent = parent.$parent;
                        }
                    }
                };
            }
        ]);
})();