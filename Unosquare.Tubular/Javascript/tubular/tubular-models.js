(function() {
        'use strict';
        
        angular.module('tubular.models', [])
            .factory('tubulargGridColumnModel', function() {

                var parseSortDirection = function(value) {
                    if (angular.isUndefined(value))
                        return 'None';

                    if (value.indexOf('Asc') === 0 || value.indexOf('asc') === 0)
                        return 'Ascending';
                    if (value.indexOf('Desc') === 0 || value.indexOf('desc') === 0)
                        return 'Descending';

                    return 'None';
                };

                return function(attrs) {
                    this.Name = attrs.name || null;
                    this.Label = attrs.label || null;
                    this.Sortable = attrs.sortable === "true" ? true : false;
                    this.SortOrder = parseInt(attrs.sortOrder) || -1;
                    this.SortDirection = parseSortDirection(attrs.sortDirection);
                    this.IsKey = attrs.isKey === "true" ? true : false;
                    this.Searchable = attrs.searchable === "true" ? true : false;
                    this.Filter = null;
                    this.DataType = attrs.columnType || "string";

                    this.FilterOperators = {
                        'string': {
                            'None': 'None',
                            'Equals': 'Equals',
                            'Contains': 'Contains',
                            'StartsWith': 'Starts With',
                            'EndsWith': 'Ends With'
                        },
                        'numeric': {
                            'None': 'None',
                            'Equals': 'Equals',
                            'Between': 'Between',
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<',
                        },
                        'date': {
                            'None': 'None',
                            'Equals': 'Equals',
                            'Between': 'Between',
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<',
                        },
                        'datetime': {
                            'None': 'None',
                            'Equals': 'Equals',
                            'Between': 'Between',
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<',
                        },
                        'boolean': {
                            'None': 'None',
                            'Equals': 'Equals',
                        }
                    };
                };
            })
            .factory('tubulargGridFilterModel', function() {

                return function(attrs) {
                    this.Text = attrs.text || null;
                    this.Argument = attrs.argument || null;
                    this.Operator = attrs.operator || null;
                    this.OptionsUrl = attrs.optionsUrl || null;
                };
            })
            .factory('tubularModel', [
                '$timeout', '$location', function ($timeout, $location) {
                    return function ($scope, data) {
                        var obj = {
                            $key: "",
                            $addField: function (key, value) {
                                this[key] = value;
                                if (angular.isUndefined(this.$original)) this.$original = {};
                                this.$original[key] = value;

                                if (angular.isUndefined(this.$state)) this.$state = {};
                                this.$state[key] = {
                                    $valid: function() {
                                        return this.$errors.length == 0;
                                    },
                                    $errors: []
                                };

                                $scope.$watch(function () {
                                    return obj[key];
                                }, function (newValue, oldValue) {
                                    if (newValue == oldValue) return;
                                    obj.$hasChanges = obj[key] != obj.$original[key];
                                });
                            }
                        };

                        if (angular.isArray(data) == false) {
                            angular.forEach(Object.keys(data), function(name) {
                                obj.$addField(name, data[name]);
                            });
                        }

                        if (angular.isDefined($scope.columns)) {
                            angular.forEach($scope.columns, function (col, key) {
                                var value = data[key] || data[col.Name];

                                if (angular.isUndefined(value) && data[key] === 0)
                                    value = 0;

                                obj.$addField(col.Name, value);

                                if (col.DataType == "date" || col.DataType == "datetime") {
                                    var timezone = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
                                    timezone = timezone.substr(0, timezone.length - 2) + ':' + timezone.substr(timezone.length - 2, 2);
                                    var tempDate = new Date(Date.parse(obj[col.Name] + timezone));

                                    if (col.DataType == "date") {
                                        obj[col.Name] = new Date(1900 + tempDate.getYear(), tempDate.getMonth(), tempDate.getDate());
                                    } else {
                                        obj[col.Name] = new Date(1900 + tempDate.getYear(), tempDate.getMonth(), tempDate.getDate(), tempDate.getHours(), tempDate.getMinutes(), tempDate.getSeconds(), 0);
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

                        obj.$isEditing = false;
                        obj.$hasChanges = false;
                        obj.$selected = false;

                        for (var k in obj) {
                            if (k[0] == '$') continue;

                            obj.$state[k] = {
                                $valid: function() {
                                    return this.$errors.length == 0;
                                },
                                $errors: []
                            };
                        }

                        obj.$valid = function () {
                            for (var k in obj.$state) {
                                var key = k;
                                if (angular.isUndefined(obj.$state[key]) ||
                                    obj.$state[key] == null ||
                                    angular.isUndefined(obj.$state[key].$valid)) continue;

                                if (obj.$state[key].$valid()) continue;

                                return false;
                            }

                            return true;
                        };

                        obj.save = function () {
                            return obj.$hasChanges ? $scope.updateRow(obj) : false;
                        };

                        obj.edit = function() {
                            if (obj.$isEditing && obj.$hasChanges) {
                                obj.save();
                            }

                            obj.$isEditing = !obj.$isEditing;
                        };

                        obj.delete = function() {
                            $scope.deleteRow(obj);
                        };

                        obj.resetOriginal = function() {
                            for (var k in obj.$original) {
                                obj.$original[k] = obj[k];
                            }
                        };

                        obj.revertChanges = function() {
                            for (var k in obj) {
                                if (k[0] == '$' || angular.isUndefined(obj.$original[k])) {
                                    continue;
                                }

                                obj[k] = obj.$original[k];
                            }

                            obj.$isEditing = false;
                            obj.$hasChanges = false;
                        };

                        obj.editForm = function(view) {
                            $location.path(view + "/" + obj.$key);
                        };

                        return obj;
                    };
                }
            ]);
    })();