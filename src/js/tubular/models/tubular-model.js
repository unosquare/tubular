(function (angular, moment) {
    'use strict';

    angular.module('tubular.models')
        /**
         * @ngdoc factory
         * @name tubularModel
         * @module tubular.models
         *
         * @description
         * The `tubularModel` factory is the base to generate a row model to use with `tbGrid` and `tbForm`.
         */
        .factory('tubularModel', [function() {
            return function($ctrl, data) {
                const obj = {
                    $hasChanges: () => obj.$fields.some(k => angular.isDefined(obj.$original[k]) && obj[k] !== obj.$original[k]),
                    $isEditing: false,
                    $isNew: false,
                    $key: '',
                    $fields: [],
                    $state: {},
                    $original: {},
                    $valid: () => Object.keys(obj.$state).filter(k => angular.isDefined(obj.$state[k]) && !obj.$state[k].$valid()).length == 0,
                    $addField: (key, value, ignoreOriginal) => {
                        if (obj.$fields.indexOf(key) >= 0) {
                            return;
                        }

                        obj[key] = value;
                        obj.$fields.push(key);
                        obj.$original[key] = ignoreOriginal ? undefined : value;
                    },
                    resetOriginal: () => angular.forEach(obj.$original, (v, k) => obj.$original[k] = obj[k]),
                    revertChanges: () => {
                        angular.forEach(obj, (v, k) => {
                            if (angular.isDefined(obj.$original[k])) {
                                obj[k] = obj.$original[k];
                            }
                        });

                        obj.$isEditing = false;
                    }
                };

                if (!angular.isArray(data)) {
                    angular.forEach(data, (v,k) => obj.$addField(k, v));
                }

                if (angular.isDefined($ctrl.columns)) {
                    angular.forEach($ctrl.columns, (col, key) => {
                        let value = angular.isDefined(data[key]) ? data[key] : data[col.Name];

                        if (col.DataType === 'date' || col.DataType === 'datetime' || col.DataType === 'datetimeutc') {
                            if (value === null || value === '' || moment(value).year() <= 1900)
                                value = '';
                            else
                                value = col.DataType === 'datetimeutc' ? moment.utc(value) : moment(value);
                        }

                        obj.$addField(col.Name, value);

                        if (col.IsKey) {
                            obj.$key += `${value},`;
                        }
                    });
                }

                if (obj.$key.length > 1) {
                    obj.$key = obj.$key.substring(0, obj.$key.length - 1);
                }

                return obj;
            };
        }]);
})(angular, moment);
