(function (angular) {
    'use strict';

    angular.module('tubular.services').factory('tubularLocalDataPager', tubularLocalDataPager);

    tubularLocalDataPager.$inject = ['filterFilter', 'orderByFilter'];

    function tubularLocalDataPager(filterFilter, orderByFilter) {
        return {
            page: page
        }


        function page(request, data) {
            if (data.length === 0)
                return createEmptyResponse();
            var set = data;
            var requestParams = request.data;
            set = sort(requestParams, set);
            set = filter(requestrequestParams, set);
            set = search(requestParams, set);
            return format(requestParams, set);
        }

        function sort(request, set) {
            // Get columns with sort
            // TODO: Check SortOrder 
            var sorts = request.Columns
                .filter(function (el) { return el.SortOrder > 0; })
                .map(function (el) { return (el.SortDirection === 'Descending' ? '-' : '') + el.Name; });

            for (var sort in sorts) {
                if (sorts.hasOwnProperty(sort)) {
                    set = orderByFilter(set, sorts[sort]);
                }
            }
            return set;
        }

        function search(request, set) {
            if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                var searchables = request.Columns
                    .filter(function (el) { return el.Searchable; })
                    .map(function (el) {
                        var obj = {};
                        obj[el.Name] = request.Search.Text;
                        return obj;
                    });

                if (searchables.length > 0) {
                    return filterFilter(set, function (value) {
                        var filters = reduceFilterArray(searchables);
                        var result = false;
                        angular.forEach(filters, function (filter, column) {
                            if (value[column] && value[column].toLocaleLowerCase().indexOf(filter) >= 0) {
                                result = true;
                            }
                        });

                        return result;
                    });
                }
            }
            return set;
        }

        function filter(request, set) {
            // Get filters (only Contains)
            // TODO: Implement all operators
            var filters = request.Columns
                .filter(function (el) { return el.Filter && el.Filter.Text; })
                .map(function (el) {
                    var obj = {};
                    if (el.Filter.Operator === 'Contains') {
                        obj[el.Name] = el.Filter.Text;
                    }

                    return obj;
                });

            if (filters.length > 0) {
                return filterFilter(set, reduceFilterArray(filters));
            }
            return set;
        }

        function format(request, set) {
            var response = createEmptyResponse();
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
        }

        function createEmptyResponse() {
            return {
                Counter: 0,
                CurrentPage: 1,
                FilteredRecordCount: 0,
                TotalRecordCount: 0,
                Payload: [],
                TotalPages: 0
            };
        }
        function reduceFilterArray(filters) {
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
        }
    }
})(angular);