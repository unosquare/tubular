(function (angular) {
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
        * @name tubularGridColumnModel
        *
        * @description
        * The `tubularGridColumnModel` factory is the base to generate a column model to use with `tbGrid`.
        * 
        * This model doesn't need to be created in your controller, the `tbGrid` generate it from any `tbColumn`.
        */
        .factory('tubularGridColumnModel', [
            "$filter", function($filter) {

                var parseSortDirection = function(value) {
                    if (angular.isUndefined(value)) {
                        return 'None';
                    }

                    if (value.toLowerCase().indexOf('asc') === 0) {
                        return 'Ascending';
                    }

                    if (value.toLowerCase().indexOf('desc') === 0) {
                        return 'Descending';
                    }

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
                    this.Aggregate = attrs.aggregate || "none";
                    this.MetaAggregate = attrs.metaAggregate || "none";

                    this.FilterOperators = {
                        'string': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Contains': $filter('translate')('OP_CONTAINS'),
                            'NotContains': $filter('translate')('OP_NOTCONTAINS'),
                            'StartsWith': $filter('translate')('OP_STARTSWITH'),
                            'NotStartsWith': $filter('translate')('OP_NOTSTARTSWITH'),
                            'EndsWith': $filter('translate')('OP_ENDSWITH'),
                            'NotEndsWith': $filter('translate')('OP_NOTENDSWITH')
                        },
                        'numeric': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'date': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'datetime': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'datetimeutc': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS'),
                            'Between': $filter('translate')('OP_BETWEEN'),
                            'Gte': '>=',
                            'Gt': '>',
                            'Lte': '<=',
                            'Lt': '<'
                        },
                        'boolean': {
                            'None': $filter('translate')('OP_NONE'),
                            'Equals': $filter('translate')('OP_EQUALS'),
                            'NotEquals': $filter('translate')('OP_NOTEQUALS')
                        }
                    };
                };
            }
        ])
        /**
        * @ngdoc factory
        * @name tubularModel
        *
        * @description
        * The `tubularModel` factory is the base to generate a row model to use with `tbGrid` and `tbForm`.
        */
        .factory('tubularModel', function() {
            return function($scope, $ctrl, data, dataService) {
                var obj = {
                    $key: "",
                    $addField: function(key, value, ignoreOriginal) {
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

                        $scope.$watch(function() {
                            return obj[key];
                        }, function(newValue, oldValue) {
                            if (newValue === oldValue) return;
                            obj.$hasChanges = obj[key] !== obj.$original[key];
                        });
                    }
                };

                if (angular.isArray(data) === false) {
                    angular.forEach(Object.keys(data), function(name) {
                        obj.$addField(name, data[name]);
                    });
                }

                if (angular.isDefined($ctrl.columns)) {
                    angular.forEach($ctrl.columns, function(col, key) {
                        var value = data[key] || data[col.Name];

                        if (angular.isUndefined(value) && data[key] === 0) {
                            value = 0;
                        }

                        obj.$addField(col.Name, value);

                        if (col.DataType === "date" || col.DataType === "datetime" || col.DataType === "datetimeutc") {
                            var timezone = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
                            timezone = timezone.substr(0, timezone.length - 2) + ':' + timezone.substr(timezone.length - 2, 2);
                            var tempDate = new Date(Date.parse(obj[col.Name] + timezone));

                            if (col.DataType === "date") {
                                obj[col.Name] = new Date(1900 + tempDate.getYear(), tempDate.getMonth(), tempDate.getDate());
                            } else {
                                obj[col.Name] = new Date(1900 + tempDate.getYear(),
                                    tempDate.getMonth(), tempDate.getDate(), tempDate.getHours(),
                                    tempDate.getMinutes(), tempDate.getSeconds(), 0);
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

                obj.$valid = function() {
                    var valid = true;

                    angular.forEach(obj.$state, function(val) {
                        if (angular.isUndefined(val) || !val.$valid() || !val.$dirty()) {
                            valid = false;
                        }
                    });

                    return valid;
                };

                // Returns a save promise
                obj.save = function(forceUpdate) {
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

                obj.edit = function() {
                    if (obj.$isEditing && obj.$hasChanges) {
                        obj.save();
                    }

                    obj.$isEditing = !obj.$isEditing;
                };

                obj.delete = function() {
                    $ctrl.deleteRow(obj);
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
                            if (k[0] === '$' || angular.isUndefined(obj.$original[k])) {
                                continue;
                            }

                            obj[k] = obj.$original[k];
                        }
                    }

                    obj.$isEditing = false;
                    obj.$hasChanges = false;
                };

                return obj;
            };
        });
})(window.angular);