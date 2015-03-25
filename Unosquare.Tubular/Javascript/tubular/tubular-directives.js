(function() {
    'use strict';

    angular.module('tubular.directives').directive('tubularGrid', [
            'tubularGridService', function(tubularGridService) {
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
                        gridDataService: '=?service'
                    },
                    controller: [
                        '$scope', 'localStorageService', 'tubularGridPopupService', 'tubularModel',
                        function($scope, localStorageService, tubularGridPopupService, TubularModel) {
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
                            $scope.gridDataService = $scope.gridDataService || tubularGridService;

                            $scope.addColumn = function(item) {
                                if (item.Name === null) return;

                                if ($scope.hasColumnsDefinitions !== false)
                                    throw 'Cannot define more columns. Column definitions have been sealed';

                                $scope.columns.push(item);
                                $scope.logMessage('tubular-grid.addColumn()', item.Name);
                            };

                            $scope.logMessage = function(source, message) {
                                console.debug('Source: ' + source + ': ' + message);
                            };

                            $scope.createRow = function() {
                                var request = {
                                    serverUrl: $scope.serverSaveUrl,
                                    requestMethod: $scope.serverSaveMethod,
                                    timeout: $scope.requestTimeout,
                                    data: $scope.tempRow
                                };

                                $scope.currentRequest = $scope.gridDataService.getDataAsync(request);

                                $scope.currentRequest.promise.then(
                                    function(data) {
                                        $scope.$emit('tubularGrid_OnSuccessfulUpdate', data);
                                        $scope.tempRow.$isEditing = false;
                                    }, function(error) {
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                    }).then(function() {
                                        $scope.currentRequest = null;
                                        $scope.retrieveData();
                                    });
                            };

                            $scope.newRow = function() {
                                $scope.tempRow = new TubularModel($scope, {});
                                $scope.tempRow.$isEditing = true;
                            };

                            $scope.deleteRow = function(row) {
                                var request = {
                                    serverUrl: $scope.serverSaveUrl + "/" + row.$key,
                                    requestMethod: 'DELETE',
                                    timeout: $scope.requestTimeout
                                };

                                $scope.currentRequest = $scope.gridDataService.getDataAsync(request);

                                $scope.currentRequest.promise.then(
                                    function(data) {
                                        row.$hasChanges = false;
                                        $scope.$emit('tubularGrid_OnRemove', data);
                                    }, function(error) {
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                    }).then(function() {
                                        $scope.currentRequest = null;
                                        $scope.retrieveData();
                                    });
                            };

                            $scope.updateRow = function(row) {
                                var request = {
                                    serverUrl: $scope.serverSaveUrl,
                                    requestMethod: 'PUT',
                                    timeout: $scope.requestTimeout
                                };

                                var returnValue = true;

                                $scope.currentRequest = $scope.gridDataService.saveDataAsync(row, request);

                                $scope.currentRequest.promise.then(
                                        function(data) {
                                            $scope.$emit('tubularGrid_OnSuccessfulUpdate', data);
                                        }, function(error) {
                                            $scope.$emit('tubularGrid_OnConnectionError', error);
                                            returnValue = false;
                                        })
                                    .then(function() {
                                        $scope.currentRequest = null;
                                    });

                                return returnValue;
                            };

                            $scope.retrieveData = function() {
                                $scope.pageSize = $scope.pageSize || 20;

                                var request = {
                                    serverUrl: $scope.serverUrl,
                                    requestMethod: $scope.requestMethod,
                                    timeout: $scope.requestTimeout,
                                    data: {
                                        Count: $scope.requestCounter,
                                        Columns: $scope.columns,
                                        Skip: ($scope.requestedPage - 1) * $scope.pageSize,
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

                                $scope.$emit('tubularGrid_OnBeforeRequest', request);

                                $scope.currentRequest = $scope.gridDataService.getDataAsync(request);

                                $scope.currentRequest.promise.then(
                                    function(data) {
                                        $scope.requestCounter += 1;
                                        $scope.dataSource = data;

                                        $scope.rows = data.Payload.map(function(el) {
                                            var model = new TubularModel($scope, el);

                                            // I don't know about this, should be in the Model constructor?
                                            model.editPopup = function(template) {
                                                tubularGridPopupService.openDialog(template, model);
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
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                    }).then(function() {
                                        $scope.currentRequest = null;
                                    });
                            };

                            $scope.$watch('hasColumnsDefinitions', function(newVal) {
                                if (newVal !== true) return;
                                $scope.retrieveData();
                            });

                            $scope.$watch('pageSize', function(newVal) {
                                if ($scope.hasColumnsDefinitions && $scope.requestCounter > 0)
                                    $scope.retrieveData();
                            });

                            $scope.$watch('requestedPage', function(newVal) {
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
                                    angular.forEach($scope.columns.filter(function(col) { return col.Name !== columnName }), function(col) {
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

                                $scope.$broadcast('tubularGrid_OnColumnSorted');

                                $scope.retrieveData();
                            };

                            $scope.selectedRows = function() {
                                var rows = localStorageService.get("rows"); // TODO: We need a table identifier
                                if (rows === null || rows === "") {
                                    rows = [];
                                }

                                return rows;
                            };

                            $scope.clearSelection = function() {
                                angular.forEach($scope.rows, function(value) {
                                    value.$selected = false;
                                });

                                localStorageService.set("rows", []);
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

                                localStorageService.set("rows", rows);
                            };

                            $scope.getFullDataSource = function(callback) {
                                $scope.gridDataService.getDataAsync({
                                    serverUrl: $scope.serverUrl,
                                    requestMethod: $scope.requestMethod,
                                    timeout: $scope.requestTimeout,
                                    data: {
                                        Count: $scope.requestCounter,
                                        Columns: $scope.columns,
                                        Skip: 0,
                                        Take: 1000, // TODO: Take more?
                                        Search: {
                                            Argument: '',
                                            Operator: 'None'
                                        }
                                    }
                                }).promise.then(
                                    function(data) {
                                        callback(data.Payload);
                                    }, function(error) {
                                        $scope.$emit('tubularGrid_OnConnectionError', error);
                                    }).then(function() {
                                        $scope.currentRequest = null;
                                    });
                            };

                            $scope.$emit('tubularGrid_OnGreetParentController', $scope);
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {}
                        };
                    }
                };
            }
    ])
        .directive('tubularGridPager', [
            '$timeout', function($timeout) {
                return {
                    require: '^tubularGrid',
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
                                scope.firstButtonClass = lAttrs.firstButtonClass || 'glyphicon glyphicon-fast-backward';
                                scope.prevButtonClass = lAttrs.prevButtonClass || 'glyphicon glyphicon-backward';

                                scope.nextButtonClass = lAttrs.nextButtonClass || 'glyphicon glyphicon-forward';
                                scope.lastButtonClass = lAttrs.lastButtonClass || 'glyphicon glyphicon-fast-forward';

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
        .directive('tubularGridTable', [
            function() {
                return {
                    require: '^tubularGrid',
                    template: '<table ng-transclude></table>',
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
        .directive('tubularColumnDefinitions', [
            function() {

                return {
                    require: '^tubularGridTable',
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
        .directive('tubularColumn', [
            'tubulargGridColumnModel', function(ColumnModel) {
                return {
                    require: '^tubularColumnDefinitions',
                    template: '<th ng-transclude ng-class="{sortable: column.Sortable}"></th>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                            //$scope.$component.logMessage('tubular-grid.table.thead.th', 'ctrl');
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
                                scope.label = lAttrs.label || (lAttrs.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');

                                var column = new ColumnModel(lAttrs);
                                scope.$component.addColumn(column);
                                scope.column = column;
                            },
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {
                            }
                        };
                    }
                };
            }
        ])
        .directive('tubularColumnHeader', [
            '$timeout', 'tubularConst', function($timeout, tubularConst) {

                return {
                    require: '^tubularColumn',
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

                                scope.$on('tubularGrid_OnColumnSorted', function() {
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
        .directive('tubularRowSet', [
            function() {

                return {
                    require: '^tubularGrid',
                    template: '<tbody ng-transclude></tbody>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: false,
                    controller: [
                        '$scope', function($scope) {
                            //$scope.$component.logMessage('tubular-grid.table.tbody', 'ctrl');
                            $scope.$component = $scope.$parent.$component;
                            $scope.tubularDirective = 'tubular-row-set';
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {}
                        };
                    }
                };
            }
        ])
        .directive('tubularRowTemplate', [
            function() {

                return {
                    require: '^tubularRowSet',
                    template: '<tr ng-transclude ng-class="{\'info\': selectableBool && rowModel.$selected}"' +
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
                            $scope.selectableBool = $scope.selectable != "false";
                            $scope.$component = $scope.$parent.$parent.$parent.$component;

                            if ($scope.selectableBool && angular.isUndefined($scope.rowModel) == false) {
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
        .directive('tubularCellTemplate', [
            function() {

                return {
                    require: '^tubularRowTemplate',
                    template: '<td ng-transclude></td>',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: true,
                    controller: [
                        '$scope', function($scope) {
                        }
                    ],
                    compile: function compile(cElement, cAttrs) {
                        return {
                            pre: function(scope, lElement, lAttrs, lController, lTransclude) {},
                            post: function(scope, lElement, lAttrs, lController, lTransclude) {}
                        };
                    }
                };
            }
        ])
        .directive('tubularGridPagerInfo', [
            function() {

                return {
                    require: '^tubularGrid',
                    template: '<div class="pager-info small">Showing {{currentInitial}} ' +
                        'to {{currentTop}} ' +
                        'of {{$component.filteredRecordCount}} records ' +
                        '<span ng-show="filtered">(Filtered from {{$component.totalRecordCount}} total records)</span>' +
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
        .directive('tubularEmptyGrid', [
            function() {

                return {
                    require: '^tubularGrid',
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
        ]);
})();
