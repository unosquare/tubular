(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularLocalData
         *
         * @description
         * Use `tubularLocalData` to connect a grid or a form to a local JSON file. This file can be 
         * stored in a BLOB as a BASE64 string.
         */
        .service('tubularLocalData', ['tubularHttp', '$q', '$filter', function(tubularHttp, $q, $filter) {
                var me = this;

                me.getByKey = tubularHttp.getByKey;

                me.get = tubularHttp.get;

                me.retrieveDataAsync = function(request) {
                    request.requireAuthentication = false;

                    var cancelFunc = function(reason) {
                        console.error(reason);
                        $q.defer().resolve(reason);
                    };

                    if (request.serverUrl.indexOf('data:') === 0) {
                        return {
                            promise: $q(function (resolve) {
                                var urlData = request.serverUrl.substr('data:application/json;base64,'.length);
                                urlData = atob(urlData);
                                var data = angular.fromJson(urlData);
                                resolve(me.pageRequest(request.data, data));
                            }),
                            cancel: cancelFunc
                        };
                    }

                    // If database is null, retrieve it
                    return {
                        promise: $q(function(resolve) {
                            resolve(tubularHttp.retrieveDataAsync(request).promise.then(function(data) {
                                // TODO: Maybe check dataset and convert DATES
                                return me.pageRequest(request.data, data);
                            }));
                        }),
                        cancel: cancelFunc
                    };
                };

                var reduceFilterArray = function(filters) {
                    var filtersPattern = {};

                    for (var i in filters) {
                        if (filters.hasOwnProperty(i)) {
                            for (var k in filters[i]) {
                                if (filters[i].hasOwnProperty(k)) {
                                    filtersPattern[k] = filters[i][k].toLocaleLowerCase();
                                }
                            }
                        }
                    }

                    return filtersPattern;
                };

                me.pageRequest = function(request, database) {
                    var response = {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 0,
                        TotalRecordCount: 0,
                        Payload: [],
                        TotalPages: 0
                    };

                    if (database.length === 0) return response;

                    var set = database;

                    // Get columns with sort
                    // TODO: Check SortOrder 
                    var sorts = request.Columns
                        .filter(function(el) { return el.SortOrder > 0; })
                        .map(function(el) { return (el.SortDirection === 'Descending' ? '-' : '') + el.Name; });

                    for (var sort in sorts) {
                        if (sorts.hasOwnProperty(sort)) {
                            set = $filter('orderBy')(set, sorts[sort]);
                        }
                    }

                    // Get filters (only Contains)
                    // TODO: Implement all operators
                    var filters = request.Columns
                        .filter(function(el) { return el.Filter && el.Filter.Text; })
                        .map(function(el) {
                            var obj = {};
                            if (el.Filter.Operator === 'Contains') {
                                obj[el.Name] = el.Filter.Text;
                            }

                            return obj;
                        });

                    if (filters.length > 0) {
                        set = $filter('filter')(set, reduceFilterArray(filters));
                    }

                    if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                        var searchables = request.Columns
                            .filter(function(el) { return el.Searchable; })
                            .map(function(el) {
                                var obj = {};
                                obj[el.Name] = request.Search.Text;
                                return obj;
                            });

                        if (searchables.length > 0) {
                            set = $filter('filter')(set, function(value) {
                                var filters = reduceFilterArray(searchables);
                                var result = false;
                                angular.forEach(filters, function(filter, column) {
                                    if (value[column] && value[column].toLocaleLowerCase().indexOf(filter) >= 0) {
                                        result = true;
                                    }
                                });

                                return result;
                            });
                        }
                    }

                    response.FilteredRecordCount = set.length;
                    response.TotalRecordCount = set.length;
                    response.Payload = set.slice(request.Skip, request.Take + request.Skip);
                    response.TotalPages = (response.FilteredRecordCount + request.Take - 1) / request.Take;

                    if (response.TotalPages > 0) {
                        var shift = Math.pow(10, 0);
                        var number = 1 + ((request.Skip / response.FilteredRecordCount) * response.TotalPages);

                        response.CurrentPage = ((number * shift) | 0) / shift;
                        if (response.CurrentPage < 1) response.CurrentPage = 1;
                    }

                    return response;
                };
            }
        ])
        .run([
            'tubularHttp', 'tubularLocalData',
            function (tubularHttp, tubularLocalData) {
                // register data services
                tubularHttp.registerService('local', tubularLocalData);
            }
        ]);
})(window.angular);