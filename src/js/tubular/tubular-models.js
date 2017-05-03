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
        .factory('tubularModel', ['tubularHttp', function (tubularHttp) {
            return function ($scope, $ctrl, data) {
                var obj = {
                    $key: '',
                    $fields: [],
                    $addField: function (key, value, ignoreOriginal) {
                        if (this.$fields.indexOf(key) >= 0) return;
                        this[key] = value;
                        this.$fields.push(key);
                        this.$original = this.$original || {};

                        this.$original[key] = ignoreOriginal ? undefined : value;

                        if (ignoreOriginal) {
                            this.$hasChanges = true;
                        }

                        this.$state = this.$state || {};

                        $scope.$watch(function () {
                            return obj[key];
                        }, function (newValue, oldValue) {
                            if (newValue === oldValue) return;
                            obj.$hasChanges = obj[key] !== obj.$original[key];
                        });
                    }
                };

                if (angular.isArray(data) === false) {
                    angular.forEach(Object.keys(data), function (name) {
                        obj.$addField(name, data[name]);
                    });
                }

                if (angular.isDefined($ctrl.columns)) {
                    angular.forEach($ctrl.columns, function (col, key) {
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

                obj.$hasChanges = obj.$isEditing = false;
                obj.$selected = false;
                obj.$isNew = false;

                obj.$valid = function () {
                    var valid = true;

                    angular.forEach(obj.$state, function (val) {
                        if (angular.isUndefined(val) || val.$valid()) return;

                        valid = false;
                    });

                    return valid;
                };

                // Returns a save promise
                obj.save = function (forceUpdate) {
                    if (angular.isUndefined($ctrl.serverSaveUrl) || $ctrl.serverSaveUrl == null) {
                        throw 'Define a Save URL.';
                    }

                    if (!forceUpdate && !obj.$isNew && !obj.$hasChanges) {
                        return false;
                    }

                    obj.$isLoading = true;

                    return tubularHttp.saveDataAsync(obj, {
                        serverUrl: $ctrl.serverSaveUrl,
                        requestMethod: obj.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT'
                    });
                };

                obj.edit = function () {
                    if (obj.$isEditing && obj.$hasChanges) {
                        obj.save();
                    }

                    obj.$isEditing = !obj.$isEditing;
                };

                obj.delete = function () {
                    $ctrl.deleteRow(obj);
                };

                obj.resetOriginal = function () {
                    angular.forEach(obj.$original, function (k) {
                        obj.$original[k] = obj[k];
                    });
                };

                obj.revertChanges = function () {
                    angular.forEach(Object.keys(obj), function (k) {
                        if (k[0] === '$' || angular.isUndefined(obj.$original[k])) {
                            return;
                        }

                        obj[k] = obj.$original[k];
                    });

                    obj.$hasChanges = obj.$isEditing = false;
                };

                return obj;
            };
        }]);
})(angular, moment);