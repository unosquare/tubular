﻿(angular => {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbGridController',
        [
            '$scope',
            'tubularPopupService',
            'tubularModel',
            'tubularHttp',
            '$routeParams',
            'tubularConfig',
            '$window',
            function (
                $scope,
                tubularPopupService,
                TubularModel,
                tubularHttp,
                $routeParams,
                tubularConfig,
                $window) {
                var $ctrl = this;
                var prefix = tubularConfig.localStorage.prefix();
                var storage = $window.localStorage;

                $ctrl.$onInit = () => {
                    $ctrl.tubularDirective = 'tubular-grid';

                    $ctrl.name = $ctrl.name || 'tbgrid';
                    $ctrl.columns = [];
                    $ctrl.rows = [];

                    $ctrl.savePage = angular.isUndefined($ctrl.savePage) ? true : $ctrl.savePage;
                    $ctrl.currentPage = $ctrl.savePage ? (parseInt(storage.getItem(prefix + $ctrl.name + '_page')) || 1) : 1;

                    $ctrl.savePageSize = angular.isUndefined($ctrl.savePageSize) ? true : $ctrl.savePageSize;
                    $ctrl.pageSize = $ctrl.pageSize || 20;
                    $ctrl.saveSearchText = angular.isUndefined($ctrl.saveSearchText) ? true : $ctrl.saveSearchText;
                    $ctrl.totalPages = 0;
                    $ctrl.totalRecordCount = 0;
                    $ctrl.filteredRecordCount = 0;
                    $ctrl.requestedPage = $ctrl.currentPage;
                    $ctrl.hasColumnsDefinitions = false;
                    $ctrl.requestCounter = 0;
                    $ctrl.requestMethod = $ctrl.requestMethod || 'POST';
                    $ctrl.serverSaveMethod = $ctrl.serverSaveMethod || 'POST';
                    $ctrl.requestTimeout = 20000;
                    $ctrl.currentRequest = null;
                    $ctrl.autoSearch = $routeParams.param ||
                        ($ctrl.saveSearchText ? (storage.getItem(prefix + $ctrl.name + '_search') || '') : '');
                    $ctrl.search = {
                        Text: $ctrl.autoSearch,
                        Operator: $ctrl.autoSearch === '' ? 'None' : 'Auto'
                    };

                    $ctrl.isEmpty = false;
                    $ctrl.tempRow = new TubularModel($scope, $ctrl, {});
                    $ctrl.requireAuthentication = $ctrl.requireAuthentication ? ($ctrl.requireAuthentication === 'true') : true;
                    $ctrl.editorMode = $ctrl.editorMode || 'none';
                    $ctrl.canSaveState = false;
                    $ctrl.showLoading = angular.isUndefined($ctrl.showLoading) ? true : $ctrl.showLoading;
                    $ctrl.autoRefresh = angular.isUndefined($ctrl.autoRefresh) ? true : $ctrl.autoRefresh;
                    $ctrl.serverDeleteUrl = $ctrl.serverDeleteUrl || $ctrl.serverSaveUrl;

                    // Emit a welcome message
                    $scope.$emit('tbGrid_OnGreetParentController', $ctrl);
                };

                $scope.columnWatcher = () => {
                    if ($ctrl.hasColumnsDefinitions === false || $ctrl.canSaveState === false) {
                        return;
                    }

                    storage.setItem(prefix + $ctrl.name + '_columns', angular.toJson($ctrl.columns));
                };

                $scope.$watch('$ctrl.columns', $scope.columnWatcher, true);

                $scope.serverUrlWatcher = (newVal, prevVal) => {
                    if ($ctrl.hasColumnsDefinitions === false || $ctrl.currentRequest || newVal === prevVal) {
                        return;
                    }

                    $ctrl.retrieveData();
                };

                $scope.$watch('$ctrl.serverUrl', $scope.serverUrlWatcher);

                $scope.hasColumnsDefinitionsWatcher = newVal => {
                    if (newVal !== true) {
                        return;
                    }

                    $ctrl.retrieveData();
                };

                $scope.$watch('$ctrl.hasColumnsDefinitions', $scope.hasColumnsDefinitionsWatcher);

                $scope.pageSizeWatcher =  () => {
                    if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                        if ($ctrl.savePageSize) {
                            storage.setItem(prefix + $ctrl.name + '_pageSize', $ctrl.pageSize);
                        }

                        $ctrl.retrieveData();
                    }
                };

                $scope.$watch('$ctrl.pageSize', $scope.pageSizeWatcher);

                $scope.requestedPageWatcher = () => {
                    if ($ctrl.hasColumnsDefinitions && $ctrl.requestCounter > 0) {
                        $ctrl.retrieveData();
                    }
                };

                $scope.$watch('$ctrl.requestedPage', $scope.requestedPageWatcher);

                $ctrl.saveSearch = () => {
                    if (!$ctrl.saveSearchText) {
                        return;
                    }

                    if ($ctrl.search.Text === '') {
                        storage.removeItem(prefix + $ctrl.name + '_search');
                    } else {
                        storage.setItem(prefix + $ctrl.name + '_search', $ctrl.search.Text);
                    }
                };

                $ctrl.addColumn = item => {
                    if (item.Name == null){
                        return;
                    } 

                    if ($ctrl.hasColumnsDefinitions !== false) {
                        throw 'Cannot define more columns. Column definitions have been sealed';
                    }

                    $ctrl.columns.push(item);
                };

                $ctrl.newRow = (template, popup, size, data) => {
                    $ctrl.tempRow = new TubularModel($scope, $ctrl, data || {});
                    $ctrl.tempRow.$isNew = true;
                    $ctrl.tempRow.$isEditing = true;
                    $ctrl.tempRow.$component = $ctrl;

                    if (angular.isDefined(template) && angular.isDefined(popup) && popup) {
                        tubularPopupService.openDialog(template, $ctrl.tempRow, $ctrl, size);
                    }
                };

                $ctrl.deleteRow = row => {
                    var urlparts = $ctrl.serverDeleteUrl.split('?');
                    var url = urlparts[0] + '/' + row.$key;

                    if (urlparts.length > 1) {
                        url += '?' + urlparts[1];
                    }

                    $ctrl.currentRequest = tubularHttp.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'DELETE',
                        timeout: $ctrl.requestTimeout,
                        requireAuthentication: $ctrl.requireAuthentication
                    });

                    $ctrl.currentRequest
                        .then(data => {
                            row.$hasChanges = false;
                            $scope.$emit('tbGrid_OnRemove', data);
                            }, error => $scope.$emit('tbGrid_OnConnectionError', error))
                        .then(() => {
                        $ctrl.currentRequest = null;
                        $ctrl.retrieveData();
                    });
                };

                $ctrl.saveRow = (row, forceUpdate) => {
                        if (!$ctrl.serverSaveUrl) {
                            throw 'Define a Save URL.';
                        }

                        if (!forceUpdate && !row.$isNew && !row.$hasChanges) {
                            return null;
                        }

                        row.$isLoading = true;

                        $ctrl.currentRequest = tubularHttp.saveDataAsync(row, {
                            serverUrl: $ctrl.serverSaveUrl,
                            requestMethod: row.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT'
                        });

                        $ctrl.currentRequest.then(data => {
                            $scope.$emit('tbForm_OnSuccessfulSave', data);
                            row.$isLoading = false;
                            $ctrl.retrieveData();
                            $ctrl.currentRequest = null;

                            return data;
                        }, error => {
                            $scope.$emit('tbForm_OnConnectionError', error);
                            row.$isLoading = false;
                            $ctrl.currentRequest = null;

                            return error;
                        });

                        return $ctrl.currentRequest;
                };

                $ctrl.verifyColumns = () => {
                    var columns = angular.fromJson(storage.getItem(prefix + $ctrl.name + '_columns'));
                    if (columns == null || columns === '') {
                        // Nothing in settings, saving initial state
                        storage.setItem(prefix + $ctrl.name + '_columns', angular.toJson($ctrl.columns));
                        return;
                    }

                    angular.forEach(columns, column => {
                            var filtered = $ctrl.columns.filter(el => el.Name === column.Name);

                            if (filtered.length === 0) {
                                return;
                            }

                            var current = filtered[0];
                            // Updates visibility by now
                            current.Visible = column.Visible;

                            // Update sorting
                            if ($ctrl.requestCounter < 1) {
                                current.SortOrder = column.SortOrder;
                                current.SortDirection = column.SortDirection;
                            }

                            // Update Filters
                            if (current.Filter != null && current.Filter.Text != null) {
                                return;
                            }

                            if (column.Filter != null &&
                                column.Filter.Text != null &&
                                column.Filter.Operator !== 'None') {
                                current.Filter = column.Filter;
                            }
                        });
                };

                $ctrl.getRequestObject = skip => {
                    if (skip === -1) {
                        skip = ($ctrl.requestedPage - 1) * $ctrl.pageSize;
                        if (skip < 0) skip = 0;
                    }

                    return {
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
                };

                $ctrl.retrieveData = () => {
                    // If the ServerUrl is empty skip data load
                    if (!$ctrl.serverUrl || $ctrl.currentRequest !== null) {
                        return;
                    }

                    $ctrl.canSaveState = true;
                    $ctrl.verifyColumns();

                    if ($ctrl.savePageSize) {
                        $ctrl.pageSize = (parseInt(storage.getItem(prefix + $ctrl.name + '_pageSize')) || $ctrl.pageSize);
                    }

                    $ctrl.pageSize = $ctrl.pageSize < 10 ? 20 : $ctrl.pageSize; // default

                    var newPages = Math.ceil($ctrl.totalRecordCount / $ctrl.pageSize);
                    if ($ctrl.requestedPage > newPages) $ctrl.requestedPage = newPages;

                    var request = $ctrl.getRequestObject(-1);

                    if (angular.isDefined($ctrl.onBeforeGetData)) {
                        $ctrl.onBeforeGetData();
                    }

                    $scope.$emit('tbGrid_OnBeforeRequest', request, $ctrl);

                    $ctrl.currentRequest = tubularHttp.retrieveDataAsync(request);

                    $ctrl.currentRequest.then($ctrl.processPayload, error => {
                        $ctrl.requestedPage = $ctrl.currentPage;
                        $scope.$emit('tbGrid_OnConnectionError', error);
                    }).then(() => $ctrl.currentRequest = null);
                };

                $ctrl.processPayload = data => {
                    $ctrl.requestCounter += 1;

                    if (angular.isUndefined(data) || data == null) {
                        $scope.$emit('tbGrid_OnConnectionError',
                            {
                                statusText: 'Data is empty',
                                status: 0
                            });

                        return;
                    }

                    $ctrl.dataSource = data;

                    if (!data.Payload) {
                        $scope.$emit('tbGrid_OnConnectionError', `tubularGrid(${$ctrl.$id}): response is invalid.`);
                        return;
                    }

                    $ctrl.rows = data.Payload.map(el => {
                        let model = new TubularModel($scope, $ctrl, el);
                        model.$component = $ctrl;

                        model.editPopup = (template, size) => {
                            tubularPopupService.openDialog(template, new TubularModel($scope, $ctrl, el), $ctrl, size);
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
                        storage.setItem(prefix + $ctrl.name + '_page', $ctrl.currentPage);
                    }
                };

                $ctrl.sortColumn = (columnName, multiple) => {
                    var filterColumn = $ctrl.columns.filter(el => el.Name === columnName);

                    if (filterColumn.length === 0) {
                        return;
                    }

                    var column = filterColumn[0];

                    if (column.Sortable === false) {
                        return;
                    }

                    // need to know if it's currently sorted before we reset stuff
                    var currentSortDirection = column.SortDirection;
                    var toBeSortDirection = currentSortDirection === 'None'
                        ? 'Ascending'
                        : currentSortDirection === 'Ascending' ? 'Descending' : 'None';

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
                        angular.forEach($ctrl.columns.filter(col => col.Name !== columnName),
                            col => {
                                col.SortOrder = -1;
                                col.SortDirection = 'None';
                            });
                    }

                    // take the columns that actually need to be sorted in order to re-index them
                    var currentlySortedColumns = $ctrl.columns.filter(col => col.SortOrder > 0);

                    // re-index the sort order
                    currentlySortedColumns.sort((a, b) => a.SortOrder === b.SortOrder ? 0 : a.SortOrder > b.SortOrder);

                    angular.forEach(currentlySortedColumns, (col, index) => col.SortOrder = index + 1);

                    $scope.$broadcast('tbGrid_OnColumnSorted');
                    $ctrl.retrieveData();
                };

                $ctrl.getFullDataSource = () => {
                    var request = $ctrl.getRequestObject(0);
                    request.data.Take = -1;
                    request.data.Search = {
                        Text: '',
                        Operator: 'None'
                    };

                    return tubularHttp.retrieveDataAsync(request)
                        .then(data => data.Payload, 
                            error => $scope.$emit('tbGrid_OnConnectionError', error))
                        .then(() => $ctrl.currentRequest = null);
                };

                $ctrl.visibleColumns = () => $ctrl.columns.filter(el => el.Visible).length;
            }
        ]);
})(angular);