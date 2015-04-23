(function() {
    'use strict';

    angular.module('tubular.directives').directive('tbGrid', [
            function() {
                return {
                    template: '<div class="tubular-grid" ng-transclude></div>',
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
                        gridDataService: '=?service',
                        gridDataServiceName: '@?serviceName',
                        requireAuthentication: '@?',
                        name: '@?gridName'
                    },
                    controller: [
                        '$scope', 'localStorageService', 'tubularPopupService', 'tubularModel', 'tubularHttp', 'tubularOData',
                        function ($scope, localStorageService, tubularPopupService, TubularModel, tubularHttp, tubularOData) {
                            // TODO: Add $routeParams to apply filters from URL

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
                            $scope.search = {
                                Argument: '',
                                Operator: 'None'
                            };
                            $scope.isEmpty = false;
                            $scope.tempRow = new TubularModel($scope, {});
                            $scope.gridDataService = $scope.gridDataService || tubularHttp;
                            $scope.requireAuthentication = $scope.requireAuthentication || true;
                            $scope.name = $scope.name || 'tbgrid';
                            $scope.canSaveState = false;
                            $scope.groupBy = '';

                            // Helper to use OData without controller
                            if ($scope.gridDataServiceName === 'odata') {
                                $scope.gridDataService = tubularOData;
                            }

                            $scope.$watch('columns', function(val) {
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

                            $scope.newRow = function() {
                                $scope.tempRow = new TubularModel($scope, {}, $scope.gridDataService);
                                $scope.tempRow.$isNew = true;
                                $scope.tempRow.$isEditing = true;
                            };

                            $scope.deleteRow = function(row) {
                                var request = {
                                    serverUrl: $scope.serverSaveUrl + "/" + row.$key,
                                    requestMethod: 'DELETE',
                                    timeout: $scope.requestTimeout,
                                    requireAuthentication: $scope.requireAuthentication,
                                };

                                $scope.currentRequest = $scope.gridDataService.retrieveDataAsync(request);

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

                                $scope.currentRequest = $scope.gridDataService.retrieveDataAsync(request);

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
                                            var model = new TubularModel($scope, el, $scope.gridDataService);

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
                                $scope.gridDataService.retrieveDataAsync({
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
                                            Argument: '',
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

                            $scope.$emit('tbGrid_OnGreetParentController', $scope);
                        }
                    ]
                };
            }
        ])
        .directive('tbGridPager', [
            '$timeout', function($timeout) {
                return {
                    require: '^tbGrid',
                    template:
                        '<div class="tubular-pager">' +
                            '<pagination ng-disabled="$component.isEmpty" direction-links="true" boundary-links="true" total-items="$component.filteredRecordCount"' +
                            'items-per-page="$component.pageSize" max-size="5" ng-model="pagerPageNumber" ng-change="pagerPageChanged()">' +
                            '</pagination>' +
                            '<div>',
                    restrict: 'E',
                    replace: true,
                    transclude: false,
                    scope: true,
                    terminal: false,
                    controller: [
                        '$scope', '$element', function($scope, $element) {
                            $scope.$component = $scope.$parent.$parent;
                            $scope.tubularDirective = 'tubular-grid-pager';

                            $scope.$component.$watch('currentPage', function(value) {
                                $scope.pagerPageNumber = value;
                            });

                            $scope.pagerPageChanged = function() {
                                $scope.$component.requestedPage = $scope.pagerPageNumber;
                                var allLinks = $element.find('li a');
                                $(allLinks).blur();
                            };
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                                scope.firstButtonClass = lAttrs.firstButtonClass || 'fa fa-fast-backward';
                                scope.prevButtonClass = lAttrs.prevButtonClass || 'fa fa-backward';

                                scope.nextButtonClass = lAttrs.nextButtonClass || 'fa fa-forward';
                                scope.lastButtonClass = lAttrs.lastButtonClass || 'fa fa-fast-forward';

                                $timeout(function() {
                                    var allLinks = lElement.find('li a');

                                    $(allLinks[0]).html('<i class="' + scope.firstButtonClass + '"></i>');
                                    $(allLinks[1]).html('<i class="' + scope.prevButtonClass + '"></i>');

                                    $(allLinks[allLinks.length - 2]).html('<i class="' + scope.nextButtonClass + '"></i>');
                                    $(allLinks[allLinks.length - 1]).html('<i class="' + scope.lastButtonClass + '"></i>');
                                }, 0);

                            }
                        };
                    }
                };
            }
        ])
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
        .directive('tbColumnHeader', [
            '$timeout', 'tubularConst', function($timeout, tubularConst) {

                return {
                    require: '^tbColumn',
                    template: '<a title="Click to sort. Press Ctrl to sort by multiple columns" class="column-header" ng-transclude href="javascript:void(0)" ng-click="sortColumn($event)"></a>',
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
                                    if (scope.$parent.column.SortDirection == 'Ascending')
                                        cssClass = tubularConst.upCssClass;

                                    if (scope.$parent.column.SortDirection == 'Descending')
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
                        rowModel: '=',
                        selectable: '@'
                    },
                    controller: [
                        '$scope', function($scope) {
                            $scope.selectableBool = $scope.selectable !== "false";
                            $scope.$component = $scope.$parent.$parent.$parent.$component;

                            if ($scope.selectableBool && angular.isUndefined($scope.rowModel) === false) {
                                $scope.$component.selectFromSession($scope.rowModel);
                            }

                            $scope.changeSelection = function(rowModel) {
                                if ($scope.selectableBool == false) return;
                                $scope.$component.changeSelection(rowModel);
                            };
                        }
                    ]
                };
            }
        ])
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
        .directive('tbGridPagerInfo', [
            function() {
                return {
                    require: '^tbGrid',
                    template: '<div class="pager-info small">Showing {{currentInitial}} ' +
                        'to {{currentTop}} ' +
                        'of {{$component.filteredRecordCount}} records ' +
                        '<span ng-show="filtered">' +
                        '(Filtered from {{$component.totalRecordCount}} total records)</span>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                            $scope.$component = $scope.$parent.$parent;
                            $scope.fixCurrentTop = function() {
                                $scope.currentTop = $scope.$component.pageSize * $scope.$component.currentPage;
                                $scope.currentInitial = (($scope.$component.currentPage - 1) * $scope.$component.pageSize) + 1;

                                if ($scope.currentTop > $scope.$component.filteredRecordCount) {
                                    $scope.currentTop = $scope.$component.filteredRecordCount;
                                }

                                if ($scope.currentTop < 0) {
                                    $scope.currentTop = 0;
                                }

                                if ($scope.currentInitial < 0) {
                                    $scope.currentInitial = 0;
                                }
                            };

                            $scope.$component.$watch('filteredRecordCount', function() {
                                $scope.filtered = $scope.$component.totalRecordCount != $scope.$component.filteredRecordCount;
                                $scope.fixCurrentTop();
                            });

                            $scope.$component.$watch('currentPage', function() {
                                $scope.fixCurrentTop();
                            });

                            $scope.$component.$watch('pageSize', function() {
                                $scope.fixCurrentTop();
                            });

                            $scope.fixCurrentTop();
                        }
                    ]
                };
            }
        ])
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
        ]).directive('tbRowGroupHeader', [
            function() {

                return {
                    require: '^tbRowTemplate',
                    template: '<td class="row-group" colspan="{{group[0].$count}}"><ng-transclude></ng-transclude></td>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        group: '='
                    }
                };
            }
        ]);
})();
