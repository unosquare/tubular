(function() {
    'use strict';

    angular.module('tubular.services').service('tubularTemplateService', [
        '$templateCache',
        function tubularTemplateService($templateCache) {
            var me = this;

            me.generatePopup = function(model, title) {
                var templateName = 'temp' + (new Date().getTime()) + '.html';
                var columns = me.createColumns(model);
                
                var template = '<tb-form model="Model">' +
                    '<div class="modal-header"><h3 class="modal-title">' + (title || 'Edit Row') + '</h3></div>' +
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
                    var editorTag = el.EditorType.replace(/([A-Z])/g, function($1) { return "-" + $1.toLowerCase(); });

                    return '\r\n\t<' + editorTag + ' name="' + el.Name + '" label="' + el.Label + '" editor-type="' + el.DataType + '" ' +
                        '\r\n\t\tshow-label="' + el.ShowLabel + '" placeholder="' + el.Placeholder + '" required="' + el.Required + '" ' +
                        '\r\n\t\tread-only="' + el.ReadOnly + '" format="' + el.Format + '" help="' + el.Help + '">' +
                        '\r\n\t</' + editorTag + '>';
                }).join('');
            };

            me.getEditorTypeByDateType = function(dataType) {
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

            me.createColumns = function(model) {
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