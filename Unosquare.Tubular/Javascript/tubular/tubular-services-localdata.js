(function() {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularLocalData
         *
         * @description
         * Use `tubularLocalData` to connect a grid or a form to a local
         * JSON database.
         */
        .service('tubularLocalData', [
            'tubularHttp', '$q', '$filter', function tubularOData(tubularHttp, $q, $filter) {
                var me = this;

                me.database = null;

                me.retrieveDataAsync = function(request) {
                    request.requireAuthentication = false;
                    var cancelFunc = function(reason) {
                        console.error(reason);
                        $q.defer().resolve(reason);
                    };

                    // If database is null, retrieve it
                    if (me.database == null) {
                        return {
                            promise: $q(function(resolve, reject) {
                                resolve(tubularHttp.retrieveDataAsync(request).promise.then(function(data) {
                                    me.database = data;
                                    // TODO: Maybe check dataset and convert DATES
                                    return me.pageRequest(request.data);
                                }));
                            }),
                            cancel: cancelFunc
                        };
                    }

                    return {
                        promise: $q(function(resolve, reject) {
                            resolve(me.pageRequest(request.data));
                        }),
                        cancel: cancelFunc
                    };
                };

                me.pageRequest = function(request) {
                    var response = {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 0,
                        TotalRecordCount: 0,
                        Payload: [],
                        TotalPages: 0
                    };

                    if (me.database.length === 0) return response;

                    var set = me.database;

                    // Get columns with sort
                    // TODO: Check SortOrder 
                    var sorts = request.Columns
                        .filter(function(el) { return el.SortOrder > 0; })
                        .map(function(el) { return (el.SortDirection == 'Descending' ? '-' : '') + el.Name; });

                    for (var sort in sorts) {
                        if (sorts.hasOwnProperty(sort)) {
                            set = $filter('orderBy')(set, sorts[sort]);
                        }
                    }

                    // Get filters (only Contains)
                    var filters = request.Columns
                        .filter(function(el) { return el.Filter && el.Filter.Text; })
                        .map(function(el) {
                            var obj = {};
                            if (el.Filter.Operator == 'Contains')
                                obj[el.Name] = el.Filter.Text;

                            return obj;
                        });

                    if (filters.length > 0) {
                        var filtersPattern = {};

                        for (var i in filters) {
                            if (filters.hasOwnProperty(i)) {
                                for (var k in filters[i]) {
                                    if (filters[i].hasOwnProperty(k)) {
                                        filtersPattern[k] = filters[i][k];
                                    }
                                }
                            }
                        }

                        set = $filter('filter')(set, filtersPattern);
                    }

                    // TODO: Free text search

                    response.FilteredRecordCount = set.length;
                    response.TotalRecordCount = set.length;
                    response.Payload = set.slice(request.Skip, request.Take + request.Skip);
                    response.TotalPages = (response.FilteredRecordCount + request.Take - 1) / request.Take;

                    if (response.TotalPages > 0) {
                        response.CurrentPage = Math.trunc(1 + ((request.Skip / response.FilteredRecordCount) * response.TotalPages));
                    }

                    return response;
                };

                me.saveDataAsync = function (model, request) {
                    // TODO: Complete
                    me.database.push(model);
                };

                me.get = function (url) {
                    // Just pass the URL to TubularHttp for now
                    tubularHttp.get(url);
                };

                me.delete = function (url) {
                    // Just pass the URL to TubularHttp for now
                    tubularHttp.delete(url);
                };

                me.post = function (url, data) {
                    // Just pass the URL to TubularHttp for now
                    tubularHttp.post(url, data);
                };

                me.put = function (url, data) {
                    // Just pass the URL to TubularHttp for now
                    tubularHttp.put(url, data);
                };

                me.getByKey = function (url, key) {
                    // Just pass the URL to TubularHttp for now
                    tubularHttp.getByKey(url, key);
                };
            }
        ]);
})();