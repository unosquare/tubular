(angular => {
    'use strict';

    angular.module('tubular.directives')
        .controller('tbGridController',
        [
            '$scope',
            'tubularPopupService',
            'tubularModel',
            '$http',
            'tubularConfig',
            '$window',
            function (
                $scope,
                tubularPopupService,
                TubularModel,
                $http,
                tubularConfig,
                $window) {
                const $ctrl = this;
                const prefix = tubularConfig.localStorage.prefix();
                const storage = $window.localStorage;

                $ctrl.$onInit = () => {
                    $ctrl.tubularDirective = 'tubular-grid';

                    $ctrl.name = $ctrl.name || 'tbgrid';
                    $ctrl.rows = [];
                    $ctrl.columns = [];

                    $ctrl.savePage = angular.isUndefined($ctrl.savePage) ? true : $ctrl.savePage;
                    $ctrl.currentPage = $ctrl.savePage ? (parseInt(storage.getItem(`${prefix + $ctrl.name}_page`)) || 1) : 1;
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
                    $ctrl.currentRequest = null;
                    $ctrl.autoSearch = $ctrl.saveSearchText ? (storage.getItem(`${prefix + $ctrl.name}_search`) || '') : '';
                    $ctrl.search = {
                        Text: $ctrl.autoSearch,
                        Operator: $ctrl.autoSearch === '' ? 'None' : 'Auto'
                    };

                    $ctrl.isEmpty = false;
                    $ctrl.tempRow = new TubularModel($ctrl, {});
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

                    storage.setItem(`${prefix + $ctrl.name  }_columns`, angular.toJson($ctrl.columns));
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
                            storage.setItem(`${prefix + $ctrl.name  }_pageSize`, $ctrl.pageSize);
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
                        storage.removeItem(`${prefix + $ctrl.name  }_search`);
                    } else {
                        storage.setItem(`${prefix + $ctrl.name  }_search`, $ctrl.search.Text);
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
                    $ctrl.tempRow = new TubularModel($ctrl, data || {});
                    $ctrl.tempRow.$isNew = true;
                    $ctrl.tempRow.$isEditing = true;
                    $ctrl.tempRow.$component = $ctrl;

                    if (angular.isDefined(template) && angular.isDefined(popup) && popup) {
                        tubularPopupService.openDialog(template, $ctrl.tempRow, $ctrl, size);
                    }
                };

                $ctrl.deleteRow = row => {
                    const urlparts = $ctrl.serverDeleteUrl.split('?');
                    let url = `${urlparts[0]  }/${  row.$key}`;

                    if (urlparts.length > 1) {
                        url += `?${  urlparts[1]}`;
                    }

                    $ctrl.currentRequest = $http.delete(url, {
                        requireAuthentication: getRequiredAuthentication()
                    })
                    .then(response => $scope.$emit('tbGrid_OnRemove', response.data),
                        error => $scope.$emit('tbGrid_OnConnectionError', error))
                    .then(() => {
                        $ctrl.currentRequest = null;
                        $ctrl.retrieveData();
                    });
                };

                function getRequiredAuthentication() {
                    return $ctrl.requireAuthentication ? ($ctrl.requireAuthentication === 'true') : true;
                }

                function addTimeZoneToUrl(url) {
                    return `${url +
                        (url.indexOf('?') === -1 ? '?' : '&')
                        }timezoneOffset=${
                        new Date().getTimezoneOffset()}`;
                }

                $ctrl.saveRow = (row, forceUpdate) => {
                    if (!$ctrl.serverSaveUrl) {
                        throw 'Define a Save URL.';
                    }

                    if (!forceUpdate && !row.$isNew && !row.$hasChanges()) {
                        row.$isEditing = false;
                        return null;
                    }

                    row.$isLoading = true;
                    const component = row.$component;
                    row.$component = null;
                    const clone = angular.copy(row);
                    row.$component = component;

                    const originalClone = angular.copy(row.$original);

                    delete clone.$isEditing;
                    delete clone.$original;
                    delete clone.$state;
                    delete clone.$valid;
                    delete clone.$component;
                    delete clone.$isLoading;
                    delete clone.$isNew;

                    $ctrl.currentRequest = $http({
                        url: row.$isNew ? addTimeZoneToUrl($ctrl.serverSaveUrl) : $ctrl.serverSaveUrl,
                        method: row.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT',
                        data: row.$isNew ? clone : {
                            Old: originalClone,
                            New: clone,
                            TimezoneOffset: new Date().getTimezoneOffset()
                        }
                    });

                    $ctrl.currentRequest.then(data => {
                        $scope.$emit('tbForm_OnSuccessfulSave', data);
                        row.$isLoading = false;
                        row.$isEditing = false;
                        $ctrl.currentRequest = null;
                        $ctrl.retrieveData();
                        
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
                    const columns = angular.fromJson(storage.getItem(`${prefix + $ctrl.name  }_columns`));
                    if (columns == null || columns === '') {
                        // Nothing in settings, saving initial state
                        storage.setItem(`${prefix + $ctrl.name  }_columns`, angular.toJson($ctrl.columns));
                        return;
                    }

                    angular.forEach(columns, column => {
                            const filtered = $ctrl.columns.filter(el => el.Name === column.Name);

                            if (filtered.length === 0) {
                                return;
                            }

                            const current = filtered[0];
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
                        url: $ctrl.serverUrl,
                        method: $ctrl.requestMethod || 'POST',
                        requireAuthentication: getRequiredAuthentication(),
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

                    if ($ctrl.columns.length === 0) {
                        throw 'You need to define at least one column';
                    }

                    $ctrl.canSaveState = true;
                    $ctrl.verifyColumns();

                    if ($ctrl.savePageSize) {
                        $ctrl.pageSize = (parseInt(storage.getItem(`${prefix + $ctrl.name  }_pageSize`)) || $ctrl.pageSize);
                    }

                    $ctrl.pageSize = $ctrl.pageSize < 10 ? 20 : $ctrl.pageSize; // default

                    const newPages = Math.ceil($ctrl.totalRecordCount / $ctrl.pageSize);
                    if ($ctrl.requestedPage > newPages) $ctrl.requestedPage = newPages;

                    const request = $ctrl.getRequestObject(-1);
                    
                    $scope.$emit('tbGrid_OnBeforeRequest', request, $ctrl);
                    
                    if (angular.isDefined($ctrl.onBeforeGetData)) {
                        $ctrl.onBeforeGetData(request);
                    }

                    $ctrl.currentRequest = $http(request);

                    $ctrl.currentRequest.then($ctrl.processPayload, error => {
                        $ctrl.requestedPage = $ctrl.currentPage;
                        $scope.$emit('tbGrid_OnConnectionError', error);
                    }).then(() => $ctrl.currentRequest = null);
                };

                $ctrl.processPayload = response => {
                    $ctrl.requestCounter += 1;

                    if (!response || !response.data) {
                        $scope.$emit('tbGrid_OnConnectionError',
                            {
                                statusText: 'Data is empty',
                                status: 0
                            });

                        return;
                    }

                    const data = response.data;

                    $ctrl.dataSource = data;

                    if (!data.Payload) {
                        $scope.$emit('tbGrid_OnConnectionError', `tubularGrid(${$ctrl.$id}): response is invalid.`);
                        return;
                    }

                    $ctrl.rows = data.Payload.map(el => {
                        const model = new TubularModel($ctrl, el);
                        model.$component = $ctrl;

                        model.editPopup = (template, size) => {
                            tubularPopupService.openDialog(template, new TubularModel($ctrl, el), $ctrl, size);
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
                        storage.setItem(`${prefix + $ctrl.name  }_page`, $ctrl.currentPage);
                    }
                };

                $ctrl.sortColumn = (columnName, multiple) => {
                    const filterColumn = $ctrl.columns.filter(el => el.Name === columnName);

                    if (filterColumn.length === 0) {
                        return;
                    }

                    const column = filterColumn[0];

                    if (column.Sortable === false) {
                        return;
                    }

                    // need to know if it's currently sorted before we reset stuff
                    const currentSortDirection = column.SortDirection;
                    const toBeSortDirection = currentSortDirection === 'None'
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
                    const currentlySortedColumns = $ctrl.columns.filter(col => col.SortOrder > 0);

                    // re-index the sort order
                    currentlySortedColumns.sort((a, b) => {
                        return a.SortOrder === b.SortOrder ? 0 : a.SortOrder > b.SortOrder
                    });

                    angular.forEach(currentlySortedColumns, (col, index) => col.SortOrder = index + 1);

                    $scope.$broadcast('tbGrid_OnColumnSorted');
                    $ctrl.retrieveData();
                };

                $ctrl.getFullDataSource = () => {
                    const request = $ctrl.getRequestObject(0);
                    request.data.Take = -1;
                    request.data.Search = {
                        Text: '',
                        Operator: 'None'
                    };

                    return $http(request)
                        .then(response => response.data.Payload,
                            error => $scope.$emit('tbGrid_OnConnectionError', error))
                        .then(() => $ctrl.currentRequest = null);
                };

                $ctrl.visibleColumns = () => $ctrl.columns.filter(el => el.Visible).length;
            }
        ]);
})(angular);
