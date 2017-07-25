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
        .factory('tubularColumn', ['dataTypes', function (dataTypes) {
            return function (columnName, options) {
                options = options || {};
                options.DataType = options.DataType || 'string';

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
                            return 'None';
                        }

                        if (options.SortDirection.toLowerCase().indexOf('asc') === 0) {
                            return 'Ascending';
                        }

                        if (options.SortDirection.toLowerCase().indexOf('desc') === 0) {
                            return 'Descending';
                        }

                        return 'None';
                    }(),
                    IsKey: angular.isDefined(options.IsKey) ? options.IsKey : false,
                    Searchable: angular.isDefined(options.Searchable) ? options.Searchable : false,
                    Visible: options.Visible === 'false' ? false : true,
                    Filter: null,
                    DataType: options.DataType || 'string',
                    Aggregate: options.Aggregate || 'none'
                };

                return obj;
            };
        }]);
})(angular);
