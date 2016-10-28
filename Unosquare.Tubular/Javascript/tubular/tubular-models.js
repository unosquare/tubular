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
        .factory('tubularModel', function () {
            return function ($scope, $ctrl, data, dataService) {
                var obj = {
                    $key: "",
                    $addField: function (key, value, ignoreOriginal) {
                        this[key] = value;
                        if (angular.isUndefined(this.$original)) {
                            this.$original = {};
                        }

                        this.$original[key] = ignoreOriginal ? undefined : value;

                        if (ignoreOriginal) {
                            this.$hasChanges = true;
                        }

                        if (angular.isUndefined(this.$state)) {
                            this.$state = {};
                        }

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

                        if (col.DataType === "date" || col.DataType === "datetime" || col.DataType === "datetimeutc") {
                            if (typeof moment == 'function') {
                                if (col.DataType === "datetimeutc") {
                                    obj[col.Name] = moment.utc(obj[col.Name]);
                                } else {
                                    obj[col.Name] = moment(obj[col.Name]);
                                }
                            } else {
                                if (!obj[col.Name]) {
                                    obj[col.Name] = new Date();
                                } else {
                                    var timezone = new Date(Date.parse(obj[col.Name])).toString().match(/([-\+][0-9]+)\s/)[1];
                                    timezone = timezone.substr(0, timezone.length - 2) + ':' + timezone.substr(timezone.length - 2, 2);
                                    var tempDate = new Date(Date.parse(obj[col.Name].replace('Z', '') + timezone));

                                    if (col.DataType === "date") {
                                        obj[col.Name] = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
                                    } else {
                                        obj[col.Name] = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(),
                                            tempDate.getHours(), tempDate.getMinutes(), tempDate.getSeconds(), 0);
                                    }
                                }
                            }
                        }

                        if (col.IsKey) {
                            obj.$key += obj[col.Name] + ",";
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
                    if (angular.isUndefined(dataService) || dataService == null) {
                        throw 'Define DataService to your model.';
                    }

                    if (angular.isUndefined($ctrl.serverSaveUrl) || $ctrl.serverSaveUrl == null) {
                        throw 'Define a Save URL.';
                    }

                    if (!forceUpdate && !obj.$isNew && !obj.$hasChanges) {
                        return false;
                    }

                    obj.$isLoading = true;

                    return dataService.saveDataAsync(obj, {
                        serverUrl: $ctrl.serverSaveUrl,
                        requestMethod: obj.$isNew ? ($ctrl.serverSaveMethod || 'POST') : 'PUT'
                    }).promise;
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
                    angular.forEach(obj, function (k) {
                        if (k[0] === '$' || angular.isUndefined(obj.$original[k])) {
                            return;
                        }

                        obj[k] = obj.$original[k];
                    });

                    obj.$hasChanges = obj.$isEditing = false;
                };

                return obj;
            };
        });
})(window.angular, window.moment || null);