(angular => {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularTemplateService
         *
         * @description
         * Use `tubularTemplateService` to generate `tbGrid` and `tbForm` templates.
         */
        .service('tubularTemplateService',
        [
            '$templateCache',
            'translateFilter',
            function (
                $templateCache,
                translateFilter) {
                const me = this;

                me.canUseHtml5Date = () => {
                    const el = angular.element('<input type="date" value=":)" />');
                    return el.attr('type') === 'date' && el.val() === '';
                };

                me.enums = {
                    dataTypes: ['numeric', 'date', 'boolean', 'string'],
                    editorTypes: [
                        'tbSimpleEditor', 'tbNumericEditor', 'tbDateTimeEditor', 'tbDateEditor',
                        'tbDropdownEditor', 'tbTypeaheadEditor', 'tbCheckboxField', 'tbTextArea'
                    ],
                    httpMethods: ['POST', 'PUT', 'GET', 'DELETE'],
                    gridModes: ['Read-Only', 'Inline', 'Popup', 'Page'],
                    formLayouts: ['Simple', 'Two-columns', 'Three-columns'],
                    sortDirections: ['Ascending', 'Descending']
                };

                me.defaults = {
                    gridOptions: {
                        Pager: true,
                        FreeTextSearch: true,
                        PageSizeSelector: true,
                        PagerInfo: true,
                        ExportCsv: true,
                        Mode: 'Read-Only',
                        RequireAuthentication: false,
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
                        dataUrl: ''
                    },
                    fieldsSettings: {
                        tbSimpleEditor: {
                            ShowLabel: true,
                            Placeholder: true,
                            Format: false,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: true
                        },
                        tbNumericEditor: {
                            ShowLabel: true,
                            Placeholder: true,
                            Format: true,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: false
                        },
                        tbDateTimeEditor: {
                            ShowLabel: true,
                            Placeholder: false,
                            Format: true,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: false
                        },
                        tbDateEditor: {
                            ShowLabel: true,
                            Placeholder: false,
                            Format: true,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: false
                        },
                        tbDropdownEditor: {
                            ShowLabel: true,
                            Placeholder: false,
                            Format: false,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: false
                        },
                        tbTypeaheadEditor: {
                            ShowLabel: true,
                            Placeholder: true,
                            Format: false,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: false
                        },
                        tbCheckboxField: {
                            ShowLabel: false,
                            Placeholder: false,
                            Format: false,
                            Help: true,
                            Required: false,
                            ReadOnly: true,
                            EditorType: false
                        },
                        tbTextArea: {
                            ShowLabel: true,
                            Placeholder: true,
                            Help: true,
                            Required: true,
                            ReadOnly: true,
                            EditorType: false
                        }
                    }
                };

                // Loading popovers templates
                me.tbColumnDateTimeFilterPopoverTemplateName = me.canUseHtml5Date() ? 'tbColumnDateTimeFilterPopoverHtml5.tpl.html' : 'tbColumnDateTimeFilterPopoverBs.tpl.html';

                /**
                 * Generates the grid's cells markup
                 * @param {array} columns
                 * @param {string} mode
                 * @returns {string}
                 */
                me.generateCells = (columns, mode) => columns.reduce((prev, el) => {
                        const editorTag = mode === 'Inline' ? el.EditorType
                            .replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`) : '';
                        const templateExpression = el.Template || `<span ng-bind="row.${el.Name}"></span>`;

                        return `${prev}\r\n\t\t<td tb-cell ng-transclude column-name="${el.Name}">
                            \t\t\t${mode === 'Inline' ? `<${editorTag} is-editing="row.$isEditing" value="row.${el.Name}"></${editorTag}>` : templateExpression}
                            \t\t</td>`;
                    }, '');

                me.generateColumnsDefinitions = (columns) => columns.reduce((prev, el) => 
                        `${prev}
                        \t\t<tb-column name="${el.Name}" label="${el.Label}" column-type="${el.DataType}" sortable="${el.Sortable}" 
                        \t\t\tis-key="${el.IsKey}" searchable="${el.Searchable}" ${el.Sortable ? `\r\n\t\t\tsort-direction="${el.SortDirection}" sort-order="${el.SortOrder}" ` : ' '}
                                visible="${el.Visible}">${el.Filter ? '\r\n\t\t\t<tb-column-filter></tb-column-filter>' : ''}
                        \t\t\t<tb-column-header><span>{{label}}</span></tb-column-header>
                        \t\t</tb-column>`, '');

                /**
                 * Generates a grid markup using a columns model and grids options
                 * @param {array} columns
                 * @param {object} options
                 * @returns {string}
                 */
                me.generateGrid = function (columns, options) {
                    let topToolbar = '';
                    let bottomToolbar = '';

                    if (options.Pager) {
                        topToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                        bottomToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                    }

                    if (options.ExportCsv) {
                        topToolbar += '\r\n\t<div class="col-md-3">' +
                            '\r\n\t\t<div class="btn-group">' +
                            '\r\n\t\t<tb-print-button title="Tubular"></tb-print-button>' +
                            '\r\n\t\t<tb-export-button filename="tubular.csv" css="btn-sm"></tb-export-button>' +
                            '\r\n\t\t</div>' +
                            '\r\n\t</div>';
                    }

                    if (options.FreeTextSearch) {
                        topToolbar += '\r\n\t<tb-text-search class="col-md-3" css="input-sm"></tb-text-search>';
                    }

                    if (options.PageSizeSelector) {
                        bottomToolbar +=
                            '\r\n\t<tb-page-size-selector class="col-md-3" selectorcss="input-sm"></tb-page-size-selector>';
                    }

                    if (options.PagerInfo) {
                        bottomToolbar += '\r\n\t<tb-grid-pager-info class="col-md-3"></tb-grid-pager-info>';
                    }

                    const columnDefinitions = me.generateColumnsDefinitions(columns);
                    const rowsDefinitions = me.generateCells(columns, options.Mode);

                    return `${'<div class="container">' +
                        '\r\n<tb-grid server-url="'}${options.dataUrl}" request-method="${options.RequestMethod}" class="row" ` +
                        `page-size="10" require-authentication="${options.RequireAuthentication }" ${options.Mode !== 'Read-Only' ? ` editor-mode="${  options.Mode.toLowerCase()  }"` : ''}>${topToolbar === '' ? '' : `\r\n\t<div class="row">${  topToolbar  }\r\n\t</div>`}\r\n\t<div class="row">` +
                        '\r\n\t<div class="col-md-12">' +
                        '\r\n\t<div class="panel panel-default panel-rounded">' +
                        `\r\n\t<tb-grid-table class="table-bordered">
                        \t<tb-column-definitions>
                        ${columnDefinitions}
                        </tb-column-definitions>` +
                        '\r\n\t<tb-row-set>' +
                        `\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">${
                        options.Mode !== 'Read-Only'
                            ? `\r\n\t\t<tb-cell-template>${options.Mode === 'Inline' ? '\r\n\t\t\t<tb-save-button model="row"></tb-save-button>' : ''}\r\n\t\t\t<tb-edit-button model="row"></tb-edit-button>` +
                            '\r\n\t\t</tb-cell-template>'
                            : ''
                        }${rowsDefinitions}\r\n\t</tb-row-template>` +
                        `\r\n\t</tb-row-set>
                        \t</tb-grid-table>
                        \t</div>
                        \t</div>
                        \t</div>${bottomToolbar === '' ? '' : `\r\n\t<div class="row">${  bottomToolbar  }\r\n\t</div>`}\r\n</tb-grid>
                        </div>`;
                };

                me.getEditorTypeByDateType = dataType => {
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

                /*
                 * Create a columns array using a model.
                 *
                 * @param {object} model
                 * @returns {array} The columns
                 */
                me.createColumns = function (model) {
                    const jsonModel = (angular.isArray(model) && model.length > 0) ? model[0] : model;
                    const columns = [];

                    angular.forEach(Object.keys(jsonModel), prop => {
                        const value = jsonModel[prop];

                        // Ignore functions and  null value, but maybe evaluate another item if there is anymore
                        if (prop[0] === '$' || angular.isFunction(value) || value == null) {
                            return;
                        }

                        if (angular.isNumber(value) || parseFloat(value).toString() === value) {
                            columns.push({
                                Name: prop,
                                DataType: 'numeric',
                                Template: `{{row.${prop} | number}}`
                            });
                        } else if (angular.isDate(value) || !isNaN((new Date(value)).getTime())) {
                            columns.push({ Name: prop, DataType: 'date', Template: `{{row.${prop} | moment }}` });
                        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                            columns.push({
                                Name: prop,
                                DataType: 'boolean',
                                Template: `{{row.${prop} ? "TRUE" : "FALSE" }}`
                            });
                        } else {
                            const newColumn = { Name: prop, DataType: 'string', Template: `{{row.${prop}}}` };

                            if ((/e(-|)mail/ig).test(newColumn.Name)) {
                                newColumn.Template = `<a href="mailto:${newColumn.Template}">${newColumn.Template}</a>`;
                            }

                            columns.push(newColumn);
                        }
                    });

                    let firstSort = false;

                    angular.forEach(columns, columnObj => {
                        columnObj.Label = columnObj.Name.replace(/([a-z])([A-Z])/g, '$1 $2');
                        columnObj.EditorType = me.getEditorTypeByDateType(columnObj.DataType);

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

                        if (firstSort) {
                            return;
                        }

                        columnObj.IsKey = true;
                        columnObj.SortOrder = 1;
                        columnObj.SortDirection = 'Ascending';
                        firstSort = true;
                    });

                    return columns;
                };

                me.generatePopupTemplate = (model, title) => {
                    const columns = me.createColumns(model);
                    title = title || 'Edit Row';

                    return `<tb-form model="Model"><div class="modal-header"><h3 class="modal-title">${title}</h3></div>` +
                        `<div class="modal-body">${me.generateFieldsArray(columns).join('')}</div>` +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
                        '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' +
                        '</div>' +
                        '</tb-form>';
                };

                me.generatePopup = (model, title) => {
                    const templateName = `temp${new Date().getTime()}.html`;
                    const template = me.generatePopupTemplate(model, title);

                    $templateCache.put(templateName, template);

                    return templateName;
                };

                /**
                 * Generates a new form using the fields model and options
                 *
                 * @param {array} fields
                 * @param {object} options
                 * @returns {string}
                 */
                me.generateForm = (fields, options) => {
                    const layout = options.Layout === 'Simple' ? '' : options.Layout.toLowerCase();
                    const fieldsArray = me.generateFieldsArray(fields);
                    let fieldsMarkup;

                    if (layout === '') {
                        fieldsMarkup = fieldsArray.join('');
                    } else {
                        fieldsMarkup = `\r\n\t<div class="row">${
                            layout === 'two-columns'
                                ? `\r\n\t<div class="col-md-6">${
                                fieldsArray.filter((i, e) => (e % 2) === 0).join('')
                                }\r\n\t</div>\r\n\t<div class="col-md-6">${
                                fieldsArray.filter((i, e) => (e % 2) === 1).join('')
                                }</div>`
                                : `\r\n\t<div class="col-md-4">${
                                fieldsArray.filter((i, e) => (e % 3) === 0).join('')
                                }\r\n\t</div>\r\n\t<div class="col-md-4">${
                                fieldsArray.filter((i, e) => (e % 3) === 1).join('')
                                }\r\n\t</div>\r\n\t<div class="col-md-4">${
                                fieldsArray.filter((i, e) => (e % 3) === 2).join('')
                                }\r\n\t</div>`
                            }\r\n\t</div>`;
                    }

                    return `${`<tb-form server-save-method="${options.SaveMethod}" 
                                model-key="${options.ModelKey}" 
                                require-authentication="${options.RequireAuthentication}" 
                                server-url="${options.dataUrl}" 
                                server-save-url="${options.SaveUrl}">` +
                        '\r\n\t'}${
                        fieldsMarkup
                        }\r\n\t<div>` +
                        `\r\n\t\t<button class="btn btn-primary" ng-click="$parent.save()" ng-disabled="!$parent.model.$valid()">Save</button>${
                        options.CancelButton
                            ? '\r\n\t\t<button class="btn btn-danger" ng-click="$parent.cancel()" formnovalidate>Cancel</button>'
                            : ''
                        }\r\n\t</div>` +
                        '\r\n</tb-form>';
                };

                /**
                 * Generates a array with a template for every column
                 *
                 * @param {array} columns
                 * @returns {array}
                 */
                me.generateFieldsArray = columns => columns.map(el => {
                        const editorTag = el.EditorType
                            .replace(/([A-Z])/g, $1 => `-${  $1.toLowerCase()}`);
                        const defaults = me.defaults.fieldsSettings[el.EditorType];

                        return `${'\r\n\t' +`<${editorTag} name="${el.Name}"`}${
                            defaults.EditorType ? `\r\n\t\teditor-type="${  el.DataType  }" ` : ''
                            }${defaults.ShowLabel
                                ? `\r\n\t\tlabel="${  el.Label  }" show-label="${  el.ShowLabel  }"`
                                : ''
                            }${defaults.Placeholder ? `\r\n\t\tplaceholder="${  el.Placeholder  }"` : ''
                            }${defaults.Required ? `\r\n\t\trequired="${  el.Required  }"` : ''
                            }${defaults.ReadOnly ? `\r\n\t\tread-only="${  el.ReadOnly  }"` : ''
                            }${defaults.Format ? `\r\n\t\tformat="${  el.Format  }"` : ''
                            }${defaults.Help ? `\r\n\t\thelp="${  el.Help  }"` : ''
                            }>\r\n\t` +`</${editorTag}>`;
                    });

                me.setupFilter = ($scope, $ctrl) => {
                    const dateOps = {
                        'None': translateFilter('OP_NONE'),
                        'Equals': translateFilter('OP_EQUALS'),
                        'NotEquals': translateFilter('OP_NOTEQUALS'),
                        'Between': translateFilter('OP_BETWEEN'),
                        'Gte': '>=',
                        'Gt': '>',
                        'Lte': '<=',
                        'Lt': '<'
                    };

                    const filterOperators = {
                        'string': {
                            'None': translateFilter('OP_NONE'),
                            'Equals': translateFilter('OP_EQUALS'),
                            'NotEquals': translateFilter('OP_NOTEQUALS'),
                            'Contains': translateFilter('OP_CONTAINS'),
                            'NotContains': translateFilter('OP_NOTCONTAINS'),
                            'StartsWith': translateFilter('OP_STARTSWITH'),
                            'NotStartsWith': translateFilter('OP_NOTSTARTSWITH'),
                            'EndsWith': translateFilter('OP_ENDSWITH'),
                            'NotEndsWith': translateFilter('OP_NOTENDSWITH')
                        },
                        'numeric': {
                            'None': translateFilter('OP_NONE'),
                            'Equals': translateFilter('OP_EQUALS'),
                            'Between': translateFilter('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'date': dateOps,
                        'datetime': dateOps,
                        'datetimeutc': dateOps,
                        'boolean': {
                            'None': translateFilter('OP_NONE'),
                            'Equals': translateFilter('OP_EQUALS'),
                            'NotEquals': translateFilter('OP_NOTEQUALS')
                        }
                    };

                    $ctrl.filter = {
                        Text: $ctrl.text || null,
                        Argument: $ctrl.argument ? [$ctrl.argument] : null,
                        Operator: $ctrl.operator || 'Contains',
                        OptionsUrl: $ctrl.optionsUrl || null,
                        HasFilter: !($ctrl.text == null || $ctrl.text === '' || angular.isUndefined($ctrl.text)),
                        Name: $scope.$parent.$parent.column.Name
                    };

                    $ctrl.filterTitle = $ctrl.title || translateFilter('CAPTION_FILTER');

                    $scope.$watch(() => {
                        const c = $ctrl.$component.columns.filter(e => e.Name === $ctrl.filter.Name);

                        return c.length !== 0 ? c[0] : null;
                    }, val => {
                            if (!val) {
                                return;
                            }

                            if ((val.DataType === 'date' || val.DataType === 'datetime' || val.DataType === 'datetimeutc')
                                && !($ctrl.filter.Text === '' || $ctrl.filter.Text == null))
                            {
                                $ctrl.filter.Text = new Date($ctrl.filter.Text);
                            }

                            if ($ctrl.filter.HasFilter !== val.Filter.HasFilter) {
                                $ctrl.filter.HasFilter = val.Filter.HasFilter;
                                $ctrl.filter.Text = val.Filter.Text;
                                $ctrl.retrieveData();
                            }
                        },
                        true);

                    $ctrl.retrieveData = function () {
                        const c = $ctrl.$component.columns.filter(e => e.Name === $ctrl.filter.Name);

                        if (c.length !== 0) {
                            c[0].Filter = $ctrl.filter;
                        }

                        $ctrl.$component.retrieveData();
                        $ctrl.close();
                    };

                    $ctrl.clearFilter = function () {
                        if ($ctrl.filter.Operator !== 'Multiple') {
                            $ctrl.filter.Operator = 'None';
                        }

                        if (angular.isDefined($ctrl.onlyContains) && $ctrl.onlyContains) {
                            $ctrl.filter.Operator = 'Contains';
                        }

                        $ctrl.filter.Text = '';
                        $ctrl.filter.Argument = [];
                        $ctrl.filter.HasFilter = false;
                        $ctrl.retrieveData();
                    };

                    $ctrl.applyFilter = () => {
                        $ctrl.filter.HasFilter = true;
                        $ctrl.retrieveData();
                    };

                    $ctrl.close = () => $ctrl.isOpen = false;

                    $ctrl.checkEvent = (keyEvent) => {
                        if (keyEvent.which === 13) {
                            $ctrl.applyFilter();
                            keyEvent.preventDefault();
                        }
                    };

                    const columns = $ctrl.$component.columns.filter(e => e.Name === $ctrl.filter.Name);

                    $scope.$watch('$ctrl.filter.Operator', val => {
                        if (val === 'None') {
                            $ctrl.filter.Text = '';
                        }
                    });

                    if (columns.length === 0) {
                        return;
                    }

                    $scope.$watch('$ctrl.filter', n => {
                        if (columns[0].Filter.Text !== n.Text) {
                            n.Text = columns[0].Filter.Text;

                            if (columns[0].Filter.Operator !== n.Operator) {
                                n.Operator = columns[0].Filter.Operator;
                            }
                        }

                        $ctrl.filter.HasFilter = columns[0].Filter.HasFilter;
                    });

                    columns[0].Filter = $ctrl.filter;
                    $ctrl.dataType = columns[0].DataType;
                    $ctrl.filterOperators = filterOperators[$ctrl.dataType];

                    if ($ctrl.dataType === 'date' ||
                        $ctrl.dataType === 'datetime' ||
                        $ctrl.dataType === 'datetimeutc') {
                        $ctrl.filter.Argument = [new Date()];

                        if ($ctrl.filter.Operator === 'Contains') {
                            $ctrl.filter.Operator = 'Equals';
                        }
                    }

                    if ($ctrl.dataType === 'numeric' || $ctrl.dataType === 'boolean') {
                        $ctrl.filter.Argument = [1];

                        if ($ctrl.filter.Operator === 'Contains') {
                            $ctrl.filter.Operator = 'Equals';
                        }
                    }
                };

            }
        ]);
})(angular);