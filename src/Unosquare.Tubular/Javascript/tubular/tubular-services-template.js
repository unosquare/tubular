(function (angular) {
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
            '$templateCache', function ($templateCache) {
                var me = this;

                me.canUseHtml5Date = function(){
                    var input = document.createElement('input');
                    input.setAttribute('type', 'date');

                    var notADateValue = 'not-a-date';
                    input.setAttribute('value', notADateValue);

                    return input.value !== notADateValue;
                };

                me.enums = {
                    dataTypes: ['numeric', 'date', 'boolean', 'string'],
                    editorTypes: [
                        'tbSimpleEditor', 'tbNumericEditor', 'tbDateTimeEditor', 'tbDateEditor',
                        'tbDropdownEditor', 'tbTypeaheadEditor', 'tbHiddenField', 'tbCheckboxField', 'tbTextArea'
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
                        ServiceName: '',
                        dataUrl: ''
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
                };

                // Loading popovers templates
                me.tbColumnFilterPopoverTemplateName = 'tbColumnFilterPopoverTemplate.html';
                me.tbColumnDateTimeFilterPopoverTemplateName = 'tbColumnDateTimeFilterPopoverTemplate.html';
                me.tbColumnOptionsFilterPopoverTemplateName = 'tbColumnOptionsFilterPopoverTemplate.html';
                me.tbRemoveButtonrPopoverTemplateName = 'tbRemoveButtonrPopoverTemplate.html';

                if (!$templateCache.get(me.tbColumnFilterPopoverTemplateName)) {
                    me.tbColumnFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ' +
                        'ng-hide="$ctrl.dataType == \'boolean\' || $ctrl.onlyContains"></select>&nbsp;' +
                        '<input class="form-control" type="search" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ng-hide="$ctrl.dataType == \'boolean\'"' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                        '<div class="text-center" ng-show="$ctrl.dataType == \'boolean\'">' +
                        '<button type="button" class="btn btn-default btn-md" ng-disabled="$ctrl.filter.Text === true" ng-click="$ctrl.filter.Text = true; $ctrl.filter.Operator = \'Equals\';">' +
                        '<i class="fa fa-check"></i></button>&nbsp;' +
                        '<button type="button" class="btn btn-default btn-md" ng-disabled="$ctrl.filter.Text === false" ng-click="$ctrl.filter.Text = false; $ctrl.filter.Operator = \'Equals\';">' +
                        '<i class="fa fa-times"></i></button></div>' +
                        '<input type="search" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>';

                    $templateCache.put(me.tbColumnFilterPopoverTemplateName, me.tbColumnFilterPopoverTemplate);
                }

                if (!$templateCache.get(me.tbColumnDateTimeFilterPopoverTemplateName)) {
                    var htmlDateSelector =
                        '<input class="form-control" type="date" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ' +
                            'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" />' +
                            '<input type="date" class="form-control" ng-model="$ctrl.filter.Argument[0]" ng-keypress="$ctrl.checkEvent($event)" ng-show="$ctrl.filter.Operator == \'Between\'" />';

                    var bootstrapDateSelector = '<div class="input-group">' +
                        '<input type="text" class="form-control" uib-datepicker-popup="MM/dd/yyyy" ng-model="$ctrl.filter.Text" autofocus ng-keypress="$ctrl.checkEvent($event)" ' +
                        'placeholder="{{\'CAPTION_VALUE\' | translate}}" ng-disabled="$ctrl.filter.Operator == \'None\'" is-open="$ctrl.dateOpen" />' +
                        '<span class="input-group-btn">' +
                        '<button type="button" class="btn btn-default" ng-click="$ctrl.dateOpen = !$ctrl.dateOpen;"><i class="fa fa-calendar"></i></button>' +
                        '</span>' +
                        '</div>';

                    me.tbColumnDateTimeFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control" ng-options="key as value for (key , value) in $ctrl.filterOperators" ng-model="$ctrl.filter.Operator" ng-hide="$ctrl.dataType == \'boolean\'"></select>&nbsp;' +
                        (me.canUseHtml5Date() ? htmlDateSelector : bootstrapDateSelector) +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form>' +
                        '</div>';

                    $templateCache.put(me.tbColumnDateTimeFilterPopoverTemplateName,
                        me.tbColumnDateTimeFilterPopoverTemplate);
                }

                if (!$templateCache.get(me.tbColumnOptionsFilterPopoverTemplateName)) {
                    // TODO: we need to expose the Key and Label as binding
                    me.tbColumnOptionsFilterPopoverTemplate = '<div>' +
                        '<form class="tubular-column-filter-form" onsubmit="return false;">' +
                        '<select class="form-control checkbox-list" ng-options="item.Key as item.Label for item in $ctrl.optionsItems" ' +
                        'ng-model="$ctrl.filter.Argument" multiple ng-disabled="$ctrl.dataIsLoaded == false"></select>&nbsp;' +
                        '<hr />' +
                        '<tb-column-filter-buttons></tb-column-filter-buttons>' +
                        '</form></div>';

                    $templateCache.put(me.tbColumnOptionsFilterPopoverTemplateName,
                        me.tbColumnOptionsFilterPopoverTemplate);
                }

                if (!$templateCache.get(me.tbRemoveButtonrPopoverTemplateName)) {
                    me.tbRemoveButtonrPopoverTemplate = '<div class="tubular-remove-popover">' +
                        '<button ng-click="$ctrl.model.delete()" class="btn btn-danger btn-xs">' +
                        '{{:: $ctrl.caption || (\'CAPTION_REMOVE\' | translate) }}' +
                        '</button>' +
                        '&nbsp;' +
                        '<button ng-click="$ctrl.isOpen = false;" class="btn btn-default btn-xs">' +
                        '{{:: $ctrl.cancelCaption || (\'CAPTION_CANCEL\' | translate) }}' +
                        '</button>' +
                        '</div>';

                    $templateCache.put(me.tbRemoveButtonrPopoverTemplateName, me.tbRemoveButtonrPopoverTemplate);
                }

                /**
                 * Generates the grid's cells markup
                 * @param {array} columns 
                 * @param {string} mode 
                 * @returns {string} 
                 */
                me.generateCells = function (columns, mode) {
                    return columns.map(function (el) {
                        var editorTag = el.EditorType
                            .replace(/([A-Z])/g, function ($1) { return '-' + $1.toLowerCase(); });

                        return '\r\n\t\t<tb-cell-template column-name="' +
                            el.Name +
                            '">' +
                            '\r\n\t\t\t' +
                            (mode === 'Inline'
                                ? '<' +
                                editorTag +
                                ' is-editing="row.$isEditing" value="row.' +
                                el.Name +
                                '">' +
                                '</' +
                                editorTag +
                                '>'
                                : el.Template) +
                            '\r\n\t\t</tb-cell-template>';
                    })
                        .join('');
                };

                /**
                 * Generates a grid markup using a columns model and grids options
                 * @param {array} columns 
                 * @param {object} options 
                 * @returns {string} 
                 */
                me.generateGrid = function (columns, options) {
                    var topToolbar = '';
                    var bottomToolbar = '';

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

                    return '<div class="container">' +
                        '\r\n<tb-grid server-url="' +
                        options.dataUrl +
                        '" request-method="' +
                        options.RequestMethod +
                        '" class="row" ' +
                        'page-size="10" require-authentication="' +
                        options.RequireAuthentication +
                        '" ' +
                        (options.ServiceName !== '' ? ' service-name="' + options.ServiceName + '"' : '') +
                        (options.Mode !== 'Read-Only' ? ' editor-mode="' + options.Mode.toLowerCase() + '"' : '') +
                        '>' +
                        (topToolbar === '' ? '' : '\r\n\t<div class="row">' + topToolbar + '\r\n\t</div>') +
                        '\r\n\t<div class="row">' +
                        '\r\n\t<div class="col-md-12">' +
                        '\r\n\t<div class="panel panel-default panel-rounded">' +
                        '\r\n\t<tb-grid-table class="table-bordered">' +
                        '\r\n\t<tb-column-definitions>' +
                        (options.Mode !== 'Read-Only'
                            ? '\r\n\t\t<tb-column label="Actions"><tb-column-header>{{label}}</tb-column-header></tb-column>'
                            : '') +
                        columns.map(function (el) {
                            return '\r\n\t\t<tb-column name="' +
                                el.Name +
                                '" label="' +
                                el.Label +
                                '" column-type="' +
                                el.DataType +
                                '" sortable="' +
                                el.Sortable +
                                '" ' +
                                '\r\n\t\t\tis-key="' +
                                el.IsKey +
                                '" searchable="' +
                                el.Searchable +
                                '" ' +
                                (el.Sortable
                                    ? '\r\n\t\t\tsort-direction="' +
                                    el.SortDirection +
                                    '" sort-order="' +
                                    el.SortOrder +
                                    '" '
                                    : ' ') +
                                'visible="' +
                                el.Visible +
                                '">' +
                                (el.Filter ? '\r\n\t\t\t<tb-column-filter></tb-column-filter>' : '') +
                                '\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>' +
                                '\r\n\t\t</tb-column>';
                        })
                        .join('') +
                        '\r\n\t</tb-column-definitions>' +
                        '\r\n\t<tb-row-set>' +
                        '\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">' +
                        (options.Mode !== 'Read-Only'
                            ? '\r\n\t\t<tb-cell-template>' +
                            (options
                                .Mode ===
                                'Inline'
                                ? '\r\n\t\t\t<tb-save-button model="row"></tb-save-button>'
                                : '') +
                            '\r\n\t\t\t<tb-edit-button model="row"></tb-edit-button>' +
                            '\r\n\t\t</tb-cell-template>'
                            : '') +
                        me.generateCells(columns, options.Mode) +
                        '\r\n\t</tb-row-template>' +
                        '\r\n\t</tb-row-set>' +
                        '\r\n\t</tb-grid-table>' +
                        '\r\n\t</div>' +
                        '\r\n\t</div>' +
                        '\r\n\t</div>' +
                        (bottomToolbar === '' ? '' : '\r\n\t<div class="row">' + bottomToolbar + '\r\n\t</div>') +
                        '\r\n</tb-grid>' +
                        '\r\n</div>';
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

                /*
                 * Create a columns array using a model.
                 * 
                 * @param {object} model
                 * @returns {array} The Columns
                 */
                me.createColumns = function (model) {
                    var jsonModel = (model instanceof Array && model.length > 0) ? model[0] : model;
                    var columns = [];

                    for (var prop in jsonModel) {
                        if (jsonModel.hasOwnProperty(prop)) {
                            var value = jsonModel[prop];

                            // Ignore functions and  null value, but maybe evaluate another item if there is anymore
                            if (prop[0] === '$' || angular.isFunction(value) || value == null) {
                                continue;
                            }

                            if (angular.isNumber(value) || parseFloat(value).toString() === value) {
                                columns.push({
                                    Name: prop,
                                    DataType: 'numeric',
                                    Template: '{{row.' + prop + ' | number}}'
                                });
                            } else if (toString.call(value) === '[object Date]' ||
                                isNaN((new Date(value)).getTime()) === false) {
                                columns.push({ Name: prop, DataType: 'date', Template: '{{row.' + prop + ' | date}}' });
                            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                                columns.push({
                                    Name: prop,
                                    DataType: 'boolean',
                                    Template: '{{row.' + prop + ' ? "TRUE" : "FALSE" }}'
                                });
                            } else {
                                var newColumn = { Name: prop, DataType: 'string', Template: '{{row.' + prop + '}}' };

                                if ((/e(-|)mail/ig).test(newColumn.Name)) {
                                    newColumn.Template = '<a href="mailto:' +
                                        newColumn.Template +
                                        '">' +
                                        newColumn.Template +
                                        '</a>';
                                }

                                columns.push(newColumn);
                            }
                        }
                    }

                    var firstSort = false;

                    angular.forEach(columns,
                        function(columnObj) {
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

                            if (!firstSort) {
                                columnObj.IsKey = true;
                                columnObj.SortOrder = 1;
                                columnObj.SortDirection = 'Ascending';
                                firstSort = true;
                            }
                        });

                    return columns;
                };

                me.generatePopupTemplate = function (model, title) {
                    var columns = me.createColumns(model);

                    return '<tb-form model="Model">' +
                        '<div class="modal-header"><h3 class="modal-title">' +
                        (title || 'Edit Row') +
                        '</h3></div>' +
                        '<div class="modal-body">' +
                        me.generateFieldsArray(columns).join('') +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
                        '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' +
                        '</div>' +
                        '</tb-form>';
                };

                me.generatePopup = function (model, title) {
                    var templateName = 'temp' + (new Date().getTime()) + '.html';
                    var template = me.generatePopupTemplate(model, title);

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
                me.generateForm = function (fields, options) {
                    var layout = options.Layout === 'Simple' ? '' : options.Layout.toLowerCase();
                    var fieldsArray = me.generateFieldsArray(fields);
                    var fieldsMarkup;

                    if (layout === '') {
                        fieldsMarkup = fieldsArray.join('');
                    } else {
                        fieldsMarkup = '\r\n\t<div class="row">' +
                            (layout === 'two-columns'
                                ? '\r\n\t<div class="col-md-6">' +
                                fieldsArray.filter(function (i, e) { return (e % 2) === 0; }).join('') +
                                '\r\n\t</div>\r\n\t<div class="col-md-6">' +
                                fieldsArray.filter(function (i, e) { return (e % 2) === 1; }).join('') +
                                '</div>'
                                : '\r\n\t<div class="col-md-4">' +
                                fieldsArray.filter(function (i, e) { return (e % 3) === 0; }).join('') +
                                '\r\n\t</div>\r\n\t<div class="col-md-4">' +
                                fieldsArray.filter(function (i, e) { return (e % 3) === 1; }).join('') +
                                '\r\n\t</div>\r\n\t<div class="col-md-4">' +
                                fieldsArray.filter(function (i, e) { return (e % 3) === 2; }).join('') +
                                '\r\n\t</div>') +
                            '\r\n\t</div>';
                    }

                    return '<tb-form server-save-method="' +
                        options.SaveMethod +
                        '" ' +
                        'model-key="' +
                        options.ModelKey +
                        '" require-authentication="' +
                        options.RequireAuthentication +
                        '" ' +
                        'server-url="' +
                        options.dataUrl +
                        '" server-save-url="' +
                        options.SaveUrl +
                        '"' +
                        (options.ServiceName !== '' ? ' service-name="' + options.ServiceName + '"' : '') +
                        '>' +
                        '\r\n\t' +
                        fieldsMarkup +
                        '\r\n\t<div>' +
                        '\r\n\t\t<button class="btn btn-primary" ng-click="$parent.save()" ng-disabled="!$parent.model.$valid()">Save</button>' +
                        (options.CancelButton
                            ? '\r\n\t\t<button class="btn btn-danger" ng-click="$parent.cancel()" formnovalidate>Cancel</button>'
                            : '') +
                        '\r\n\t</div>' +
                        '\r\n</tb-form>';
                };

                /**
                 * Generates a array with a template for every column
                 * 
                 * @param {array} columns
                 * @returns {array}
                 */
                me.generateFieldsArray = function (columns) {
                    return columns.map(function (el) {
                        var editorTag = el.EditorType
                            .replace(/([A-Z])/g, function ($1) { return '-' + $1.toLowerCase(); });
                        var defaults = me.defaults.fieldsSettings[el.EditorType];

                        return '\r\n\t<' +
                            editorTag +
                            ' name="' +
                            el.Name +
                            '"' +
                            (defaults.EditorType ? '\r\n\t\teditor-type="' + el.DataType + '" ' : '') +
                            (defaults.ShowLabel
                                ? '\r\n\t\tlabel="' + el.Label + '" show-label="' + el.ShowLabel + '"'
                                : '') +
                            (defaults.Placeholder ? '\r\n\t\tplaceholder="' + el.Placeholder + '"' : '') +
                            (defaults.Required ? '\r\n\t\trequired="' + el.Required + '"' : '') +
                            (defaults.ReadOnly ? '\r\n\t\tread-only="' + el.ReadOnly + '"' : '') +
                            (defaults.Format ? '\r\n\t\tformat="' + el.Format + '"' : '') +
                            (defaults.Help ? '\r\n\t\thelp="' + el.Help + '"' : '') +
                            '>\r\n\t</' +
                            editorTag +
                            '>';
                    });
                };

                me.setupFilter = function ($scope, $element, $compile, $filter, $ctrl) {
                    var dateOps = {
                        'None': $filter('translate')('OP_NONE'),
                        'Equals': $filter('translate')('OP_EQUALS'),
                        'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                        'Between': $filter('translate')('OP_BETWEEN'),
                        'Gte': '>=',
                        'Gt': '>',
                        'Lte': '<=',
                        'Lt': '<'
                    };

                    var filterOperators = {
                        'string': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Contains': $filter('translate')('OP_CONTAINS'),
                            'NotContains': $filter('translate')('OP_NOTCONTAINS'),
                            'StartsWith': $filter('translate')('OP_STARTSWITH'),
                            'NotStartsWith': $filter('translate')('OP_NOTSTARTSWITH'),
                            'EndsWith': $filter('translate')('OP_ENDSWITH'),
                            'NotEndsWith': $filter('translate')('OP_NOTENDSWITH')
                        },
                        'numeric': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'date': dateOps,
                        'datetime': dateOps,
                        'datetimeutc': dateOps,
                        'boolean': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS')
                        }
                    };

                    $ctrl.filter = {
                        Text: $ctrl.text || null,
                        Argument: $ctrl.argument ? [$ctrl.argument] : null,
                        Operator: $ctrl.operator || 'Contains',
                        OptionsUrl: $ctrl.optionsUrl || null,
                        HasFilter: !($ctrl.text == null),
                        Name: $scope.$parent.$parent.column.Name
                    };

                    $ctrl.filterTitle = $ctrl.title || $filter('translate')('CAPTION_FILTER');

                    $scope.$watch(function () {
                        var c = $ctrl.$component.columns
                            .filter(function (e) { return e.Name === $ctrl.filter.Name; });

                        return c.length !== 0 ? c[0] : null;
                    },
                        function (val) {
                            if (!val) return;

                            if ($ctrl.filter.HasFilter !== val.Filter.HasFilter) {
                                $ctrl.filter.HasFilter = val.Filter.HasFilter;
                                $ctrl.filter.Text = val.Filter.Text;
                                $ctrl.retrieveData();
                            }
                        },
                        true);

                    $ctrl.retrieveData = function () {
                        var c = $ctrl.$component.columns.filter(function (e) { return e.Name === $ctrl.filter.Name; });

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

                    $ctrl.applyFilter = function () {
                        $ctrl.filter.HasFilter = true;
                        $ctrl.retrieveData();
                    };

                    $ctrl.close = function () {
                        $ctrl.isOpen = false;
                    };

                    $ctrl.checkEvent = function (keyEvent) {
                        if (keyEvent.which === 13) {
                            $ctrl.applyFilter();
                            keyEvent.preventDefault();
                        }
                    };

                    var columns = $ctrl.$component.columns.filter(function (e) { return e.Name === $ctrl.filter.Name; });

                    $scope.$watch('$ctrl.filter.Operator', function (val) { if (val === 'None') $ctrl.filter.Text = ''; });

                    if (columns.length === 0) return;

                    $scope.$watch('$ctrl.filter', function (n) {
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