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
    angular.module('tubular.services', ['ui.bootstrap', 'ngCookies'])
        /**
         * @ngdoc service
         * @name tubularPopupService
         *
         * @description
         * Use `tubularPopupService` to show or generate popups with a `tbForm` inside.
         */
        .service('tubularPopupService', [
            '$modal', '$rootScope', 'tubularTemplateService', function tubularPopupService($modal, $rootScope, tubularTemplateService) {
                var me = this;

                me.onSuccessForm = function(callback) {
                    $rootScope.$on('tbForm_OnSuccessfulSave', callback);
                };

                me.onConnectionError = function(callback) {
                    $rootScope.$on('tbForm_OnConnectionError', callback);
                };

                me.openDialog = function(template, model, gridScope) {
                    if (angular.isUndefined(template))
                        template = tubularTemplateService.generatePopup(model);

                    var dialog = $modal.open({
                        templateUrl: template,
                        backdropClass: 'fullHeight',
                        controller: [
                            '$scope', function($scope) {
                                $scope.Model = model;

                                $scope.savePopup = function() {
                                    var result = $scope.Model.save();

                                    if (angular.isUndefined(result) || result === false) return;

                                    result.then(
                                        function(data) {
                                            $scope.$emit('tbForm_OnSuccessfulSave', data);
                                            $rootScope.$broadcast('tbForm_OnSuccessfulSave', data);
                                            $scope.Model.$isLoading = false;
                                            if (gridScope.autoRefresh) gridScope.retrieveData();
                                            dialog.close();
                                        }, function(error) {
                                            $scope.$emit('tbForm_OnConnectionError', error);
                                            $rootScope.$broadcast('tbForm_OnConnectionError', error);
                                            $scope.Model.$isLoading = false;
                                        });
                                };

                                $scope.closePopup = function() {
                                    if (angular.isDefined($scope.Model.revertChanges))
                                        $scope.Model.revertChanges();

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
         * Use `tubularGridExportService` to export your `tbGrid` to CSV format.
         */
        .service('tubularGridExportService', function tubularGridExportService() {
            var me = this;

            me.getColumns = function(gridScope) {
                return gridScope.columns
                    .filter(function(c) { return c.Visible; })
                    .map(function(c) { return c.Name.replace(/([a-z])([A-Z])/g, '$1 $2'); });
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
                        if (visibility[j] === false) continue;
                        var innerValue = row[j] == null ? '' : row[j].toString();
                        if (row[j] instanceof Date) {
                            innerValue = row[j].toLocaleString();
                        }
                        var result = innerValue.replace(/"/g, '""');
                        if (result.search(/("|,|\n)/g) >= 0)
                            result = '"' + result + '"';
                        if (j > 0)
                            finalVal += ',';
                        finalVal += result;
                    }
                    return finalVal + '\n';
                };

                var csvFile = '';

                if (header.length > 0)
                    csvFile += processRow(header);

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
            'tubulargGridFilterModel', '$compile', '$modal', function tubularGridFilterService(FilterModel, $compile, $modal) {
                var me = this;

                me.applyFilterFuncs = function(scope, el, attributes, openCallback) {
                    scope.columnSelector = attributes.columnSelector || false;
                    scope.$component = scope.$parent.$component;
                    scope.filterTitle = "Filter";

                    scope.clearFilter = function () {
                        if (scope.filter.Operator != 'Multiple')
                            scope.filter.Operator = 'None';

                        scope.filter.Text = '';
                        scope.filter.Argument = [];

                        scope.$component.retrieveData();
                        scope.close();
                    };

                    scope.applyFilter = function() {
                        scope.$component.retrieveData();
                        scope.close();
                    };

                    scope.close = function() {
                        $(el).find('[data-toggle="popover"]').popover('hide');
                    };

                    scope.openColumnsSelector = function() {
                        scope.close();

                        var model = scope.$component.columns;

                        var dialog = $modal.open({
                            template: '<div class="modal-header">' +
                                '<h3 class="modal-title">Columns Selector</h3>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                '<table class="table table-bordered table-responsive table-striped table-hover table-condensed">' +
                                '<thead><tr><th>Visible?</th><th>Name</th><th>Is grouping?</th></tr></thead>' +
                                '<tbody><tr ng-repeat="col in Model">' +
                                '<td><input type="checkbox" ng-model="col.Visible" /></td>' +
                                '<td>{{col.Label}}</td>' +
                                '<td><input type="checkbox" ng-disabled="true" ng-model="col.IsGrouping" /></td>' +
                                '</tr></tbody></table></div>' +
                                '</div>' +
                                '<div class="modal-footer"><button class="btn btn-warning" ng-click="closePopup()">Close</button></div>',
                            backdropClass: 'fullHeight',
                            controller: [
                                '$scope', function($innerScope) {
                                    $innerScope.Model = model;

                                    $innerScope.closePopup = function() {
                                        dialog.close();
                                    };
                                }
                            ]
                        });
                    };

                    $(el).find('[data-toggle="popover"]').popover({
                        html: true,
                        content: function() {
                            var selectEl = $(this).next().find('select').find('option').remove().end();
                            angular.forEach(scope.filterOperators, function(val, key) {
                                $(selectEl).append('<option value="' + key + '">' + val + '</option>');
                            });

                            return $compile($(this).next().html())(scope);
                        },
                    });
                    
                    $(el).find('[data-toggle="popover"]').on('show.bs.popover', function (e) {
                        $("[rel=popover]").not(e.target).popover("destroy");
                        $(".popover").remove();
                    });

                    $(el).find('[data-toggle="popover"]').on('shown.bs.popover', openCallback);
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

                    columns[0].Filter = scope.filter;
                    scope.dataType = columns[0].DataType;
                    scope.filterOperators = columns[0].FilterOperators[scope.dataType];

                    if (scope.dataType === 'datetime' || scope.dataType === 'date') {
                        scope.filter.Argument = [new Date()];
                        scope.filter.Operator = 'Equals';
                    }

                    if (scope.dataType === 'numeric' || scope.dataType === 'boolean') {
                        scope.filter.Argument = [1];
                        scope.filter.Operator = 'Equals';
                    }

                    scope.filterTitle = lAttrs.title || "Filter";
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
            function tubularEditorService() {
                var me = this;

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
                    help: '@?'
                };

                /**
                 * Setups a new Editor, this functions is like a common class constructor to be used
                 * with all the tubularEditors.
                 */
                me.setupScope = function(scope, defaultFormat) {
                    scope.isEditing = angular.isUndefined(scope.isEditing) ? true : scope.isEditing;
                    scope.showLabel = scope.showLabel || false;
                    scope.label = scope.label || (scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                    scope.required = scope.required || false;
                    scope.readOnly = scope.readOnly || false;
                    scope.format = scope.format || defaultFormat;
                    scope.$valid = true;

                    scope.$watch('value', function(newValue, oldValue) {
                        if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) return;
                        
                        if (angular.isUndefined(scope.state)) {
                            scope.state = {
                                $valid: function() {
                                    return this.$errors.length === 0;
                                },
                                $errors: []
                            };
                        }

                        scope.$valid = true;
                        scope.state.$errors = [];
                        
                        // Try to match the model to the parent, if it exists
                        if (angular.isDefined(scope.$parent.Model)) {
                            if (angular.isDefined(scope.$parent.Model[scope.name])) {
                                scope.$parent.Model[scope.name] = newValue;

                                if (angular.isUndefined(scope.$parent.Model.$state)) {
                                    scope.$parent.Model.$state = [];
                                }

                                scope.$parent.Model.$state[scope.Name] = scope.state;
                            } else if (angular.isDefined(scope.$parent.Model.$addField)) {
                                scope.$parent.Model.$addField(scope.name, newValue);
                            }
                        }

                        if (angular.isUndefined(scope.value) && scope.required) {
                            scope.$valid = false;
                            scope.state.$errors = ["Field is required"];

                            if (angular.isDefined(scope.$parent.Model))
                                scope.$parent.Model.$state[scope.Name] = scope.state;

                            return;
                        }

                        // Check if we have a validation function, otherwise return
                        if (angular.isUndefined(scope.validate)) return;

                        scope.validate();
                    });

                    var parent = scope.$parent;

                    // We try to find a Tubular Form in the parents
                    while (true) {
                        if (parent == null) break;
                        if (angular.isUndefined(parent.tubularDirective) == false &&
                            (parent.tubularDirective === 'tubular-form' ||
                            parent.tubularDirective === 'tubular-rowset')) {
                            if (scope.name === null) return;

                            if (parent.hasFieldsDefinitions !== false)
                                throw 'Cannot define more fields. Field definitions have been sealed';

                            scope.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

                            scope.Name = scope.name;
                            scope.bindScope = function() {
                                scope.$parent.Model = parent.model;

                                if (angular.equals(scope.value, parent.model[scope.Name]) == false) {
                                    scope.value = (scope.DataType == 'date') ? new Date(parent.model[scope.Name]) : parent.model[scope.Name];

                                    parent.$watch(function() {
                                        return scope.value;
                                    }, function(value) {
                                        parent.model[scope.Name] = value;
                                    });
                                }

                                // Ignores models without state
                                if (angular.isUndefined(parent.model.$state)) return;

                                if (angular.equals(scope.state, parent.model.$state[scope.Name]) == false) {
                                    scope.state = parent.model.$state[scope.Name];
                                }
                            };

                            parent.fields.push(scope);

                            break;
                        }

                        parent = parent.$parent;
                    }
                };
            }
        ]);
})();