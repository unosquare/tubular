(function() {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularOData
         *
         * @description
         * Use `tubularOData` to connect a grid or a form to an OData Resource. Most filters are working
         * and sorting and pagination too.
         * 
         * This service provides authentication using bearer-tokens, if you require any other you need to provide it.
         */
        .service('tubularOData', [
            'tubularHttp', function tubularOData(tubularHttp) {
                var me = this;

                // {0} represents column name and {1} represents filter value
                me.operatorsMapping = {
                    'None': '',
                    'Equals': "{0} eq {1}",
                    'NotEquals': "{0} ne {1}",
                    'Contains': "substringof({1}, {0}) eq true",
                    'StartsWith': "startswith({0}, {1}) eq true",
                    'EndsWith': "endswith({0}, {1}) eq true",
                    'NotContains': "substringof({1}, {0}) eq false",
                    'NotStartsWith': "startswith({0}, {1}) eq false",
                    'NotEndsWith': "endswith({0}, {1}) eq false",
                    // TODO: 'Between': 'Between', 
                    'Gte': "{0} ge {1}",
                    'Gt': "{0} gt {1}",
                    'Lte': "{0} le {1}",
                    'Lt': "{0} lt {1}"
                };

                me.generateUrl = function (request) {
                    var params = request.data;

                    var url = request.serverUrl;
                    url += url.indexOf('?') > 0 ? '&' : '?';
                    url += '$format=json&$inlinecount=allpages';

                    url += "&$select=" + params.Columns.map(function (el) { return el.Name; }).join(',');

                    if (params.Take != -1) {
                        url += "&$skip=" + params.Skip;
                        url += "&$top=" + params.Take;
                    }

                    var order = params.Columns
                        .filter(function (el) { return el.SortOrder > 0; })
                        .sort(function (a, b) { return a.SortOrder - b.SortOrder; })
                        .map(function (el) { return el.Name + " " + (el.SortDirection === "Descending" ? "desc" : ""); });

                    if (order.length > 0) {
                        url += "&$orderby=" + order.join(',');
                    }

                    var filter = params.Columns
                        .filter(function (el) { return el.Filter && el.Filter.Text; })
                        .map(function (el) {
                            return me.operatorsMapping[el.Filter.Operator]
                                .replace('{0}', el.Name)
                                .replace('{1}', el.DataType == "string" ? "'" + el.Filter.Text + "'" : el.Filter.Text);
                        })
                        .filter(function (el) { return el.length > 1; });


                    if (params.Search && params.Search.Operator === 'Auto') {
                        var freetext = params.Columns
                            .filter(function (el) { return el.Searchable; })
                            .map(function (el) {
                                return "startswith({0}, '{1}') eq true".replace('{0}', el.Name).replace('{1}', params.Search.Text);
                            });

                        if (freetext.length > 0) {
                            filter.push("(" + freetext.join(' or ') + ")");
                        }
                    }

                    if (filter.length > 0) {
                        url += "&$filter=" + filter.join(' and ');
                    }

                    return url;
                };

                me.retrieveDataAsync = function (request) {
                    var params = request.data;
                    var originalUrl = request.serverUrl;
                    request.serverUrl = me.generateUrl(request);
                    request.data = null;

                    var response = tubularHttp.retrieveDataAsync(request);

                    var promise = response.promise.then(function (data) {
                        var result = {
                            Payload: data.value,
                            CurrentPage: 1,
                            TotalPages: 1,
                            TotalRecordCount: 1,
                            FilteredRecordCount: 1
                        };

                        result.TotalRecordCount = parseInt(data["odata.count"]);
                        result.FilteredRecordCount = result.TotalRecordCount; // TODO: Calculate filtered items
                        result.TotalPages = parseInt((result.FilteredRecordCount + params.Take - 1) / params.Take);
                        result.CurrentPage = parseInt(1 + ((params.Skip / result.FilteredRecordCount) * result.TotalPages));

                        if (result.CurrentPage > result.TotalPages) {
                            result.CurrentPage = 1;
                            request.data = params;
                            request.data.Skip = 0;

                            request.serverUrl = originalUrl;

                            me.retrieveDataAsync(request).promise.then(function (newData) {
                                result.Payload = newData.value;
                            });
                        }

                        return result;
                    });

                    return {
                        promise: promise,
                        cancel: response.cancel
                    };
                };

                me.saveDataAsync = function (model, request) {
                    return tubularHttp.saveDataAsync(model, request); //TODO: Check how to handle
                };

                me.get = function (url) {
                    return tubularHttp.get(url);
                };

                me.delete = function (url) {
                    return tubularHttp.delete(url);
                };

                me.post = function (url, data) {
                    return tubularHttp.post(url, data);
                };

                me.put = function (url, data) {
                    return tubularHttp.put(url, data);
                };

                me.getByKey = function (url, key) {
                    return tubularHttp.get(url + "(" + key + ")");
                };
            }
        ]);
})();