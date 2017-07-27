(angular => {
    'use strict';

    angular.module('tubular.models')
        /**
         * @ngdoc factory
         * @name tubularColumn
         * @module tubular.models
         *
         * @description
         * The `tubularColumn` factory is the base to generate a column model to use with `tbGrid`.
         */
        .factory('tubularColumn', ['dataTypes', 'sortDirection', 'aggregateFunctions', function (dataTypes, sortDirection, aggregateFunctions) {
            return function (columnName, options) {
                options = options || {};
                options.DataType = options.DataType || dataTypes.STRING;
                options.Aggregate = options.Aggregate || aggregateFunctions.NONE;

                if (Object.values(dataTypes).indexOf(options.DataType) < 0) {
                    throw `Invalid data type: '${options.DataType}' for column '${columnName}'`;
                }

                if (Object.values(aggregateFunctions).indexOf(options.Aggregate) < 0) {
                    throw `Invalid aggregate function: '${options.Aggregate}' for column '${columnName}'`;
                }

                const obj = {
                    Label: options.Label || (columnName || '').replace(/([a-z])([A-Z])/g, '$1 $2'),
                    Name: columnName,
                    Sortable: options.Sortable,
                    SortOrder: parseInt(options.SortOrder) || -1,
                    SortDirection: function () {
                        if (angular.isUndefined(options.SortDirection)) {
                            return sortDirection.NONE;
                        }

                        if (options.SortDirection.toLowerCase().startsWith('asc')) {
                            return sortDirection.ASCENDING;
                        }

                        if (options.SortDirection.toLowerCase().startsWith('desc')) {
                            return sortDirection.DESCENDING;
                        }

                        return sortDirection.NONE;
                    }(),
                    IsKey: angular.isDefined(options.IsKey) ? options.IsKey : false,
                    Searchable: angular.isDefined(options.Searchable) ? options.Searchable : false,
                    Visible: options.Visible === 'false' ? false : true,
                    Filter: null,
                    DataType: options.DataType,
                    Aggregate: options.Aggregate
                };

                return obj;
            };
        }]);
})(angular);
