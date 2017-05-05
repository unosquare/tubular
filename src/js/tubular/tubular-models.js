(function (angular, moment) {
    'use strict';

    /**                                           
     * @ngdoc module
     * @name tubular.models
     * 
     * @description
     * Tubular Models module. 
     * 
     * It contains model's factories to be use in {@link tubular.directives} like `tubularModel` and `tubularGridColumnModel`.
     */
    angular.module('tubular.models', [])
        /**
         * @ngdoc factory
         * @name tubularModel
         * @module tubular.models
         *
         * @description
         * The `tubularModel` factory is the base to generate a row model to use with `tbGrid` and `tbForm`.
         */
        .factory('tubularModel', [function() {
            return function($scope, $ctrl, data) {
                var obj = {
                    $hasChanges: false,
                    $isEditing: false,
                    $isNew: false,
                    $key: '',
                    $fields: [],
                    $state: {},
                    $original: {},
                    $valid: () => {
                        var valid = true;

                        angular.forEach(obj.$state, val => {
                            if (angular.isUndefined(val) || val.$valid()) {
                                return;
                            }

                            valid = false;
                        });

                        return valid;
                    },
                    $addField: (key, value, ignoreOriginal) => {
                        if (obj.$fields.indexOf(key) >= 0) {
                            return;
                        }

                        obj[key] = value;
                        obj.$fields.push(key);
                        obj.$original[key] = ignoreOriginal ? undefined : value;

                        if (ignoreOriginal) {
                            obj.$hasChanges = true;
                        }

                        $scope.$watch(() => obj[key], (newValue, oldValue) => {
                            if (newValue === oldValue) {
                                return;
                            }

                            obj.$hasChanges = obj[key] !== obj.$original[key];
                        });
                    },
                    resetOriginal: () => angular.forEach(obj.$original, (v, k) => obj.$original[k] = obj[k]),
                    revertChanges: () => {
                        angular.forEach(obj, (v, k) => {
                            if (angular.isDefined(obj.$original[k])) {
                                obj[k] = obj.$original[k];
                            }
                        });

                        obj.$hasChanges = obj.$isEditing = false;
                    }
                };

                if (!angular.isArray(data)) {
                    angular.forEach(data, (v,k) => obj.$addField(k, v));
                }

                if (angular.isDefined($ctrl.columns)) {
                    angular.forEach($ctrl.columns, (col, key) => {
                        var value = angular.isDefined(data[key]) ? data[key] : data[col.Name];

                        if (angular.isUndefined(value) && data[key] === 0) {
                            value = 0;
                        }

                        obj.$addField(col.Name, value);

                        if (col.DataType === 'date' || col.DataType === 'datetime' || col.DataType === 'datetimeutc') {
                            if (obj[col.Name] === null || obj[col.Name] === '' || moment(obj[col.Name]).year() <= 1900)
                                obj[col.Name] = '';
                            else
                                obj[col.Name] = col.DataType === 'datetimeutc' ? moment.utc(obj[col.Name]) : moment(obj[col.Name]);
                        }

                        if (col.IsKey) {
                            obj.$key += obj[col.Name] + ',';
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