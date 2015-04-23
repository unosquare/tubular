(function() {
    'use strict';

    angular.module('tubular.services', ['ui.bootstrap'])
        .service('tubularPopupService', [
            '$modal', '$rootScope', function tubularPopupService($modal, $rootScope) {
                var me = this;

                me.onSuccessForm = function(callback) {
                    $rootScope.$on('tbForm_OnSuccessfulSave', callback);
                };

                me.onConnectionError = function(callback) {
                    $rootScope.$on('tbForm_OnConnectionError', callback);
                };

                me.openDialog = function(template, model) {
                    var dialog = $modal.open({
                        templateUrl: template,
                        backdropClass: 'fullHeight',
                        controller: [
                            '$scope', function($scope) {
                                $scope.Model = model;

                                $scope.savePopup = function() {
                                    var result = $scope.Model.save();

                                    if (result === false) return;

                                    result.then(
                                        function(data) {
                                            $scope.$emit('tbForm_OnSuccessfulSave', data);
                                            $rootScope.$broadcast('tbForm_OnSuccessfulSave', data);
                                            $scope.Model.$isLoading = false;
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
                    var finalVal = '';
                    for (var j = 0; j < row.length; j++) {
                        if (visibility[j] === false) continue;
                        var innerValue = row[j] === null ? '' : row[j].toString();
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

                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, filename);
            };
        })
        .service('tubularGridFilterService', [
            'tubulargGridFilterModel', '$compile', '$modal', function tubularGridFilterService(FilterModel, $compile, $modal) {
                var me = this;

                me.applyFilterFuncs = function(scope, el, attributes, openCallback) {
                    scope.columnSelector = attributes.columnSelector || false;
                    scope.$component = scope.$parent.$component;
                    scope.filterTitle = "Filter";

                    scope.clearFilter = function() {
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

                    $(el).find('[data-toggle="popover"]').on('shown.bs.popover', openCallback);
                };

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

                    if (scope.dataType === 'numeric') {
                        scope.filter.Argument = [1];
                        scope.filter.Operator = 'Equals';
                    }

                    scope.filterTitle = lAttrs.title || "Filter";
                };
            }
        ])
        .service('tubularEditorService', [
            function tubularEditorService() {
                var me = this;

                me.defaultScope = {
                    value: '=?',
                    state: '=?',
                    isEditing: '=?',
                    editorType: '@',
                    showLabel: '=?',
                    label: '@?',
                    required: '=?',
                    format: '@?',
                    min: '=?',
                    max: '=?',
                    name: '@',
                    defaultValue: '=?',
                    IsKey: '@',
                    placeholder: '@?',
                    readOnly: '=?',
                    help: '@?'
                };

                me.setupScope = function(scope, defaultFormat) {
                    scope.isEditing = angular.isUndefined(scope.isEditing) ? true : scope.isEditing;
                    scope.showLabel = scope.showLabel || false;
                    scope.label = scope.label || (scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                    scope.required = scope.required || false;
                    scope.readOnly = scope.readOnly || false;
                    scope.format = scope.format || defaultFormat;
                    scope.$valid = true;
                    scope.$editorType = 'input';

                    if (angular.isUndefined(scope.defaultValue) == false && angular.isUndefined(scope.value)) {
                        scope.value = scope.defaultValue;
                    }

                    scope.$watch('value', function(newValue, oldValue) {
                        if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) return;

                        if (angular.isUndefined(scope.state)) {
                            scope.state = {
                                $valid: function() {
                                    return this.$errors == 0;
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
                            } else if (angular.isDefined(scope.$parent.Model.$addField)) {
                                scope.$parent.Model.$addField(scope.name, newValue);
                            }
                        }

                        if (angular.isUndefined(scope.value) && scope.required) {
                            scope.$valid = false;
                            scope.state.$errors = ["Field is required"];
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
                            parent.tubularDirective === 'tubular-form') {
                            parent.addField(scope);
                            break;
                        }

                        parent = parent.$parent;
                    }
                };
            }
        ]).service('tubularTemplateService', ['$templateCache',
            function tubularTemplateService($templateCache) {
                var me = this;

                me.generatePopup = function (model) {
                    var templateName = 'temp' + (new Date().getTime()) + '.html';
                    var columns = me.createColumns(model);
                    console.log(columns);

                    var template = '<tb-form model="Model">' +
                        '<div class="modal-header"><h3 class="modal-title">Edit Row</h3></div>' +
                        '<div class="modal-body">' +
                        me.generateFields(columns) +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
                        '<button class="btn btn-danger" ng-click="closePopup()">Cancel</button>' +
                        '</div>' +
                        '</tb-form>';

                    $templateCache.put(templateName, template);

                    return templateName;
                };

                me.generateFields = function(columns) {
                    return columns.map(function(el) {
                        var editorTag = el.EditorType.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });

                        return '\r\n\t<' + editorTag + ' name="' + el.Name + '" label="' + el.Label + '" editor-type="' + el.DataType + '" ' +
                            '\r\n\t\tshow-label="' + el.ShowLabel + '" placeholder="' + el.Placeholder + '" required="' + el.Required + '" ' +
                            '\r\n\t\tread-only="' + el.ReadOnly + '" format="' + el.Format + '" help="' + el.Help + '">' +
                            '\r\n\t</' + editorTag + '>';
                    }).join('');
                };

                me.getEditorTypeByDateType = function (dataType) {
                    switch (dataType) {
                        case 'date':
                            return 'tbDateTimeEditor';
                        case 'numeric':
                            return 'tbNumericEditor';
                        case 'boolean':
                            return 'tbCheckboxField';
                        default:
                            return 'tbSimpleEditor';
                    }
                };

                me.createColumns = function (model) {
                    var jsonModel = (angular.isArray(model) && model.length > 0) ? model[0] : model;
                    var columns = [];

                    for (var prop in jsonModel) {
                        if (jsonModel.hasOwnProperty(prop)) {
                            var value = jsonModel[prop];
                            // Ignore functions
                            if (prop[0] === '$' || typeof (value) === 'function') continue;
                            // Ignore null value, but maybe evaluate another item if there is anymore
                            if (value == null) continue;

                            if (angular.isNumber(value) || parseFloat(value).toString() == value) {
                                columns.push({ Name: prop, DataType: 'numeric', Template: '{{row.' + prop + '}}' });
                            } else if (angular.isDate(value) || isNaN((new Date(value)).getTime()) == false) {
                                columns.push({ Name: prop, DataType: 'date', Template: '{{row.' + prop + ' | date}}' });
                            } else if (value.toLowerCase() == 'true' || value.toLowerCase() == 'false') {
                                columns.push({ Name: prop, DataType: 'boolean', Template: '{{row.' + prop + ' ? "TRUE" : "FALSE" }}' });
                            } else {
                                var newColumn = { Name: prop, DataType: 'string', Template: '{{row.' + prop + '}}' };

                                if ((/e(-|)mail/ig).test(newColumn.Name)) {
                                    newColumn.Template = '<a href="mailto:' + newColumn.Template + '">' + newColumn.Template + '</a>';
                                }

                                columns.push(newColumn);
                            }
                        }
                    }

                    var firstSort = false;

                    for (var column in columns) {
                        if (columns.hasOwnProperty(column)) {
                            var columnObj = columns[column];
                            columnObj.Label = columnObj.Name.replace(/([a-z])([A-Z])/g, '$1 $2');
                            columnObj.EditorType = me.getEditorTypeByDateType(columnObj.DataType);

                            // Grid attributes
                            columnObj.Searchable = columnObj.DataType === 'string';
                            columnObj.Filter = true;
                            columnObj.Visible = true;
                            columnObj.Sortable = true;
                            columnObj.IsKey = false;
                            columnObj.SortOrder = -1;
                            // Form attributes
                            columnObj.ShowLabel = true;
                            columnObj.Placeholder = '';
                            columnObj.Format = '';
                            columnObj.Help = '';
                            columnObj.Required = true;
                            columnObj.ReadOnly = false;

                            if (firstSort === false) {
                                columnObj.IsKey = true;
                                columnObj.SortOrder = 1;
                                firstSort = true;
                            }
                        }
                    }

                    return columns;
                };
            }
        ]);
})();