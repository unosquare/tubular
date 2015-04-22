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
            '$http', function tubularGenerator($http) {
                var me = this;

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
                            columnObj.Searchable = columnObj.DataType === 'string';
                            columnObj.Filter = true;
                            columnObj.Visible = true;
                            columnObj.Sortable = true;
                            columnObj.IsKey = false;
                            columnObj.SortOrder = -1;

                            if (firstSort === false) {
                                columnObj.IsKey = true;
                                columnObj.SortOrder = 1;
                                firstSort = true;
                            }
                        }
                    }
                };
            }
        ]);
})();