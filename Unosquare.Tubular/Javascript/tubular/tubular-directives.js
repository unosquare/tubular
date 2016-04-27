(function (angular) {
    'use strict';

    /**
     * @ngdoc module
     * @name tubular.directives
     * @module tubular.directives
     * 
     * @description 
     * Tubular Directives and Components module.
     * 
     * It depends upon {@link tubular.services} and {@link tubular.models}.
     */
    angular.module('tubular.directives', ['tubular.services', 'tubular.models'])
        /**
         * @ngdoc component
         * @name tbGrid
         * 
         * @description
         * The `tbGrid` directive is the base to create any grid. This is the root node where you should start
         * designing your grid. Don't need to add a `controller`.
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverDeleteUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverSaveMethod Set HTTP Method to save data.
         * @param {int} pageSize Define how many records to show in a page, default 20.
         * @param {function} onBeforeGetData Callback to execute before to get data from service.
         * @param {string} requestMethod Set HTTP Method to get data.
         * @param {string} serviceName Define Data service (name) to retrieve data, defaults `tubularHttp`.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {string} gridName Grid's name, used to store metainfo in localstorage.
         * @param {string} editorMode Define if grid is read-only or it has editors (inline or popup).
         * @param {bool} showLoading Set if an overlay will show when it's loading data, default true.
         * @param {bool} autoRefresh Set if the grid refresh after any insertion or update, default true.
         * @param {bool} savePage Set if the grid autosave current page, default true.
         * @param {bool} savePageSize Set if the grid autosave page size, default true.
         * @param {bool} saveSearch Set if the grid autosave search, default true.
         */
        .component('tbGrid', {
            template: '<div>' +
                '<div class="tubular-overlay" ng-show="$ctrl.showLoading && $ctrl.currentRequest != null">' +
                '<div><div class="fa fa-refresh fa-2x fa-spin"></div></div></div>' +
                '<ng-transclude></ng-transclude>' +
                '</div>',
            transclude: true,
            bindings: {
                serverUrl: '@',
                serverSaveUrl: '@',
                serverDeleteUrl: '@',
                serverSaveMethod: '@',
                pageSize: '=?',
                onBeforeGetData: '=?',
                requestMethod: '@',
                dataServiceName: '@?serviceName',
                requireAuthentication: '@?',
                name: '@?gridName',
                editorMode: '@?',
                showLoading: '=?',
                autoRefresh: '=?',
                savePage: '=?',
                savePageSize: '=?',
                saveSearch: '=?'
            },
            controller: [
                '$scope', 'localStorageService', 'tubularPopupService', 'tubularModel', 'tubularHttp', '$routeParams',
                function($scope, localStorageService, tubularPopupService, TubularModel, tubularHttp, $routeParams) {
                    var $ctrl = this;

                    $ctrl.$onInit = function() {
                        $ctrl.tubularDirective = 'tubular-grid';

                        $ctrl.name = $ctrl.name || 'tbgrid';
                        $ctrl.columns = [];
                        $ctrl.rows = [];

                        $ctrl.savePage = angular.isUndefined($ctrl.savePage) ? true : $ctrl.savePage;
                        $ctrl.currentPage = $ctrl.savePage ? (localStorageService.get($ctrl.name + "_page") || 1) : 1;

                        $ctrl.savePageSize = angular.isUndefined($ctrl.savePageSize) ? true : $ctrl.savePageSize;
                        $ctrl.pageSize = angular.isUndefined($ctrl.pageSize) ? 20 : $ctrl.pageSize;
                        $ctrl.saveSearch = angular.isUndefined($ctrl.saveSearch) ? true : $ctrl.saveSearch;
                        $ctrl.totalPages = 0;
                        $ctrl.totalRecordCount = 0;
                        $ctrl.filteredRecordCount = 0;
                        $ctrl.requestedPage = $ctrl.currentPage;
                        $ctrl.hasColumnsDefinitions = false;
                        $ctrl.requestCounter = 0;
                        $ctrl.requestMethod = $ctrl.requestMethod || 'POST';
                        $ctrl.serverSaveMethod = $ctrl.serverSaveMethod || 'POST';
                        $ctrl.requestTimeout = 15000;
                        $ctrl.currentRequest = null;
                        $ctrl.autoSearch = $routeParams.param || ($ctrl.saveSearch ? (localStorageService.get($ctrl.name + "_search") || '') : '');
                        $ctrl.search = {
                            Text: $ctrl.autoSearch,
                            Operator: $ctrl.autoSearch == '' ? 'None' : 'Auto'
                        };

                        $ctrl.isEmpty = false;
                        $ctrl.tempRow = new TubularModel($scope, $ctrl, {}, $ctrl.dataService);
                        $ctrl.dataService = tubularHttp.getDataService($ctrl.dataServiceName);
                        $ctrl.requireAuthentication = $ctrl.requireAuthentication || true;
                        tubularHttp.setRequireAuthentication($ctrl.requireAuthentication);
                        $ctrl.editorMode = $ctrl.editorMode || 'none';
                        $ctrl.canSaveState = false;
                        $ctrl.groupBy = '';
                        $ctrl.showLoading = angular.isUndefined($ctrl.showLoading) ? true : $ctrl.showLoading;
                        $ctrl.autoRefresh = angular.isUndefined($ctrl.autoRefresh) ? true : $ctrl.autoRefresh;
                        $ctrl.serverDeleteUrl = $ctrl.serverDeleteUrl || $ctrl.serverSaveUrl;

                        // Emit a welcome message
                        $scope.$emit('tbGrid_OnGreetParentController', $ctrl);
                    };

                    $scope.$watch('$ctrl.columns', function() {
                        if ($ctrl.hasColumnsDefinitions === false || $ctrl.canSaveState === false) {
                            return;
                        }

                        localStorageService.set($ctrl.name + "_columns", $ctrl.columns);
                    }, true);

                    $scope.$watch('$ctrl.serverUrl', function(newVal, prevVal) {
                        if ($ctrl.hasColumnsDefinitions === false || $ctrl.currentRequest || newVal === prevVal) {
                            return;
                        }

                        $ctrl.retrieveData();
                    }, true);

                    $scope.$watch('$ctrl.hasColumnsDefinitions', function(newVal) {
                        if (newVal !== true) return;

                        var isGrouping = false;
                        // Check columns
                        angular.forEach($ctrl.columns, function(column) {
                            if (column.IsGrouping) {
                                if (isGrouping) {
                                    throw 'Only one column is allowed to grouping';
                                }

                                isGrouping = true;
                                column.Visible = false;
                                column.Sortable = true;
                                column.SortOrder = 1;
                                $ctrl.groupBy = column.Name;
                            }
                        });

                        angular.forEach($ctrl.columns, function(column) {
                            if ($ctrl.groupBy == column.Name) return;

                            if (column.Sortable && column.SortOrder > 0) {
                                column.SortOrder++;
                            }
                        });

                        $ctrl.retrieveData();
                    });

                    $scope.$watch('$ctrl.pageSize', function() {
                        if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                            if ($ctrl.savePageSize) {
                                localStorageService.set($ctrl.name + "_pageSize", $ctrl.pageSize);
                            }
                            $ctrl.retrieveData();
                        }
                    });

                    $scope.$watch('$ctrl.requestedPage', function() {
                        // TODO: we still need to inter-lock failed, initial and paged requests
                        if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                            $ctrl.retrieveData();
                        }
                    });

                    $ctrl.saveSearch = function() {
                        if ($ctrl.saveSearch) {
                            if ($ctrl.search.Text === '') {
                                localStorageService.remove($ctrl.name + "_search");
                            } else {
                                localStorageService.set($ctrl.name + "_search", $ctrl.search.Text);
                            }
                        }
                    };

                    $ctrl.addColumn = function(item) {
                        if (item.Name == null) {
                            return;
                        }

                        if ($ctrl.hasColumnsDefinitions !== false) {
                            throw 'Cannot define more columns. Column definitions have been sealed';
                        }

                        $ctrl.columns.push(item);
                    };

                    $ctrl.newRow = function(template, popup, size) {
                        $ctrl.tempRow = new TubularModel($scope, $ctrl, {}, $ctrl.dataService);
                        $ctrl.tempRow.$isNew = true;
                        $ctrl.tempRow.$isEditing = true;
                        $ctrl.tempRow.$component = $ctrl;

                        if (angular.isDefined(template) && angular.isDefined(popup) && popup) {
                            tubularPopupService.openDialog(template, $ctrl.tempRow, $ctrl, size);
                        }
                    };

                    $ctrl.deleteRow = function(row) {
                        var urlparts = $ctrl.serverDeleteUrl.split('?');
                        var url = urlparts[0] + "/" + row.$key;

                        if (urlparts.length > 1) {
                            url += '?' + urlparts[1];
                        }

                        var request = {
                            serverUrl: url,
                            requestMethod: 'DELETE',
                            timeout: $ctrl.requestTimeout,
                            requireAuthentication: $ctrl.requireAuthentication
                        };

                        $ctrl.currentRequest = $ctrl.dataService.retrieveDataAsync(request);

                        $ctrl.currentRequest.promise.then(
                            function(data) {
                                row.$hasChanges = false;
                                $scope.$emit('tbGrid_OnRemove', data);
                            }, function(error) {
                                $scope.$emit('tbGrid_OnConnectionError', error);
                            }).then(function() {
                            $ctrl.currentRequest = null;
                            $ctrl.retrieveData();
                        });
                    };

                    $ctrl.verifyColumns = function() {
                        var columns = localStorageService.get($ctrl.name + "_columns");
                        if (columns == null || columns === "") {
                            // Nothing in settings, saving initial state
                            localStorageService.set($ctrl.name + "_columns", $ctrl.columns);
                            return;
                        }

                        for (var index in columns) {
                            if (columns.hasOwnProperty(index)) {
                                var columnName = columns[index].Name;
                                var filtered = $ctrl.columns.filter(function(el) { return el.Name == columnName; });

                                if (filtered.length === 0) {
                                    continue;
                                }

                                var current = filtered[0];
                                // Updates visibility by now
                                current.Visible = columns[index].Visible;

                                // Update sorting
                                if ($ctrl.requestCounter < 1) {
                                    current.SortOrder = columns[index].SortOrder;
                                    current.SortDirection = columns[index].SortDirection;
                                }

                                // Update Filters
                                if (current.Filter != null && current.Filter.Text != null) {
                                    continue;
                                }

                                if (columns[index].Filter != null && columns[index].Filter.Text != null && columns[index].Filter.Operator != 'None') {
                                    current.Filter = columns[index].Filter;
                                }
                            }
                        }
                    };

                    $ctrl.retrieveData = function() {
                        // If the ServerUrl is empty skip data load
                        if ($ctrl.serverUrl == '') {
                            return;
                        }

                        $ctrl.canSaveState = true;
                        $ctrl.verifyColumns();

                        if ($ctrl.savePageSize) {
                            $ctrl.pageSize = (localStorageService.get($ctrl.name + "_pageSize") || $ctrl.pageSize);
                        }

                        if ($ctrl.pageSize < 10) $ctrl.pageSize = 20; // default

                        var skip = ($ctrl.requestedPage - 1) * $ctrl.pageSize;

                        if (skip < 0) skip = 0;

                        var request = {
                            serverUrl: $ctrl.serverUrl,
                            requestMethod: $ctrl.requestMethod || 'POST',
                            timeout: $ctrl.requestTimeout,
                            requireAuthentication: $ctrl.requireAuthentication,
                            data: {
                                Count: $ctrl.requestCounter,
                                Columns: $ctrl.columns,
                                Skip: skip,
                                Take: parseInt($ctrl.pageSize),
                                Search: $ctrl.search,
                                TimezoneOffset: new Date().getTimezoneOffset()
                            }
                        };

                        if ($ctrl.currentRequest !== null) {
                            // This message is annoying when you connect errors to toastr
                            //$ctrl.currentRequest.cancel('tubularGrid(' + $ctrl.$id + '): new request coming.');
                            return;
                        }

                        if (angular.isUndefined($ctrl.onBeforeGetData) === false) {
                            $ctrl.onBeforeGetData();
                        }

                        $scope.$emit('tbGrid_OnBeforeRequest', request, $ctrl);

                        $ctrl.currentRequest = $ctrl.dataService.retrieveDataAsync(request);

                        $ctrl.currentRequest.promise.then(
                            function(data) {
                                $ctrl.requestCounter += 1;

                                if (angular.isUndefined(data) || data == null) {
                                    $scope.$emit('tbGrid_OnConnectionError', {
                                        statusText: "Data is empty",
                                        status: 0
                                    });

                                    return;
                                }

                                $ctrl.dataSource = data;

                                $ctrl.rows = data.Payload.map(function(el) {
                                    var model = new TubularModel($scope, $ctrl, el, $ctrl.dataService);
                                    model.$component = $ctrl;

                                    model.editPopup = function(template, size) {
                                        tubularPopupService.openDialog(template, model, $ctrl, size);
                                    };

                                    return model;
                                });

                                $scope.$emit('tbGrid_OnDataLoaded', $ctrl);

                                $ctrl.aggregationFunctions = data.AggregationPayload;
                                $ctrl.currentPage = data.CurrentPage;
                                $ctrl.totalPages = data.TotalPages;
                                $ctrl.totalRecordCount = data.TotalRecordCount;
                                $ctrl.filteredRecordCount = data.FilteredRecordCount;
                                $ctrl.isEmpty = $ctrl.filteredRecordCount === 0;

                                if ($ctrl.savePage) {
                                    localStorageService.set($ctrl.name + "_page", $ctrl.currentPage);
                                }
                            }, function(error) {
                                $ctrl.requestedPage = $ctrl.currentPage;
                                $scope.$emit('tbGrid_OnConnectionError', error);
                            }).then(function() {
                            $ctrl.currentRequest = null;
                        });
                    };

                    $ctrl.sortColumn = function(columnName, multiple) {
                        var filterColumn = $ctrl.columns.filter(function(el) {
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
                            angular.forEach($ctrl.columns.filter(function(col) { return col.Name !== columnName; }), function(col) {
                                col.SortOrder = -1;
                                col.SortDirection = 'None';
                            });
                        }

                        // take the columns that actually need to be sorted in order to reindex them
                        var currentlySortedColumns = $ctrl.columns.filter(function(col) {
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

                        $ctrl.retrieveData();
                    };

                    $ctrl.selectedRows = function() {
                        var rows = localStorageService.get($ctrl.name + "_rows");
                        if (rows == null || rows === "") {
                            rows = [];
                        }

                        return rows;
                    };

                    $ctrl.clearSelection = function() {
                        angular.forEach($ctrl.rows, function(value) {
                            value.$selected = false;
                        });

                        localStorageService.set($ctrl.name + "_rows", []);
                    };

                    $ctrl.isEmptySelection = function() {
                        return $ctrl.selectedRows().length === 0;
                    };

                    $ctrl.selectFromSession = function(row) {
                        row.$selected = $ctrl.selectedRows().filter(function(el) {
                            return el.$key === row.$key;
                        }).length > 0;
                    };

                    $ctrl.changeSelection = function(row) {
                        if (angular.isUndefined(row)) return;

                        row.$selected = !row.$selected;

                        var rows = $ctrl.selectedRows();

                        if (row.$selected) {
                            rows.push({ $key: row.$key });
                        } else {
                            rows = rows.filter(function(el) {
                                return el.$key !== row.$key;
                            });
                        }

                        localStorageService.set($ctrl.name + "_rows", rows);
                    };

                    $ctrl.getFullDataSource = function(callback) {
                        $ctrl.dataService.retrieveDataAsync({
                            serverUrl: $ctrl.serverUrl,
                            requestMethod: $ctrl.requestMethod || 'POST',
                            timeout: $ctrl.requestTimeout,
                            requireAuthentication: $ctrl.requireAuthentication,
                            data: {
                                Count: $ctrl.requestCounter,
                                Columns: $ctrl.columns,
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
                            $ctrl.currentRequest = null;
                        });
                    };

                    $ctrl.visibleColumns = function() {
                        return $ctrl.columns.filter(function(el) { return el.Visible; }).length;
                    };
                }
            ]
        })
        /**
         * @ngdoc directive
         * @name tbGridTable
         * @module tubular.directives
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
                            $scope.$component = $scope.$parent.$parent.$ctrl;
                            $scope.tubularDirective = 'tubular-grid-table';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbColumnDefinitions
         * @module tubular.directives
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
                    compile: function compile() {
                        return {
                            post: function(scope) {
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
         * @module tubular.directives
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
            function () {
                return {
                    require: '^tbColumnDefinitions',
                    template: '<th ng-transclude ng-class="{sortable: column.Sortable}" ng-show="column.Visible"></th>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        visible: '=',
                        label: '@',
                        name: '@',
                        sortable: '=?',
                        sortOrder: '=?',
                        isKey: '=?',
                        searchable: '=?',
                        columnType: '@?',
                        isGrouping: '=?',
                        aggregate: '@?',
                        metaAggregate: '@?',
                        sortDirection: '@?'
                    },
                    controller: [
                        '$scope', '$filter', function ($scope, $filter) {
                            $scope.column = { Label: '' };
                            $scope.$component = $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-column';
                            $scope.label = angular.isDefined($scope.label) ? $scope.label : ($scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');

                            $scope.sortColumn = function (multiple) {
                                $scope.$component.sortColumn($scope.column.Name, multiple);
                            };

                            $scope.$watch("visible", function (val) {
                                if (angular.isDefined(val)) {
                                    $scope.column.Visible = val;
                                }
                            });

                            $scope.$watch('label', function () {
                                $scope.column.Label = $scope.label;
                                // this broadcast here is used for backwards compatibility with tbColumnHeader requiring a scope.label value on its own
                                $scope.$broadcast('tbColumn_LabelChanged', $scope.label);
                            })

                            var column = new function () {
                                this.Name = $scope.name || null;
                                this.Label = $scope.label || null;
                                this.Sortable = $scope.sortable;
                                this.SortOrder = parseInt($scope.sortOrder) || -1;
                                this.SortDirection = function () {
                                    if (angular.isUndefined($scope.sortDirection)) {
                                        return 'None';
                                    }

                                    if ($scope.sortDirection.toLowerCase().indexOf('asc') === 0) {
                                        return 'Ascending';
                                    }

                                    if ($scope.sortDirection.toLowerCase().indexOf('desc') === 0) {
                                        return 'Descending';
                                    }

                                    return 'None';
                                }();
                                this.IsKey = $scope.isKey === "true";
                                this.Searchable = $scope.searchable === "true";
                                this.Visible = $scope.visible === "false" ? false : true;
                                this.Filter = null;
                                this.DataType = $scope.columnType || "string";
                                this.IsGrouping = $scope.isGrouping === "true";
                                this.Aggregate = $scope.aggregate || "none";
                                this.MetaAggregate = $scope.metaAggregate || "none";

                                this.FilterOperators = {
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
                                    'date': {
                                        'None': $filter('translate')('OP_NONE'),
                                        'Equals': $filter('translate')('OP_EQUALS'),
                                        'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                                        'Between': $filter('translate')('OP_BETWEEN'),
                                        'Gte': '>=',
                                        'Gt': '>',
                                        'Lte': '<=',
                                        'Lt': '<'
                                    },
                                    'datetime': {
                                        'None': $filter('translate')('OP_NONE'),
                                        'Equals': $filter('translate')('OP_EQUALS'),
                                        'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                                        'Between': $filter('translate')('OP_BETWEEN'),
                                        'Gte': '>=',
                                        'Gt': '>',
                                        'Lte': '<=',
                                        'Lt': '<'
                                    },
                                    'datetimeutc': {
                                        'None': $filter('translate')('OP_NONE'),
                                        'Equals': $filter('translate')('OP_EQUALS'),
                                        'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                                        'Between': $filter('translate')('OP_BETWEEN'),
                                        'Gte': '>=',
                                        'Gt': '>',
                                        'Lte': '<=',
                                        'Lt': '<'
                                    },
                                    'boolean': {
                                        'None': $filter('translate')('OP_NONE'),
                                        'Equals': $filter('translate')('OP_EQUALS'),
                                        'NotEquals': $filter('translate')('OP_NOTEQUALS')
                                    }
                                };
                            };
                            
                            $scope.$component.addColumn(column);
                            $scope.column = column;
                            $scope.label = column.Label;
                        }
                    ]
                };
            }])
        /**
         * @ngdoc directive
         * @module tubular.directives
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
            function() {
                return {
                    require: '^tbColumn',
                    template: '<span><a title="Click to sort. Press Ctrl to sort by multiple columns" class="column-header" href ng-click="sortColumn($event)">' +
                        '<span class="column-header-default">{{ $parent.column.Label }}</span>' +
                        '<span ng-transclude></span></a> ' +
                        '<i class="fa sort-icon" ng-class="' + "{'fa-long-arrow-up': $parent.column.SortDirection == 'Ascending', 'fa-long-arrow-down': $parent.column.SortDirection == 'Descending'}" + '">&nbsp;</i>' +
                        '</span>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.sortColumn = function($event) {
                                $scope.$parent.sortColumn($event.ctrlKey);
                            };
                            // this listener here is used for backwards compatibility with tbColumnHeader requiring a scope.label value on its own
                            $scope.$on('tbColumn_LabelChanged', function($event, value) {
                                $scope.label = value;
                            });
                        }
                    ],
                    link: function($scope, $element) {
                        if ($element.find('[ng-transclude] *').length > 0) {
                            $element.find('span.column-header-default').remove();
                        }

                        if (!$scope.$parent.column.Sortable) {
                            $element.find('a').replaceWith($element.find('a').children());
                        }
                    }
                }
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowSet
         * @module tubular.directives
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
         * @name tbFootSet
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbFootSet` directive is to handle footer.
         * 
         * This directive is replace by an `tfoot` HTML element.
         * 
         * @scope
         */
        .directive('tbFootSet', [
            function() {

                return {
                    require: '^tbGrid',
                    template: '<tfoot ng-transclude></tfoot>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            $scope.$component = $scope.$parent.$component || $scope.$parent.$parent.$component;
                            $scope.tubularDirective = 'tubular-foot-set';
                        }
                    ]
                };
            }
        ])
        /**
         * @ngdoc directive
         * @name tbRowTemplate
         * @module tubular.directives
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
                    template: '<tr ng-transclude' +
                        ' ng-class="{\'info\': selectableBool && model.$selected}"' +
                        ' ng-click="changeSelection(model)"></tr>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        model: '=rowModel',
                        selectable: '@'
                    },
                    controller: [
                        '$scope', function($scope) {
                            $scope.tubularDirective = 'tubular-rowset';
                            $scope.fields = [];
                            $scope.hasFieldsDefinitions = false;
                            $scope.selectableBool = $scope.selectable == "true";
                            $scope.$component = $scope.$parent.$parent.$parent.$component;

                            $scope.$watch('hasFieldsDefinitions', function(newVal) {
                                if (newVal !== true || angular.isUndefined($scope.model)) {
                                    return;
                                }

                                $scope.bindFields();
                            });

                            $scope.bindFields = function() {
                                angular.forEach($scope.fields, function(field) {
                                    field.bindScope();
                                });
                            };

                            if ($scope.selectableBool && angular.isDefined($scope.model)) {
                                $scope.$component.selectFromSession($scope.model);
                            }

                            $scope.changeSelection = function(rowModel) {
                                if (!$scope.selectableBool) {
                                    return;
                                }

                                $scope.$component.changeSelection(rowModel);
                            };
                        }
                    ],
                    compile: function compile() {
                        return {
                            post: function(scope) {
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
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbCellTemplate` directive represents the final table element, a cell, where it can 
         * hold an in-line editor or a plain AngularJS expression related to the current element in the `ngRepeat`.
         * 
         * This directive is replace by an `td` HTML element.
         * 
         * @scope
         * 
         * @param {string} columnName Setting the related column, by passing the name, the cell can share attributes (like visibility) with the column.
         */
        .directive('tbCellTemplate', [
            function () {

                return {
                    require: '^tbRowTemplate',
                    template: '<td ng-transclude ng-show="column.Visible" data-label="{{::column.Label}}"></td>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        columnName: '@?'
                    },
                    controller: [
                        '$scope', function ($scope) {
                            $scope.column = { Visible: true };
                            $scope.columnName = $scope.columnName || null;
                            $scope.$component = $scope.$parent.$parent.$component;

                            $scope.getFormScope = function () {
                                // TODO: Implement a form in inline editors
                                return null;
                            };

                            if ($scope.columnName != null) {
                                var columnModel = $scope.$component.columns
                                    .filter(function (el) { return el.Name === $scope.columnName; });

                                if (columnModel.length > 0) {
                                    $scope.column = columnModel[0];
                                }
                            }
                        }
                    ]
                };
            }
        ]);
})(window.angular);