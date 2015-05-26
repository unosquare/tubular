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
                    var set = me.database;

                    // Get columns with sort
                    // TODO: Check SortOrder 
                    var sorts = request.Columns
                        .filter(function(el) { return el.SortOrder > 0; })
                        .map(function(el) { return (el.SortDirection == 'Descending' ? '-' : '') + el.Name; });

                    for (var sort in sorts)
                        set = $filter('orderBy')(set, sorts[sort]);

                    // Get filters (only Contains)
                    var filters = request.Columns
                        .filter(function (el) { return el.Filter != null && el.Filter.Text != null; })
                        .map(function (el) {
                        var obj = {};
                        if (el.Filter.Operator == 'Contains')
                            obj[el.Name] = el.Filter.Text;

                            return obj;
                        });

                    if (filters.length > 0) {
                        var filtersPattern = {};
                        for (var i in filters) {
                            for (var k in filters[i])
                                filtersPattern[k] = filters[i][k];
                        }

                        set = $filter('filter')(set, filtersPattern);
                    }

                    // TODO: Free text search

                    var response = {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: set.length,
                        TotalRecordCount: set.length
                    };

                    response.Payload = set.slice(request.Skip, request.Take + request.Skip);
                    response.TotalRecordCount = response.Payload.length;

                    response.TotalPages = (response.FilteredRecordCount + request.Take - 1) / request.Take;

                    if (response.TotalPages > 0) {
                        response.CurrentPage = 1 + ((request.Skip / response.FilteredRecordCount) * response.TotalPages);
                    }

                    return response;
                };

                me.saveDataAsync = function (model, request) {
                    // TODO: COMPLETE
                };

                me.get = function(url) {
                    // TODO: COMPLETE
                };

                me.delete = function(url) {
                    // TODO: COMPLETE
                };

                me.post = function(url, data) {
                    // TODO: COMPLETE
                };

                me.put = function(url, data) {
                    // TODO: COMPLETE
                };

                me.getByKey = function(url, key) {
                    // TODO: COMPLETE
                };
            }
        ]);
})();