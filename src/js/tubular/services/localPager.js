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
        this.process = (request, data) => {
            return $q(resolve => {
                if (data && data.length > 0) {
                    const totalRecords = data.length;
                    data = search(request.data, data);
                    data = filter(request.data, data);
                    data = sort(request.data, data);

                    resolve({ data: format(request.data, data, totalRecords) });
                }
                else {
                    resolve({ data: createEmptyResponse() });
                }
            });
        };

        function sort(request, set) {
            var sorts = request.Columns
                .filter(el => el.SortOrder > 0)
                .map(el => (el.SortDirection === 'Descending' ? '-' : '') + el.Name);

            angular.forEach(sorts, sort => set = orderByFilter(set, sort));

            return set;
        }

        function search(request, set) {
            if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                const searchables = request.Columns
                    .map((el, index) => el.Searchable ? index : null)
                    .filter(el => el != null);
                
                if (searchables.length > 0) {
                    return set.filter(value => searchables.some((el, index) => 
                        angular.isString(value[index]) && value[index].toLocaleLowerCase().indexOf(request.Search.Text.toLocaleLowerCase()) >= 0
                    ));
                }
            }

            return set;
        }

        function filter(request, set) {
            // Get filters (only Contains)
            // TODO: Implement all operators
            var filters = request.Columns
                .filter(el => el.Filter && el.Filter.Text)
                .map(el => ({ [el.Name]: el.Filter.Text.toLocaleLowerCase() }));

            if (filters.length > 0) {
                return filterFilter(set, reduceFilterArray(filters));
            }

            return set;
        }

        function format(request, set, totalRecords) {
            const response = createEmptyResponse();
            response.FilteredRecordCount = set.length;
            response.TotalRecordCount = totalRecords;
            response.Payload = set.slice(request.Skip, request.Take + request.Skip);
            response.TotalPages = Math.trunc((response.FilteredRecordCount + request.Take - 1) / request.Take);

            if (response.TotalPages > 0) {
                response.CurrentPage = request.Skip / set.length + 1;
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