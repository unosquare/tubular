(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name localPager
         *
         * @description
         * Represents a service to handle a Tubular Grid Request in client side
         */
        .service('localPager', localPager);

    localPager.$inject = ['$q', 'filterFilter', 'orderByFilter'];

    function localPager($q, filterFilter, orderByFilter) {
        this.process = function (request, data) {
            var deferred = $q.defer();

            if (angular.isUndefined(data) || data.length === 0) {
                deferred.resolve({
                    Counter: 0,
                    CurrentPage: 1,
                    FilteredRecordCount: 0,
                    TotalRecordCount: 0,
                    Payload: [],
                    TotalPages: 0
                });

                return deferred.promise;
            }

            doProcess(deferred, request, data);

            return deferred.promise;
        };

        function doProcess(deferred, request, data) {
            data = search(request, data);
            data = filter(request, data);
            data = sort(request, data);

            deferred.resolve({ data: format(request, data) });
        }

        function sort(request, set) {
            var sorts = request.Columns
                .filter(el => el.SortOrder > 0)
                .map(el => (el.SortDirection === 'Descending' ? '-' : '') + el.Name);

            angular.forEach(sort, sort => set = orderByFilter(set, sort));

            return set;
        }

        function search(request, set) {
            if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                const searchables = request.Columns
                    .filter(el => el.Searchable)
                    .map(el => ({ [el.Name] : request.Search.Text }));

                if (searchables.length > 0) {
                    return filterFilter(set, value => reduceFilterArray(searchables).some(column => value[column] && value[column].toLocaleLowerCase().indexOf(filter) >= 0));
                }
            }

            return set;
        }

        function filter(request, set) {
            // Get filters (only Contains)
            // TODO: Implement all operators
            var filters = request.Columns
                .filter(el => el.Filter && el.Filter.Text)
                .map(el => ({ [el.Name]: el.Filter.Text}));

            if (filters.length > 0) {
                return filterFilter(set, reduceFilterArray(filters));
            }
            
            return set;
        }

        function format(request, set) {
            const response = createEmptyResponse();
            response.FilteredRecordCount = set.length;
            response.TotalRecordCount = set.length;
            response.Payload = set.slice(request.Skip, request.Take + request.Skip);
            response.TotalPages = (response.FilteredRecordCount + request.Take - 1) / request.Take;

            if (response.TotalPages > 0) {
                const shift = Math.pow(10, 0);
                const number = 1 + ((request.Skip / response.FilteredRecordCount) * response.TotalPages);

                response.CurrentPage = ((number * shift) | 0) / shift;

                if (response.CurrentPage < 1) {
                    response.CurrentPage = 1;
                }
            }

            return response;
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
