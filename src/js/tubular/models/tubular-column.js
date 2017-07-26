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
        .factory('tubularColumn', ['dataTypes', 'sortDirection', 
        function (dataTypes, sortDirection) {
            return function (columnName, options) {
                options = options || {};
                options.DataType = options.DataType || dataTypes.STRING;

                if (Object.values(dataTypes).indexOf(options.DataType) < 0) {
                    throw `Invalid data type: '${options.DataType}' for column '${columnName}'`;
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

                        if (options.SortDirection.toLowerCase().indexOf('asc') === 0) {
                            return sortDirection.ASC;
                        }

                        if (options.SortDirection.toLowerCase().indexOf('desc') === 0) {
                            return sortDirection.DESC;
                        }

                        return sortDirection.NONE;
                    }(),
                    IsKey: angular.isDefined(options.IsKey) ? options.IsKey : false,
                    Searchable: angular.isDefined(options.Searchable) ? options.Searchable : false,
                    Visible: options.Visible === 'false' ? false : true,
                    Filter: null,
                    DataType: options.DataType || dataTypes.STRING,
                    Aggregate: options.Aggregate || 'none'
                };

                return obj;
            };
        }]);
})(angular);
