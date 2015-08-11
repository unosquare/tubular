/*jslint node: true */
'use strict';

var tubularTemplateServiceModule = {
    enums: {
        dataTypes: ['numeric', 'date', 'boolean', 'string'],
        editorTypes: [
            'tbSimpleEditor', 'tbNumericEditor', 'tbDateTimeEditor', 'tbDateEditor',
            'tbDropdownEditor', 'tbTypeaheadEditor', 'tbHiddenField', 'tbCheckboxField', 'tbTextArea'
        ],
        httpMethods: ['POST', 'PUT', 'GET', 'DELETE'],
        gridModes: ['Read-Only', 'Inline', 'Popup', 'Page'],
        formLayouts: ['Simple', 'Two-columns', 'Three-columns'],
        sortDirections: ['Ascending', 'Descending']
    },

    defaults: {
        gridOptions: {
            Pager: true,
            FreeTextSearch: true,
            PageSizeSelector: true,
            PagerInfo: true,
            ExportCsv: true,
            Mode: 'Read-Only',
            RequireAuthentication: false,
            ServiceName: '',
            RequestMethod: 'GET',
            GridName: 'grid'
        },
        formOptions: {
            CancelButton: true,
            SaveUrl: '',
            SaveMethod: 'POST',
            Layout: 'Simple',
            ModelKey: '',
            RequireAuthentication: false,
            ServiceName: ''
        },
        fieldsSettings: {
            'tbSimpleEditor': {
                ShowLabel: true,
                Placeholder: true,
                Format: false,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: true
            },
            'tbNumericEditor': {
                ShowLabel: true,
                Placeholder: true,
                Format: true,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: false
            },
            'tbDateTimeEditor': {
                ShowLabel: true,
                Placeholder: false,
                Format: true,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: false
            },
            'tbDateEditor': {
                ShowLabel: true,
                Placeholder: false,
                Format: true,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: false
            },
            'tbDropdownEditor': {
                ShowLabel: true,
                Placeholder: false,
                Format: false,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: false
            },
            'tbTypeaheadEditor': {
                ShowLabel: true,
                Placeholder: true,
                Format: false,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: false
            },
            'tbHiddenField': {
                ShowLabel: false,
                Placeholder: false,
                Format: false,
                Help: false,
                Required: false,
                ReadOnly: false,
                EditorType: false
            },
            'tbCheckboxField': {
                ShowLabel: false,
                Placeholder: false,
                Format: false,
                Help: true,
                Required: false,
                ReadOnly: true,
                EditorType: false
            },
            'tbTextArea': {
                ShowLabel: true,
                Placeholder: true,
                Help: true,
                Required: true,
                ReadOnly: true,
                EditorType: false
            }
        }
    },

    createColumns: function(model) {
        var jsonModel = (model instanceof Array && model.length > 0) ? model[0] : model;
        var columns = [];

        for (var prop in jsonModel) {
            if (jsonModel.hasOwnProperty(prop)) {
                var value = jsonModel[prop];
                // Ignore functions
                if (prop[0] === '$' || typeof (value) === 'function') {
                    continue;
                }

                // Ignore null value, but maybe evaluate another item if there is anymore
                if (value == null) {
                    continue;
                }

                if (typeof value === 'number' || parseFloat(value).toString() == value) {
                    columns.push({ Name: prop, DataType: 'numeric', Template: '{{row.' + prop + '}}' });
                } else if (toString.call(value) === '[object Date]' || isNaN((new Date(value)).getTime()) === false) {
                    columns.push({ Name: prop, DataType: 'date', Template: '{{row.' + prop + ' | date}}' });
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
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
                columnObj.EditorType = this.getEditorTypeByDateType(columnObj.DataType);

                // Grid attributes
                columnObj.Searchable = columnObj.DataType === 'string';
                columnObj.Filter = true;
                columnObj.Visible = true;
                columnObj.Sortable = true;
                columnObj.IsKey = false;
                columnObj.SortOrder = 0;
                columnObj.SortDirection = '';
                // Form attributes
                columnObj.ShowLabel = true;
                columnObj.Placeholder = '';
                columnObj.Format = '';
                columnObj.Help = '';
                columnObj.Required = true;
                columnObj.ReadOnly = false;

                if (!firstSort) {
                    columnObj.IsKey = true;
                    columnObj.SortOrder = 1;
                    columnObj.SortDirection = 'Ascending';
                    firstSort = true;
                }
            }
        }

        return columns;
    },

    generateFieldsArray: function(columns) {
        return columns.map(function(el) {
            var editorTag = el.EditorType.replace(/([A-Z])/g, function($1) { return "-" + $1.toLowerCase(); });
            var defaults = tubularTemplateServiceModule.defaults.fieldsSettings[el.EditorType];
            
            return '\r\n\t<' + editorTag + ' name="' + el.Name + '"' +
                (defaults.EditorType ? '\r\n\t\teditor-type="' + el.DataType + '" ' : '') +
                (defaults.ShowLabel ? '\r\n\t\tlabel="' + el.Label + '" show-label="' + el.ShowLabel + '"' : '') +
                (defaults.Placeholder ? '\r\n\t\tplaceholder="' + el.Placeholder + '"' : '') +
                (defaults.Required ? '\r\n\t\trequired="' + el.Required + '"' : '') +
                (defaults.ReadOnly ? '\r\n\t\tread-only="' + el.ReadOnly + '"' : '') +
                (defaults.Format ? '\r\n\t\tformat="' + el.Format + '"' : '') +
                (defaults.Help ? '\r\n\t\thelp="' + el.Help + '"' : '') +
                '>\r\n\t</' + editorTag + '>';
        });
    },

    generateFields: function(columns) {
        return this.generateFieldsArray(columns).join('');
    },

    generatePopup: function(model, title) {
        var columns = this.createColumns(model);

        return '<tb-form model="Model">' +
            '<div class="modal-header"><h3 class="modal-title">' + (title || 'Edit Row') + '</h3></div>' +
            '<div class="modal-body">' +
            this.generateFields(columns) +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
            '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' +
            '</div>' +
            '</tb-form>';
    },

    getEditorTypeByDateType: function(dataType) {
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
    },

    generateForm: function(fields, options) {
        var layout = options.Layout === 'Simple' ? '' : options.Layout.toLowerCase();
        var fieldsArray = this.generateFieldsArray(fields);
        var fieldsMarkup = '';

        if (layout == '') {
            fieldsMarkup = fieldsArray.join('');
        } else {
            fieldsMarkup = "\r\n\t<div class='row'>" +
                (layout == 'two-columns' ?
                    "\r\n\t<div class='col-md-6'>" +
                    fieldsArray.filter(function(i, e) { return (e % 2) == 0; }).join('') +
                    "\r\n\t</div>\r\n\t<div class='col-md-6'>" +
                    fieldsArray.filter(function(i, e) { return (e % 2) == 1; }).join('') +
                    "</div>" :
                    "\r\n\t<div class='col-md-4'>" +
                    fieldsArray.filter(function(i, e) { return (e % 3) == 0; }).join('') +
                    "\r\n\t</div>\r\n\t<div class='col-md-4'>" +
                    fieldsArray.filter(function(i, e) { return (e % 3) == 1; }).join('') +
                    "\r\n\t</div>\r\n\t<div class='col-md-4'>" +
                    fieldsArray.filter(function(i, e) { return (e % 3) == 2; }).join('') +
                    "\r\n\t</div>") +
                "\r\n\t</div>";
        }

        return '<tb-form server-save-method="' + options.SaveMethod + '" ' +
            'model-key="' + options.ModelKey + '" require-authentication="' + options.RequireAuthentication + '" ' +
            'server-url="' + options.dataUrl + '" server-save-url="' + options.SaveUrl + '" ' +
            (options.ServiceName != '' ? ' service-name="' + options.ServiceName + '"' : '') + '>' +
            '\r\n\t<h1>Autogenerated Form</h1>' +
            fieldsMarkup +
            '\r\n\t<div>' +
            '\r\n\t\t<button class="btn btn-primary" ng-click="$parent.save()" ng-disabled="!$parent.model.$valid()">Save</button>' +
            (options.CancelButton ? '\r\n\t\t<button class="btn btn-danger" ng-click="$parent.cancel()" formnovalidate>Cancel</button>' : '') +
            '\r\n\t</div>' +
            '\r\n</tb-form>';
    },

    generateCells: function(columns, mode) {
        return columns.map(function(el) {
            var editorTag = el.EditorType.replace(/([A-Z])/g, function($1) { return "-" + $1.toLowerCase(); });

            return '\r\n\t\t<tb-cell-template column-name="' + el.Name + '">' +
                '\r\n\t\t\t' +
                (mode == 'Inline' ?
                    '<' + editorTag + ' is-editing="row.$isEditing" value="row.' + el.Name + '">' +
                    '</' + editorTag + '>' :
                     el.Template) +
                '\r\n\t\t</tb-cell-template>';
        }).join('');
    },

    generateGrid: function(columns, options) {
        var topToolbar = '';
        var bottomToolbar = '';

        if (options.Pager) {
            topToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
            bottomToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
        }

        if (options.ExportCsv) {
            topToolbar += '\r\n\t<div class="col-md-3">' +
                '\r\n\t\t<div class="btn-group">' +
                '\r\n\t\t<tb-print-button title="Tubular" class="btn-sm"></tb-print-button>' +
                '\r\n\t\t<tb-export-button filename="tubular.csv" css="btn-sm"></tb-export-button>' +
                '\r\n\t\t</div>' +
                '\r\n\t</div>';
        }

        if (options.FreeTextSearch) {
            topToolbar += '\r\n\t<tb-text-search class="col-md-3" css="input-sm"></tb-text-search>';
        }

        if (options.PageSizeSelector) {
            bottomToolbar += '\r\n\t<tb-page-size-selector class="col-md-3" selectorcss="input-sm"></tb-page-size-selector>';
        }

        if (options.PagerInfo) {
            bottomToolbar += '\r\n\t<tb-grid-pager-info class="col-md-3"></tb-grid-pager-info>';
        }

        // TODO: If it's page mode add button
        // TODO: Add Selectable param, default false
        // TODO: Add Name param
        return '<h1>Autogenerated Grid</h1>' +
            '\r\n<div class="container">' +
            '\r\n<tb-grid server-url="' + options.dataUrl + '" request-method="' + options.RequestMethod + '" class="row" ' +
            'page-size="10" require-authentication="' + options.RequireAuthentication + '" ' +
            (options.ServiceName != '' ? ' service-name="' + options.ServiceName + '"' : '') +
            (options.Mode != 'Read-Only' ? ' editor-mode="' + options.Mode.toLowerCase() + '"' : '') + '>' +
            (topToolbar === '' ? '' : '\r\n\t<div class="row">' + topToolbar + '\r\n\t</div>') +
            '\r\n\t<div class="row">' +
            '\r\n\t<div class="col-md-12">' +
            '\r\n\t<div class="panel panel-default panel-rounded">' +
            '\r\n\t<tb-grid-table class="table-bordered">' +
            '\r\n\t<tb-column-definitions>' +
            (options.Mode != 'Read-Only' ? '\r\n\t\t<tb-column label="Actions"><tb-column-header>{{label}}</tb-column-header></tb-column>' : '') +
            columns.map(function(el) {
                return '\r\n\t\t<tb-column name="' + el.Name + '" label="' + el.Label + '" column-type="' + el.DataType + '" sortable="' + el.Sortable + '" ' +
                    '\r\n\t\t\tis-key="' + el.IsKey + '" searchable="' + el.Searchable + '" ' +
                    (el.Sortable ? '\r\n\t\t\tsort-direction="' + el.SortDirection + '" sort-order="' + el.SortOrder + '" ' : ' ') +
                    'visible="' + el.Visible + '">' +
                    (el.Filter ? '\r\n\t\t\t<tb-column-filter></tb-column-filter>' : '') +
                    '\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>' +
                    '\r\n\t\t</tb-column>';
            }).join('') +
            '\r\n\t</tb-column-definitions>' +
            '\r\n\t<tb-row-set>' +
            '\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">' +
            (options.Mode != 'Read-Only' ? '\r\n\t\t<tb-cell-template>' +
                (options.Mode == 'Inline' ? '\r\n\t\t\t<tb-save-button model="row"></tb-save-button>' : '') +
                '\r\n\t\t\t<tb-edit-button model="row"></tb-edit-button>' +
                '\r\n\t\t</tb-cell-template>' : '') +
            this.generateCells(columns, options.Mode) +
            '\r\n\t</tb-row-template>' +
            '\r\n\t</tb-row-set>' +
            '\r\n\t</tb-grid-table>' +
            '\r\n\t</div>' +
            '\r\n\t</div>' +
            '\r\n\t</div>' +
            (bottomToolbar === '' ? '' : '\r\n\t<div class="row">' + bottomToolbar + '\r\n\t</div>') +
            '\r\n</tb-grid>' +
            '\r\n</div>';
    }
};

try {
    module.exports = tubularTemplateServiceModule;
} catch (e) {
    // Ignore
}