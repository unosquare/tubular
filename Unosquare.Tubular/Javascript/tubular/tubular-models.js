(function() {
    'use strict';

   /**                                           
    * @ngdoc module
    * @name tubular.models
    * 
    * @description
    * Tubular Models module. 
    * 
    * It contains model's factories to be use in {@link tubular.directives} like `tubularModel` and `tubulargGridColumnModel`.
    */
    angular.module('tubular.models', [])
       /**
        * @ngdoc factory
        * @name tubulargGridColumnModel
        *
        * @description
        * The `tubulargGridColumnModel` factory is the base to generate a column model to use with `tbGrid`.
        * 
        * This model doesn't need to be created in your controller, the `tbGrid` generate it from any `tbColumn`.
        */
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
                this.Sortable = attrs.sortable === "true";
                this.SortOrder = parseInt(attrs.sortOrder) || -1;
                this.SortDirection = parseSortDirection(attrs.sortDirection);
                this.IsKey = attrs.isKey === "true";
                this.Searchable = attrs.searchable === "true";
                this.Visible = attrs.visible === "false" ? false : true;
                this.Filter = null;
                this.DataType = attrs.columnType || "string";
                this.IsGrouping = attrs.isGrouping === "true";

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
        /**
        * @ngdoc factory
        * @name tubulargGridFilterModel
        *
        * @description
        * The `tubulargGridFilterModel` factory is the base to generate a filter model to use with `tbGrid`.
        * 
        * This model doesn't need to be created in your controller, the `tubularGridFilterService` generate it.
        */
        .factory('tubulargGridFilterModel', function() {

            return function(attrs) {
                this.Text = attrs.text || null;
                this.Argument = attrs.argument || null;
                this.Operator = attrs.operator || 'Contains';
                this.OptionsUrl = attrs.optionsUrl || null;
            };
        })
        /**
        * @ngdoc factory
        * @name tubularModel
        *
        * @description
        * The `tubularModel` factory is the base to generate a row model to use with `tbGrid` and `tbForm`.
        */
        .factory('tubularModel', [
            '$timeout', '$location', function($timeout, $location) {
                return function($scope, data, dataService) {
                    var obj = {
                        $key: "",
                        $count: 0,
                        $addField: function(key, value) {
                            this.$count++;

                            this[key] = value;
                            if (angular.isUndefined(this.$original)) this.$original = {};
                            this.$original[key] = value;

                            if (angular.isUndefined(this.$state)) this.$state = {};
                            this.$state[key] = {
                                $valid: function() {
                                    return this.$errors.length === 0;
                                },
                                $errors: []
                            };

                            $scope.$watch(function() {
                                return obj[key];
                            }, function(newValue, oldValue) {
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
                        angular.forEach($scope.columns, function(col, key) {
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
                    obj.$isNew = false;

                    for (var k in obj) {
                        if (obj.hasOwnProperty(k)) {
                            if (k[0] == '$') continue;

                            obj.$state[k] = {
                                $valid: function() {
                                    return this.$errors.length == 0;
                                },
                                $errors: []
                            };
                        }
                    }

                    obj.$valid = function() {
                        for (var k in obj.$state) {
                            if (obj.$state.hasOwnProperty(k)) {
                                var key = k;
                                if (angular.isUndefined(obj.$state[key]) ||
                                    obj.$state[key] == null ||
                                    angular.isUndefined(obj.$state[key].$valid)) continue;

                                if (obj.$state[key].$valid()) continue;

                                return false;
                            }
                        }

                        return true;
                    };

                    // Returns a save promise
                    obj.save = function() {
                        if (angular.isUndefined(dataService) || dataService == null)
                            throw 'Define DataService to your model.';

                        if (angular.isUndefined($scope.serverSaveUrl) || $scope.serverSaveUrl == null)
                            throw 'Define a Save URL.';

                        if (obj.$hasChanges == false) return false;

                        obj.$isLoading = true;

                        if (obj.$isNew) {
                            return dataService.retrieveDataAsync({
                                serverUrl: $scope.serverSaveUrl,
                                requestMethod: $scope.serverSaveMethod,
                                data: obj
                            }).promise;
                        } else {
                            return dataService.saveDataAsync(obj, {
                                serverUrl: $scope.serverSaveUrl,
                                requestMethod: 'PUT'
                            }).promise;
                        }
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
                            if (obj.$original.hasOwnProperty(k)) {
                                obj.$original[k] = obj[k];
                            }
                        }
                    };

                    obj.revertChanges = function() {
                        for (var k in obj) {
                            if (obj.hasOwnProperty(k)) {
                                if (k[0] == '$' || angular.isUndefined(obj.$original[k])) {
                                    continue;
                                }

                                obj[k] = obj.$original[k];
                            }
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