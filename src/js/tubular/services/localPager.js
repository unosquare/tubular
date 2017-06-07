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

    localPager.$inject = ['$q','orderByFilter'];

    function localPager($q, orderByFilter) {
        this.process = (request, data) => {
            return $q(resolve => {
                if (data && data.length > 0) {
                    const totalRecords = data.length;
                    let set = data;

                    if (angular.isArray(set[0]) == false) {
                        const columnIndexes = request.data.Columns
                            .map(el => el.Name);
                        
                        set = set.map(el => columnIndexes.map(name => el[name]));
                    }

                    set = search(request.data, set);
                    set = filter(request.data, set);
                    set = sort(request.data, set);

                    resolve({ data: format(request.data, set, totalRecords) });
                }
                else {
                    resolve({ data: createEmptyResponse() });
                }
            });
        };

        function sort(request, set) {
            const sorts = request.Columns
                .map((el, index) => el.SortOrder > 0 ? (el.SortDirection === 'Descending' ? '-' : '') + index : null)
                .filter(el => el != null);
            
            angular.forEach(sorts, sort => {
                set = orderByFilter(set, sort);
            });

            return set;
        }

        function search(request, set) {
            if (request.Search && request.Search.Operator === 'Auto' && request.Search.Text) {
                const filters = request.Columns
                    .map((el, index) => el.Searchable ? index : null)
                    .filter(el => el != null);
                
                if (filters.length > 0) {
                    const searchValue = request.Search.Text.toLocaleLowerCase();

                    return set.filter(value => filters.some(el => angular.isString(value[el]) && value[el].toLocaleLowerCase().indexOf(searchValue) >= 0));
                }
            }

            return set;
        }

        function filter(request, set) {
            // Get filters (only Contains)
            // TODO: Implement all operators
            const filters = request.Columns
                .map((el, index) => el.Filter && el.Filter.Text ? { idx: index, text: el.Filter.Text.toLocaleLowerCase() } : null)
                .filter(el => el != null);
                
            if (filters.length === 0) {
                return set;
            }

            //This is applying OR operator to all filters and CONTAINS
            return set.filter(value => filters.some(el => {
                // if string apply contains
                if (angular.isString(value[el.idx]) && value[el.idx].toLocaleLowerCase().indexOf(el.text) >= 0)
                    return true;
                // otherwise just compare without type
                return value[el.idx] == el.text;
            }));
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
    }
})(angular);