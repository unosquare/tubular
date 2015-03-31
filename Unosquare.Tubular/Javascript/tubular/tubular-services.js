(function() {
    'use strict';

    // User Service based on https://bitbucket.org/david.antaramian/so-21662778-spa-authentication-example
    angular.module('tubular.services', ['ui.bootstrap'])
        .service('tubularHttp', [
            '$http', '$timeout', '$q', '$cacheFactory', '$cookieStore', function tubularHttp($http, $timeout, $q, $cacheFactory, $cookieStore) {
                function isAuthenticationExpired(expirationDate) {
                    var now = new Date();
                    expirationDate = new Date(expirationDate);
                    if (expirationDate - now > 0) {
                        return false;
                    } else {
                        return true;
                    }
                }

                function saveData() {
                    removeData();
                    $cookieStore.put('auth_data', me.userData);
                }

                function removeData() {
                    $cookieStore.remove('auth_data');
                }

                function retrieveSavedData() {
                    var savedData = $cookieStore.get('auth_data');
                    if (typeof savedData === 'undefined') {
                        throw new Exception('No authentication data exists');
                    } else if (isAuthenticationExpired(savedData.expirationDate)) {
                        throw new Exception('Authentication token has already expired');
                    } else {
                        me.userData = savedData;
                        setHttpAuthHeader();
                    }
                }

                function clearUserData() {
                    me.userData.isAuthenticated = false;
                    me.userData.username = '';
                    me.userData.bearerToken = '';
                    me.userData.expirationDate = null;
                }

                function setHttpAuthHeader() {
                    $http.defaults.headers.common.Authorization = 'Bearer ' + me.userData.bearerToken;
                }

                var me = this;
                me.userData = {
                    isAuthenticated: false,
                    username: '',
                    bearerToken: '',
                    expirationDate: null,
                };

                me.cache = $cacheFactory('tubularHttpCache');
                me.useCache = true;

                me.isAuthenticated = function() {
                    if (me.userData.isAuthenticated && !isAuthenticationExpired(me.userData.expirationDate)) {
                        return true;
                    } else {
                        try {
                            retrieveSavedData();
                        } catch (e) {
                            return false;
                        }
                        return true;
                    }
                };

                me.removeAuthentication = function() {
                    removeData();
                    clearUserData();
                    $http.defaults.headers.common.Authorization = null;
                };

                me.authenticate = function(username, password, successCallback, errorCallback, persistData) {
                    this.removeAuthentication();
                    var config = {
                        method: 'POST',
                        url: '/api/token',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        data: 'grant_type=password&username=' + username + '&password=' + password,
                    };

                    $http(config)
                        .success(function(data) {
                            me.userData.isAuthenticated = true;
                            me.userData.username = data.userName;
                            me.userData.bearerToken = data.access_token;
                            me.userData.expirationDate = new Date(data['.expires']);
                            setHttpAuthHeader();
                            if (persistData === true) {
                                saveData();
                            }
                            if (typeof successCallback === 'function') {
                                successCallback();
                            }
                        })
                        .error(function(data) {
                            if (typeof errorCallback === 'function') {
                                if (data.error_description) {
                                    errorCallback(data.error_description);
                                } else {
                                    errorCallback('Unable to contact server; please, try again later.');
                                }
                            }
                        });
                };

                me.saveDataAsync = function(model, request) {
                    var clone = angular.copy(model);
                    var originalClone = angular.copy(model.$original);

                    delete clone.$isEditing;
                    delete clone.$hasChanges;
                    delete clone.$selected;
                    delete clone.$original;
                    delete clone.$state;
                    delete clone.$valid;

                    request.data = {
                        Old: originalClone,
                        New: clone
                    };

                    var dataRequest = me.retrieveDataAsync(request);

                    dataRequest.promise.then(function(data) {
                        model.$hasChanges = false;
                        model.resetOriginal();
                        return data;
                    });

                    return dataRequest;
                };

                me.getExpirationDate = function() {
                    var date = new Date();
                    var minutes = 5;
                    return new Date(date.getTime() + minutes * 60000);
                }

                me.checksum = function(obj) {
                    var keys = Object.keys(obj).sort();
                    var output = [], prop;
                    for (var i = 0; i < keys.length; i++) {
                        prop = keys[i];
                        output.push(prop);
                        output.push(obj[prop]);
                    }
                    return JSON.stringify(output);
                };

                me.retrieveDataAsync = function(request) {
                    var checksum = me.checksum(request);

                    var canceller = $q.defer();

                    var cancel = function(reason) {
                        console.error(reason);
                        canceller.resolve(reason);
                    };

                    if ((request.requestMethod == 'GET' || request.requestMethod == 'POST') && me.useCache) {
                        var data = me.cache.get(checksum);

                        if (angular.isDefined(data) && data.Expiration.getTime() > new Date().getTime()) {
                            return {
                                promise: $q(function(resolve, reject) {
                                    resolve(data.Set);
                                }),
                                cancel: cancel
                            };
                        }
                    }

                    // TODO: Check Unauthorize error and send revalidation
                    var promise = $http({
                        url: request.serverUrl,
                        method: request.requestMethod,
                        data: request.data,
                        timeout: canceller.promise
                    }).then(function(response) {
                        $timeout.cancel(timeoutHanlder);

                        if (me.useCache) {
                            me.cache.put(checksum, { Expiration: me.getExpirationDate(), Set: response.data });
                        }

                        return response.data;
                    });

                    request.timeout = request.timeout || 15000;

                    var timeoutHanlder = $timeout(function() {
                        cancel('Timed out');
                    }, request.timeout);

                    return {
                        promise: promise,
                        cancel: cancel
                    };
                };

                me.get = function(url) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'GET',
                    });
                };

                me.delete = function (url) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'DELETE',
                    });
                };

                me.post = function (url, data) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'POST',
                        data: data
                    });
                };

                me.put = function (url, data) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'PUT',
                        data: data
                    });
                };
            }
        ])
        .service('tubularOData', ['tubularHttp', function tubularOData(tubularHttp) {
            var me = this;

            me.retrieveDataAsync = function (request) {
                var params = request.data;
                var url = request.serverUrl;
                url += url.indexOf('?') > 0 ? '&' : '?';
                url += '$format=json&$inlinecount=allpages';

                url += "&$select=" + params.Columns.map(function (el) { return el.Name; }).join(',');
                url += "&$skip=" + params.Skip;
                url += "&$top=" + params.Take;

                // TODO: Search: scope.search and filters in columns ($filter=Price gt 20)
                // TODO: Sorting $orderby using columns ($orderby=Rating,Category/Name desc)
                var order = params.Columns.filter(function (el) { return el.SortOrder > 0; }).sort(function (a, b) { return a.SortOrder - b.SortOrder; }).map(function (el) { return el.Name + " " + (el.SortDirection == "Descending" ? "desc" : ""); });

                if (order.length > 0)
                    url += "&$orderby=" + order.join(',');

                request.data = null;
                request.serverUrl = url;
                
                var response = tubularHttp.retrieveDataAsync(request);
                
                var promise = response.promise.then(function(data) {
                    var result = {
                        Payload: data.value,
                        CurrentPage: 1,
                        TotalPages: 1,
                        TotalRecordCount: 1,
                        FilteredRecordCount: 1
                    };

                    result.TotalRecordCount = data["odata.count"];
                    result.FilteredRecordCount = result.TotalRecordCount; // TODO
                    result.TotalPages = parseInt(result.TotalRecordCount / params.Take);
                    result.CurrentPage = parseInt(1 + ((params.Skip / result.FilteredRecordCount) * result.TotalPages));

                    return result;
                });

                return {
                    promise: promise,
                    cancel: response.cancel
                };
            };

            me.saveDataAsync = function (model, request) {
                tubularHttp.saveDataAsync(model, request);
            };

            me.get = function(url) {
                tubularHttp.get(url);
            };

            me.delete = function (url) {
                tubularHttp.delete(url);
            };

            me.post = function (url, data) {
                tubularHttp.post(url, data);
            };

            me.put = function(url, data) {
                tubularHttp.put(url, data);
            };
        }])
        .service('tubularGridPopupService', [
            '$modal', function tubularGridPopupService($modal) {
                var me = this;

                me.openDialog = function(template, model) {
                    var dialog = $modal.open({
                        templateUrl: template,
                        backdropClass: 'fullHeight',
                        controller: [
                            '$scope', function($scope) {
                                $scope.Model = model;

                                $scope.savePopup = function () {
                                    var saveResult = $scope.Model.save();

                                    if (saveResult)
                                        dialog.close();
                                };

                                $scope.closePopup = function() {
                                    $scope.Model.revertChanges();
                                    dialog.close();
                                };
                            }
                        ]
                    });

                    return dialog;
                };
            }
        ])
        .service('tubularGridExportService', function tubularGridExportService() {
            var me = this;
            
            me.getColumns = function(gridScope) {
                return gridScope.columns.map(function(c) { return c.Name.replace(/([a-z])([A-Z])/g, '$1 $2'); });
            };

            me.exportAllGridToCsv = function(filename, gridScope) {
                var columns = me.getColumns(gridScope);
                gridScope.getFullDataSource(function(data) {
                    me.exportToCsv(filename, columns, data);
                });
                
            };

            me.exportGridToCsv = function(filename, gridScope) {
                var columns = me.getColumns(gridScope);
                gridScope.currentRequest = {};
                me.exportToCsv(filename, columns, gridScope.dataSource.Payload);
                gridScope.currentRequest = null;
            };

            me.exportToCsv = function(filename, header, rows) {
                var processRow = function(row) {
                    var finalVal = '';
                    for (var j = 0; j < row.length; j++) {
                        var innerValue = row[j] === null ? '' : row[j].toString();
                        if (row[j] instanceof Date) {
                            innerValue = row[j].toLocaleString();
                        };
                        var result = innerValue.replace(/"/g, '""');
                        if (result.search(/("|,|\n)/g) >= 0)
                            result = '"' + result + '"';
                        if (j > 0)
                            finalVal += ',';
                        finalVal += result;
                    }
                    return finalVal + '\n';
                };

                var csvFile = '';

                if (header.length > 0)
                    csvFile += processRow(header);

                for (var i = 0; i < rows.length; i++) {
                    csvFile += processRow(rows[i]);
                }

                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                $script('//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js', function() {
                    saveAs(blob, filename);
                });
            };
        })
        .service('tubularGridFilterService', [
            'tubulargGridFilterModel', '$compile', function tubularGridFilterService(FilterModel, $compile) {
                var me = this;

                me.applyFilterFuncs = function(scope, el, openCallback) {
                    scope.$component = scope.$parent.$component;
                    scope.filterTitle = "Filter";

                    scope.clearFilter = function() {
                        scope.filter.Operator = 'None';
                        scope.filter.Text = '';
                        scope.filter.Argument = [];

                        scope.$component.retrieveData();
                        scope.close();
                    };

                    scope.applyFilter = function() {
                        scope.$component.retrieveData();
                        scope.close();
                    };

                    scope.close = function() {
                        $(el).find('[data-toggle="popover"]').popover('hide');
                    };

                    $(el).find('[data-toggle="popover"]').popover({
                        html: true,
                        title: scope.filterTitle,
                        content: function() {
                            var selectEl = $(this).next().find('select').find('option').remove().end();
                            angular.forEach(scope.filterOperators, function(val, key) {
                                $(selectEl).append('<option value="' + key + '">' + val + '</option>');
                            });

                            return $compile($(this).next().html())(scope);
                        },
                    });

                    $(el).find('[data-toggle="popover"]').on('shown.bs.popover', openCallback);
                };

                me.createFilterModel = function(scope, lAttrs) {
                    scope.filter = new FilterModel(lAttrs);
                    scope.filter.Name = scope.$parent.column.Name;

                    var columns = scope.$component.columns.filter(function(el) {
                        return el.Name === scope.filter.Name;
                    });

                    if (columns.length === 0) return;

                    columns[0].Filter = scope.filter;
                    scope.dataType = columns[0].DataType;
                    scope.filterOperators = columns[0].FilterOperators[scope.dataType];

                    if (scope.dataType == 'datetime' || scope.dataType == 'date') {
                        scope.filter.Argument = [new Date()];
                    }

                    if (scope.dataType == 'numeric') {
                        scope.filter.Argument = [1];
                    }

                    scope.filterTitle = lAttrs.title || "Filter";
                };
            }
        ])
        .service('tubularEditorService', [
            function tubularEditorService() {
                var me = this;

                me.defaultScope = {
                    value: '=?',
                    state: '=?',
                    isEditing: '=?',
                    editorType: '@',
                    showLabel: '=?',
                    label: '=?',
                    required: '=?',
                    format: '=?',
                    min: '=?',
                    max: '=?',
                    name: '@',
                    defaultValue: '=?',
                    IsKey: '@'
                };

                me.setupScope = function(scope, defaultFormat) {
                    scope.isEditing = angular.isUndefined(scope.isEditing) ? true : scope.isEditing;
                    scope.showLabel = scope.showLabel || false;
                    scope.label = scope.label || (scope.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                    scope.required = scope.required || false;
                    scope.format = scope.format || defaultFormat;
                    scope.$valid = true;
                    scope.$editorType = 'input';

                    if (angular.isUndefined(scope.defaultValue) == false && angular.isUndefined(scope.value)) {
                        scope.value = scope.defaultValue;
                    }

                    scope.$watch('value', function(newValue, oldValue) {
                        if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) return;

                        if (angular.isUndefined(scope.state)) {
                            scope.state = {
                                $valid: function() {
                                    return this.$errors == 0;
                                },
                                $errors: []
                            };
                        }

                        scope.$valid = true;
                        scope.state.$errors = [];

                        if (angular.isDefined(scope.$parent.Model)) {
                            if (angular.isDefined(scope.$parent.Model[scope.name]))
                                scope.$parent.Model[scope.name] = newValue;
                            else
                                scope.$parent.Model.$addField(scope.name, newValue);
                        }

                        if (angular.isUndefined(scope.value) && scope.required) {
                            scope.$valid = false;
                            scope.state.$errors = ["Field is required"];
                            return;
                        }

                        if (angular.isUndefined(scope.validate)) return;

                        scope.validate();
                    });

                    var parent = scope.$parent;

                    while (true) {
                        if (parent == null) break;
                        if (angular.isUndefined(parent.tubularDirective) == false &&
                            parent.tubularDirective == 'tubular-form') {
                            parent.addField(scope);
                            break;
                        }

                        parent = parent.$parent;
                    }
                };
            }
        ]);
})();