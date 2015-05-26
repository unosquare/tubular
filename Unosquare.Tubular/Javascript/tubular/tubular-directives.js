(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.directives
     * 
     * @description 
     * Tubular Directives module. It contains all the directives.
     * 
     * It depends upon {@link tubular.services} and {@link tubular.models}.
     */
    angular.module('tubular.directives', ['tubular.services', 'tubular.models'])
        /**
         * @ngdoc directive
         * @name tbGrid
         * @restrict E
         *
         * @description
         * The `tbGrid` directive is the base to create any grid. This is the root node where you should start
         * designing your grid. Don't need to add a `controller`.
         * 
         * @scope
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverSaveMethod Set HTTP Method to save data.
         * @param {int} pageSize Define how many records to show in a page, default 20.
         * @param {function} onBeforeGetData Callback to execute before to get data from service.
         * @param {string} requestMethod Set HTTP Method to get data.
         * @param {string} serviceName Define Data service (name) to retrieve data, defaults `tubularHttp`.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {string} name Grid's name, used to store metainfo in localstorage.
         * @param {string} editorMode Define if grid is read-only or it has editors (inline or popup).
         * @param {bool} showLoading Set if an overlay will show when it's loading data, default true.
         */
        .directive('tbGrid', [
            function() {
                return {
                    template: '<div class="tubular-grid">' +
                        '<div class="tubular-overlay" ng-show="showLoading && currentRequest != null"><div><div class="fa fa-refresh fa-2x fa-spin"></div></div></div>' +
                        '<ng-transclude></ng-transclude>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        serverUrl: '@',
                        serverSaveUrl: '@',
                        serverSaveMethod: '@',
                        pageSize: '@?',
                        onBeforeGetData: '=?',
                        requestMethod: '@',
                        dataServiceName: '@?serviceName',
                        requireAuthentication: '@?',
                        name: '@?gridName',
                        editorMode: '@?',
                        showLoading: '=?'
                    },
                    controller: [
                        '$scope', 'localStorageService', 'tubularPopupService', 'tubularModel', 'tubularHttp', '$routeParams',
                        function($scope, localStorageService, tubularPopupService, TubularModel, tubularHttp, $routeParams) {

                            $scope.tubularDirective = 'tubular-grid';
                            $scope.columns = [];
                            $scope.rows = [];
                            $scope.currentPage = 0;
                            $scope.totalPages = 0;
                            $scope.totalRecordCount = 0;
                            $scope.filteredRecordCount = 0;
                            $scope.requestedPage = 1;
                            $scope.hasColumnsDefinitions = false;
                            $scope.requestCounter = 0;
                            $scope.requestMethod = $scope.requestMethod || 'POST';
                            $scope.serverSaveMethod = $scope.serverSaveMethod || 'POST';
                            $scope.requestTimeout = 10000;
                            $scope.currentRequest = null;
                            $scope.autoSearch = $routeParams.param || '';
                            $scope.search = {
                                Text: $scope.autoSearch,
                                Operator: $scope.autoSearch == '' ? 'None' : 'Auto'
                            };
                            $scope.isEmpty = false;
                            $scope.tempRow = new TubularModel($scope, {});
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);
                            $scope.requireAuthentication = $scope.requireAuthentication || true;
                            $scope.name = $scope.name || 'tbgrid';
                            $scope.editorMode = $scope.editorMode || 'none';
                            $scope.canSaveState = false;
                            $scope.groupBy = '';
                            $scope.showLoading = $scope.showLoading || true;

                            $scope.$watch('columns', function() {
                                if ($scope.hasColumnsDefinitions === false || $scope.canSaveState === false)
                                    return;

                                localStorageService.set($scope.name + "_columns", $scope.columns);
                            }, true);

                            $scope.addColumn = function(item) {
                                if (item.Name === null) return;

                                if ($scope.hasColumnsDefinitions !== false)
                                    throw 'Cannot define more columns. Column definitions have been sealed';

                                $scope.columns.push(item);
                            };

                            $scope.newRow = function(template, popup) {
                                $scope.tempRow = new TubularModel($scope, {}, $scope.dataService);
                                $scope.tempRow.$isNew = true;
                                $scope.tempRow.$isEditing = true;

                                if (angular.isDefined(template)) {
                                    if (angular.isDefined(popup) && popup) {
                                        tubularPopupService.openDialog(template, $scope.tempRow);
                                    }
                                }
                            };

                            $scope.deleteRow = function(row) {
                                var request = {
                                    serverUrl: $scope.serverSaveUrl + "/" + row.$key,
                                    requestMethod: 'DELETE',
                                    timeout: $scope.requestTimeout,
                                    requireAuthentication: $scope.requireAuthentication,
                                };

                                $scope.currentRequest = $scope.dataService.retrieveDataAsync(request);

                                $scope.currentRequest.promise.then(
                                    function(data) {
                                        row.$hasChanges = false;
                                        $scope.$emit('tbGrid_OnRemove', data);
                                    }, function(error) {
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    }).then(function() {
                                    $scope.currentRequest = null;
                                    $scope.retrieveData();
                                });
                            };

                            $scope.verifyColumns = function() {
                                var columns = localStorageService.get($scope.name + "_columns");
                                if (columns === null || columns === "") {
                                    // Nothing in settings, saving initial state
                                    localStorageService.set($scope.name + "_columns", $scope.columns);
                                    return;
                                }

                                for (var index in columns) {
                                    var columnName = columns[index].Name;
                                    var filtered = $scope.columns.filter(function(el) { return el.Name == columnName; });

                                    if (filtered.length == 0) continue;

                                    var current = filtered[0];
                                    // Updates visibility by now
                                    current.Visible = columns[index].Visible;
                                    // TODO: Restore filters
                                }
                            };

                            $scope.retrieveData = function() {
                                $scope.canSaveState = true;
                                $scope.verifyColumns();

                                $scope.pageSize = $scope.pageSize || 20;
                                var page = $scope.requestedPage == 0 ? 1 : $scope.requestedPage;

                                var request = {
                                    serverUrl: $scope.serverUrl,
                                    requestMethod: $scope.requestMethod,
                                    timeout: $scope.requestTimeout,
                                    requireAuthentication: $scope.requireAuthentication,
                                    data: {
                                        Count: $scope.requestCounter,
                                        Columns: $scope.columns,
                                        Skip: (page - 1) * $scope.pageSize,
                                        Take: parseInt($scope.pageSize),
                                        Search: $scope.search,
                                        TimezoneOffset: new Date().getTimezoneOffset()
                                    }
                                };

                                var hasLocker = $scope.currentRequest !== null;
                                if (hasLocker) {
                                    $scope.currentRequest.cancel('tubularGrid(' + $scope.$id + '): new request coming.');
                                }

                                if (angular.isUndefined($scope.onBeforeGetData) === false)
                                    $scope.onBeforeGetData();

                                $scope.$emit('tbGrid_OnBeforeRequest', request);

                                $scope.currentRequest = $scope.dataService.retrieveDataAsync(request);

                                $scope.currentRequest.promise.then(
                                    function(data) {
                                        $scope.requestCounter += 1;

                                        if (angular.isUndefined(data) || data == null) {
                                            $scope.$emit('tbGrid_OnConnectionError', {
                                                statusText: "Data is empty",
                                                status: 0
                                            });

                                            return;
                                        }

                                        $scope.dataSource = data;

                                        $scope.rows = data.Payload.map(function(el) {
                                            var model = new TubularModel($scope, el, $scope.dataService);

                                            model.editPopup = function(template) {
                                                tubularPopupService.openDialog(template, model);
                                            };

                                            return model;
                                        });

                                        $scope.currentPage = data.CurrentPage;
                                        $scope.totalPages = data.TotalPages;
                                        $scope.totalRecordCount = data.TotalRecordCount;
                                        $scope.filteredRecordCount = data.FilteredRecordCount;
                                        $scope.isEmpty = $scope.filteredRecordCount == 0;
                                    }, function(error) {
                                        $scope.requestedPage = $scope.currentPage;
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    }).then(function() {
                                    $scope.currentRequest = null;
                                });
                            };

                            $scope.$watch('hasColumnsDefinitions', function(newVal) {
                                if (newVal !== true) return;

                                var isGrouping = false;
                                // Check columns
                                angular.forEach($scope.columns, function(column) {
                                    if (column.IsGrouping) {
                                        if (isGrouping)
                                            throw 'Only one column is allowed to grouping';

                                        isGrouping = true;
                                        column.Visible = false;
                                        column.Sortable = true;
                                        column.SortOrder = 1;
                                        $scope.groupBy = column.Name;
                                    }
                                });

                                angular.forEach($scope.columns, function(column) {
                                    if ($scope.groupBy == column.Name) return;

                                    if (column.Sortable && column.SortOrder > 0)
                                        column.SortOrder++;
                                });

                                $scope.retrieveData();
                            });

                            $scope.$watch('pageSize', function() {
                                if ($scope.hasColumnsDefinitions && $scope.requestCounter > 0)
                                    $scope.retrieveData();
                            });

                            $scope.$watch('requestedPage', function() {
                                // TODO: we still need to inter-lock failed, initial and paged requests
                                if ($scope.hasColumnsDefinitions && $scope.requestCounter > 0)
                                    $scope.retrieveData();
                            });

                            $scope.sortColumn = function(columnName, multiple) {
                                var filterColumn = $scope.columns.filter(function(el) {
                                    return el.Name === columnName;
                                });

                                if (filterColumn.length === 0) return;

                                var column = filterColumn[0];

                                if (column.Sortable === false) return;

                                // need to know if it's currently sorted before we reset stuff
                                var currentSortDirection = column.SortDirection;
                                var toBeSortDirection = currentSortDirection === 'None' ? 'Ascending' : currentSortDirection === 'Ascending' ? 'Descending' : 'None';

                                // the latest sorting takes less priority than previous sorts
                                if (toBeSortDirection === 'None') {
                                    column.SortOrder = -1;
                                    column.SortDirection = 'None';
                                } else {
                                    column.SortOrder = Number.MAX_VALUE;
                                    column.SortDirection = toBeSortDirection;
                                }

                                // if it's not a multiple sorting, remove the sorting from all other columns
                                if (multiple === false) {
                                    angular.forEach($scope.columns.filter(function(col) { return col.Name !== columnName; }), function(col) {
                                        col.SortOrder = -1;
                                        col.SortDirection = 'None';
                                    });
                                }

                                // take the columns that actually need to be sorted in order to reindex them
                                var currentlySortedColumns = $scope.columns.filter(function(col) {
                                    return col.SortOrder > 0;
                                });

                                // reindex the sort order
                                currentlySortedColumns.sort(function(a, b) {
                                    return a.SortOrder == b.SortOrder ? 0 : a.SortOrder > b.SortOrder;
                                });

                                currentlySortedColumns.forEach(function(col, index) {
                                    col.SortOrder = index + 1;
                                });

                                $scope.$broadcast('tbGrid_OnColumnSorted');

                                $scope.retrieveData();
                            };

                            $scope.selectedRows = function() {
                                var rows = localStorageService.get($scope.name + "_rows");
                                if (rows === null || rows === "") {
                                    rows = [];
                                }

                                return rows;
                            };

                            $scope.clearSelection = function() {
                                angular.forEach($scope.rows, function(value) {
                                    value.$selected = false;
                                });

                                localStorageService.set($scope.name + "_rows", []);
                            };

                            $scope.isEmptySelection = function() {
                                return $scope.selectedRows().length === 0;
                            };

                            $scope.selectFromSession = function(row) {
                                row.$selected = $scope.selectedRows().filter(function(el) {
                                    return el.$key === row.$key;
                                }).length > 0;
                            };

                            $scope.changeSelection = function(row) {
                                if (angular.isUndefined(row)) return;

                                row.$selected = !row.$selected;

                                var rows = $scope.selectedRows();

                                if (row.$selected) {
                                    rows.push({ $key: row.$key });
                                } else {
                                    rows = rows.filter(function(el) {
                                        return el.$key !== row.$key;
                                    });
                                }

                                localStorageService.set($scope.name + "_rows", rows);
                            };

                            $scope.getFullDataSource = function(callback) {
                                $scope.dataService.retrieveDataAsync({
                                    serverUrl: $scope.serverUrl,
                                    requestMethod: $scope.requestMethod,
                                    timeout: $scope.requestTimeout,
                                    requireAuthentication: $scope.requireAuthentication,
                                    data: {
                                        Count: $scope.requestCounter,
                                        Columns: $scope.columns,
                                        Skip: 0,
                                        Take: -1,
                                        Search: {
                                            Text: '',
                                            Operator: 'None'
                                        }
                                    }
                                }).promise.then(
                                    function(data) {
                                        callback(data.Payload);
                                    }, function(error) {
                                        $scope.$emit('tbGrid_OnConnectionError', error);
                                    }).then(function() {
                                    $scope.currentRequest = null;
                                });
                            };

                            $scope.visibleColumns = function() {
                                return $scope.columns.filter(function(el) { return el.Visible; }).length;
                            }

                            $scope.$emit('tbGrid_OnGreetParentController', $scope);
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbGridTable
         * @restrict E
         *
         * @description
         * The `tbGridTable` directive generate the HTML table where all the columns and rowsets can be defined. 
         * `tbGridTable` requires a parent `tbGrid`.
         * 
         * This directive is replace by a `table` HTML element.
         * 
         * @scope
         */
        .directive('tbGridTable', [
            function() {
                return {
                    require: '^tbGrid',
                    template: '<table ng-transclude class="table tubular-grid-table"></table>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                            $scope.$component = $scope.$parent.$parent;
                            $scope.tubularDirective = 'tubular-grid-table';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumnDefinitions
         * @restrict E
         *
         * @description
         * The `tbColumnDefinitions` directive is a parent node to fill with `tbColumn`.
         * 
         * This directive is replace by a `thead` HTML element.
         * 
         * @scope
         */
        .directive('tbColumnDefinitions', [
            function() {

                return {
                    require: '^tbGridTable',
                    template: '<thead><tr ng-transclude></tr></thead>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column-definitions';
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                scope.$component.hasColumnsDefinitions = true;
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumn
         * @restrict E
         *
         * @description
         * The `tbColumn` directive creates a column in the grid's model. 
         * All the attributes are used to generate a `ColumnModel`.
         * 
         * This directive is replace by a `th` HTML element.
         * 
         * @scope
         * 
         * @param {string} name Set the column name.
         * @param {string} label Set the column label, if empty column's name is used.
         * @param {boolean} sortable Set if column is sortable.
         * @param {number} sortOrder Set the sorting order, -1 if you don't want to set one.
         * @param {string} sortDirection Set the sorting direction, empty for none and valid values: Ascending and Descending.
         * @param {boolean} isKey Set if column is Model's key.
         * @param {boolean} searchable Set if column is searchable.
         * @param {boolean} visible Set if column is visible.
         * @param {string} columnType Set the column data type. Values: string, numeric, date, datetime, or boolean.
         * @param {boolean} isGrouping Define a group key.
         */
        .directive('tbColumn', [
            'tubulargGridColumnModel', function(ColumnModel) {
                return {
                    require: '^tbColumnDefinitions',
                    template: '<th ng-transclude ng-class="{sortable: column.Sortable}" ng-show="column.Visible"></th>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                            $scope.column = { Label: '' };
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column';

                            $scope.sortColumn = function(multiple) {
                                $scope.$component.sortColumn($scope.column.Name, multiple);
                            };
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                lAttrs.label = lAttrs.label || (lAttrs.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');

                                var column = new ColumnModel(lAttrs);
                                scope.$component.addColumn(column);
                                scope.column = column;
                                scope.label = column.Label;
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumnHeader
         * @restrict E
         *
         * @description
         * The `tbColumnHeader` directive creates a column header, and it must be inside a `tbColumn`. 
         * This directive has functionality to sort the column, the `sortable` attribute is declared in the parent element.
         * 
         * This directive is replace by an `a` HTML element.
         * 
         * @scope
         */
        .directive('tbColumnHeader', [
            '$timeout', 'tubularConst', function($timeout, tubularConst) {

                return {
                    require: '^tbColumn',
                    template: '<a title="Click to sort. Press Ctrl to sort by multiple columns" ' +
                        'class="column-header" ng-transclude href="javascript:void(0)" ' +
                        'ng-click="sortColumn($event)"></a>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.sortColumn = function($event) {
                                $scope.$parent.sortColumn($event.ctrlKey);
                            };
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {
                                var refreshIcon = function(icon) {
                                    $(icon).removeClass(tubularConst.upCssClass);
                                    $(icon).removeClass(tubularConst.downCssClass);

                                    var cssClass = "";
                                    if (scope.$parent.column.SortDirection === 'Ascending')
                                        cssClass = tubularConst.upCssClass;

                                    if (scope.$parent.column.SortDirection === 'Descending')
                                        cssClass = tubularConst.downCssClass;

                                    $(icon).addClass(cssClass);
                                };

                                scope.$on('tbGrid_OnColumnSorted', function() {
                                    refreshIcon($('i.sort-icon.fa', lElement.parent()));
                                });

                                $timeout(function() {
                                    $(lElement).after('&nbsp;<i class="sort-icon fa"></i>');

                                    var icon = $('i.sort-icon.fa', lElement.parent());
                                    refreshIcon(icon);
                                }, 0);
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                scope.label = scope.$parent.label;

                                if (scope.$parent.column.Sortable == false) {
                                    var text = scope.label || lElement.text();
                                    lElement.replaceWith('<span>' + text + '</span>');
                                }
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowSet
         * @restrict E
         *
         * @description
         * The `tbRowSet` directive is used to handle any `tbRowTemplate`. You can define multiples `tbRowSet` for grouping.
         * 
         * This directive is replace by an `tbody` HTML element.
         * 
         * @scope
         */
        .directive('tbRowSet', [
            function() {

                return {
                    require: '^tbGrid',
                    template: '<tbody ng-transclude></tbody>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-row-set';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowTemplate
         * @restrict E
         *
         * @description
         * The `tbRowTemplate` directive should be use with a `ngRepeat` to iterate all the rows or grouped rows in a rowset.
         * 
         * This directive is replace by an `tr` HTML element.
         * 
         * @scope
         * 
         * @param {object} rowModel Set the current row, if you are using a ngRepeat you must to use the current element variable here.
         * @param {bool} selectable Flag the rowset to allow user to select rows.
         */
        .directive('tbRowTemplate', [
            function() {

                return {
                    require: '^tbRowSet',
                    template: '<tr ng-transclude' +
                        ' ng-class="{\'info\': selectableBool && rowModel.$selected}"' +
                        ' ng-click="changeSelection(rowModel)"></tr>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        model: '=rowModel',
                        selectable: '@'
                    },
                    controller: [
                        '$scope', function ($scope) {
                            $scope.tubularDirective = 'tubular-rowset';
                            $scope.fields = [];
                            $scope.hasFieldsDefinitions = false;
                            $scope.selectableBool = $scope.selectable !== "false";
                            $scope.$component = $scope.$parent.$parent.$parent.$component;

                            $scope.$watch('hasFieldsDefinitions', function (newVal) {
                                if (newVal !== true || angular.isUndefined($scope.model)) return;

                                $scope.bindFields();
                            });

                            $scope.bindFields = function () {
                                angular.forEach($scope.fields, function (field) {
                                    field.bindScope();
                                });
                            }

                            if ($scope.selectableBool && angular.isUndefined($scope.rowModel) === false) {
                                $scope.$component.selectFromSession($scope.rowModel);
                            }

                            $scope.changeSelection = function(rowModel) {
                                if ($scope.selectableBool == false) return;
                                $scope.$component.changeSelection(rowModel);
                            };
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function (scope, lElement, lAttrs, lController, lTransclude) { },
                            post: function (scope, lElement, lAttrs, lController, lTransclude) {
                                scope.hasFieldsDefinitions = true;
                            }
                        };
                    }
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbCellTemplate
         * @restrict E
         *
         * @description
         * The `tbCellTemplate` directive represents the final table element, a cell, where it can 
         * hold an inline editor or a plain AngularJS expression related to the current element in the `ngRepeat`.
         * 
         * This directive is replace by an `td` HTML element.
         * 
         * @scope
         * 
         * @param {string} columnName Setting the related column, by passing the name, the cell can share attributes (like visibiility) with the column.
         */
        .directive('tbCellTemplate', [
            function() {

                return {
                    require: '^tbRowTemplate',
                    template: '<td ng-transclude ng-show="column.Visible" data-label="{{column.Label}}"></td>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        columnName: '@?'
                    },
                    controller: [
                        '$scope', function($scope) {
                            $scope.column = { Visible: true };
                            $scope.columnName = $scope.columnName || null;
                            $scope.$component = $scope.$parent.$parent.$component;

                            if ($scope.columnName != null) {
                                var columnModel = $scope.$component.columns
                                    .filter(function(el) { return el.Name === $scope.columnName; });

                                if (columnModel.length > 0) {
                                    $scope.column = columnModel[0];
                                }
                            }
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbEmptyGrid
         * @restrict E
         *
         * @description
         * The `tbEmptyGrid` directive is a helper to show a "No records found" message when the grid has not rows.
         * 
         * This class must be inside a `tbRowSet` directive.
         */
        .directive('tbEmptyGrid', [
            function() {

                return {
                    require: '^tbGrid',
                    template: '<tr ngTransclude ng-show="$parent.$component.isEmpty">' +
                        '<td class="bg-warning" colspan="{{$parent.$component.columns.length + 1}}">' +
                        '<b>No records found</b>' +
                        '</td>' +
                        '</tr>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowGroupHeader
         * @restrict E
         *
         * @description
         * The `tbRowGroupHeader` directive is a cell template to show grouping information.
         * 
         * This class must be inside a `tbRowSet` directive.
         * 
         * @scope
         */
        .directive('tbRowGroupHeader', [
            function() {

                return {
                    require: '^tbRowTemplate',
                    template: '<td class="row-group" colspan="{{$parent.$component.visibleColumns()}}">' +
                        '<ng-transclude></ng-transclude>' +
                        '</td>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {}
                };
            }
        ]);
})();