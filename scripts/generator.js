(function() {
    'use strict';

    angular.module('app.generator', [])
        // This Factory and the pluker button is based on Angular Documentation
        .factory('formPostData', [
            '$document', function($document) {
                return function(url, newWindow, fields) {
                    /**
                 * If the form posts to target="_blank", pop-up blockers can cause it not to work.
                 * If a user choses to bypass pop-up blocker one time and click the link, they will arrive at
                 * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
                 * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
                 * newWindow param allows for this possibility.
                 */
                    var target = newWindow ? '_blank' : '_self';
                    var form = angular.element('<form style="display: none;" method="post" action="' + url + '" target="' + target + '"></form>');
                    angular.forEach(fields, function(value, name) {
                        var input = angular.element('<input type="hidden" name="' + name + '">');
                        input.attr('value', value);
                        form.append(input);
                    });
                    $document.find('body').append(form);
                    form[0].submit();
                    form.remove();
                };
            }
        ]).service('tubularGenerator', [
            'formPostData', function tubularGenerator(formPostData) {
                var me = this;

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

            me.createColumns = function(model, scope) {
                    var jsonModel = (angular.isArray(model) && model.length > 0) ? model[0] : model;

                    scope.columns = [];

                for (var prop in jsonModel) {
                    if (jsonModel.hasOwnProperty(prop)) {
                        var value = jsonModel[prop];

                        // Ignore null value, but maybe evaluate another item if there is anymore
                        if (value == null) continue;

                        if (angular.isNumber(value) || parseFloat(value).toString() == value) {
                            scope.columns.push({ Name: prop, DataType: 'numeric', Template: '{{row.' + prop + '}}' });
                        } else if (angular.isDate(value) || isNaN((new Date(value)).getTime()) == false) {
                            scope.columns.push({ Name: prop, DataType: 'date', Template: '{{row.' + prop + ' | date}}' });
                        } else if (value.toLowerCase() == 'true' || value.toLowerCase() == 'false') {
                            scope.columns.push({ Name: prop, DataType: 'boolean', Template: '{{row.' + prop + ' ? "TRUE" : "FALSE" }}' });
                        } else {
                            var newColumn = { Name: prop, DataType: 'string', Template: '{{row.' + prop + '}}' };

                            if ((/e(-|)mail/ig).test(newColumn.Name)) {
                                newColumn.Template = '<a href="mailto:' + newColumn.Template + '">' + newColumn.Template + '</a>';
                            }

                            scope.columns.push(newColumn);
                        }
                    }
                }

                var firstSort = false;

                    for (var column in scope.columns) {
                        if (scope.columns.hasOwnProperty(column)) {
                            var columnObj = scope.columns[column];
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
                };

                me.runGridTemplate = function(scope) {
                    var topToolbar = '';
                    var bottomToolbar = '';

                    if (scope.uiOptions.Pager) {
                        topToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                        bottomToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                    }

                    if (scope.uiOptions.ExportCsv) {
                        topToolbar += '\r\n\t<div class="col-md-3">' +
                            '\r\n\t\t<div class="btn-group">' +
                            '\r\n\t\t<tb-print-button title="Tubular" class="btn-sm"></tb-print-button>' +
                            '\r\n\t\t<tb-export-button filename="tubular.csv" css="btn-sm"></tb-export-button>' +
                            '\r\n\t\t</div>' +
                            '\r\n\t</div>';
                    }

                    if (scope.uiOptions.FreeTextSearch) {
                        topToolbar += '\r\n\t<tb-text-search class="col-md-3" css="input-sm"></tb-text-search>';
                    }

                    if (scope.uiOptions.PageSizeSelector) {
                        bottomToolbar += '\r\n\t<tb-page-size-selector class="col-md-3" selectorcss="input-sm"></tb-page-size-selector>';
                    }

                    if (scope.uiOptions.PagerInfo) {
                        bottomToolbar += '\r\n\t<tb-grid-pager-info class="col-md-3"></tb-grid-pager-info>';
                    }

                    return '<h1>Autogenerated Grid</h1>' +
                        '\r\n<div class="container">' +
                        '\r\n<tb-grid server-url="' + scope.dataUrl + '" request-method="GET" class="row" require-authentication="false" page-size="10"' +
                        (scope.isOData ? ' service-name="odata"' : '') +
                        (scope.uiOptions.Mode != 'Read-Only' ? ' editor-mode="' + scope.uiOptions.Mode.toLowerCase() +'"' : '') + '>' +
                        (topToolbar === '' ? '' : '\r\n\t<div class="row">' + topToolbar + '\r\n\t</div>') +
                        '\r\n\t<div class="row">' +
                        '\r\n\t<div class="col-md-12">' +
                        '\r\n\t<div class="panel panel-default panel-rounded">' +
                        '\r\n\t<tb-grid-table class="table-bordered">' +
                        '\r\n\t<tb-column-definitions>' +
                        (scope.uiOptions.Mode != 'Read-Only' ? '\r\n\t\t<tb-column label="Actions"><tb-column-header>{{label}}</tb-column-header></tb-column>' : '') +
                        scope.columns.map(function(el) {
                            return '\r\n\t\t<tb-column name="' + el.Name + '" label="' + el.Label + '" column-type="' + el.DataType + '" sortable="' + el.Sortable + '" ' +
                                '\r\n\t\t\tsort-order="' + el.SortOrder + '" is-key="' + el.IsKey + '" searchable="' + el.Searchable + '" visible="' + el.Visible + '">' +
                                (el.Filter ? '<tb-column-filter></tb-column-filter>' : '') +
                                '\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>' +
                                '\r\n\t\t</tb-column>';
                        }).join('') +
                        '\r\n\t</tb-column-definitions>' +
                        '\r\n\t<tb-row-set>' +
                        '\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">' +
                        (scope.uiOptions.Mode != 'Read-Only' ? '\r\n\t\t<tb-cell-template>' +
                                            (scope.uiOptions.Mode  == 'Inline' ? '\r\n\t\t\t<tb-save-button model="row"></tb-save-button>' : '')+
                                            '\r\n\t\t\t<tb-edit-button model="row"></tb-edit-button>' +
                                            '\r\n\t\t</tb-cell-template>' : '') +
                        scope.columns.map(function (el) {
                            var editorTag = el.EditorType.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });

                            return '\r\n\t\t<tb-cell-template column-name="' + el.Name + '">' +
                                (scope.uiOptions.Mode == 'Inline' ?
                                    '<' + editorTag + ' is-editing="row.$isEditing" value="row.' + el.Name + '"></' + editorTag + '>' :
                                    '\r\n\t\t\t' + el.Template) +
                                 '\r\n\t\t</tb-cell-template>';
                        }).join('') +
                        '\r\n\t</tb-row-template>' +
                        '\r\n\t</tb-row-set>' +
                        '\r\n\t</tb-grid-table>' +
                        '\r\n\t</div>' +
                        '\r\n\t</div>' +
                        '\r\n\t</div>' +
                        (bottomToolbar === '' ? '' : '\r\n\t<div class="row">' + bottomToolbar + '\r\n\t</div>') +
                        '\r\n\t</div>' +
                        '\r\n</tb-grid>' +
                        '\r\n</div>';
                };

                me.runFormTemplate = function(scope) {
                    return '<h1>Autogenerated Form</h1>' +
                        '\r\n<tb-form server-url="' + scope.dataUrl + '" server-save-url="' + scope.dataUrl + '"' +
                        (scope.isOData ? ' service-name="odata"' : '') + '>' +
                        scope.columns.map(function(el) {
                            var editorTag = el.EditorType.replace(/([A-Z])/g, function($1) { return "-" + $1.toLowerCase(); });
                            return '\r\n\t<' + editorTag + ' name="' + el.Name + '" label="' + el.Label + '" editor-type="' + el.DataType + '" ' +
                                '\r\n\t\tshow-label="' + el.ShowLabel + '" placeholder="' + el.Placeholder + '" required="' + el.Required + '" ' +
                                '\r\n\t\tread-only="' + el.ReadOnly + '" format="' + el.Format + '" help="' + el.Help + '">' +
                                '\r\n\t</' + editorTag + '>';
                        }).join('') +
                        '\r\n<button class="btn btn-primary" ng-click="$parent.save()" ng-disabled="!$parent.model.$valid()">Save</button>' +
                        '\r\n<a class="btn btn-danger" href="/">Cancel</button>' +
                        '\r\n</tb-form>';
                };

                me.exportPluker = function(files) {
                    var postData = {};

                    angular.forEach(files, function(file) {
                        postData['files[' + file.name + ']'] = file.content;
                    });

                    postData['tags[0]'] = "angularjs";
                    postData['tags[1]'] = "tubular";
                    postData['tags[1]'] = "autogenerated";
                    postData.private = true;
                    postData.description = "Tubular Sample";

                    formPostData('http://plnkr.co/edit/?p=preview', false, postData);
                };
            }
        ]);
})();