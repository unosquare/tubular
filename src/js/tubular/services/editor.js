﻿(function(angular) {
  'use strict';

  angular.module('tubular.services')
    /**
     * @ngdoc service
     * @name tubularEditorService
     *
     * @description
     * The `tubularEditorService` service is a internal helper to setup any `TubularModel` with a UI.
     */
    .factory('tubularEditorService', ['translateFilter', editorService]);

  function editorService(translateFilter) {
    return {

      /**
       * Setups a new Editor, this functions is like a common class constructor to be used
       * with all the tubularEditors.
       */
      setupScope: setupScope
    }

    function setupScope(scope, defaultFormat, ctrl, setDirty) {
      ctrl = ctrl || scope;
      ctrl.isEditing = angular.isUndefined(ctrl.isEditing) ? true : ctrl.isEditing;
      ctrl.showLabel = ctrl.showLabel || false;
      ctrl.label = ctrl.label || (ctrl.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
      ctrl.required = ctrl.required || false;
      ctrl.readOnly = ctrl.readOnly || false;
      ctrl.format = ctrl.format || defaultFormat;
      ctrl.$valid = true;

      // This is the state API for every property in the Model
      ctrl.state = {
        $valid: () => {
          ctrl.checkValid();
          return ctrl.state.$errors.length === 0;
        },
        $dirty: ctrl.$dirty,
        $errors: []
      };

      // Get the field reference using the Angular way
      ctrl.getFormField = () => {
        let parent = scope.$parent;

        while (parent != null) {
          if (parent.tubularDirective === 'tubular-form') {
            const formScope = parent.getFormScope();

            return formScope == null ? null : formScope[scope.Name];
          }

          parent = parent.$parent;
        }

        return null;
      };

      ctrl.$dirty = () => {
        // Just forward the property
        const formField = ctrl.getFormField();

        return formField == null ? true : formField.$dirty;
      };

      ctrl.checkValid = () => {
        ctrl.$valid = true;
        ctrl.state.$errors = [];

        if ((angular.isUndefined(ctrl.value) && ctrl.required) ||
          (angular.isDate(ctrl.value) && isNaN(ctrl.value.getTime()) && ctrl.required)) {
          ctrl.$valid = false;
          ctrl.state.$errors = [translateFilter('EDITOR_REQUIRED')];

          if (angular.isDefined(scope.$parent.Model)) {
            scope.$parent.Model.$state[scope.Name] = ctrl.state;
          }

          return;
        }

        // Check if we have a validation function, otherwise return
        if (angular.isDefined(ctrl.validate)) {
          ctrl.validate();
        }
      };

      scope.$watch(() => ctrl.value, (newValue, oldValue) => {
        if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) {
          return;
        }

        ctrl.$valid = true;

        // Try to match the model to the parent, if it exists
        if (angular.isDefined(scope.$parent.Model)) {
          if (angular.isUndefined(scope.$parent.Model.$fields)) {
            scope.$parent.Model.$fields = [];
          }

          if (scope.$parent.Model.$fields.indexOf(ctrl.name) !== -1) {
            scope.$parent.Model[ctrl.name] = newValue;
            scope.$parent.Model.$state = scope.$parent.Model.$state || [];
            scope.$parent.Model.$state[scope.Name] = ctrl.state;
          } else if (angular.isDefined(scope.$parent.Model.$addField)) {
            scope.$parent.Model.$addField(ctrl.name, newValue, true);
          }
        }

        ctrl.checkValid();
      });

      let parent = scope.$parent;

      // We try to find a Tubular Form in the parents
      while (parent != null) {
        if (parent.tubularDirective === 'tubular-form' ||
          parent.tubularDirective === 'tubular-rowset') {

          if (ctrl.name === null) {
            return;
          }

          ctrl.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

          scope.Name = ctrl.name;

          ctrl.bindScope = () => {
            scope.$parent.Model = parent.model;

            if (angular.equals(ctrl.value, parent.model[scope.Name]) === false) {
              if (angular.isDefined(parent.model[scope.Name])) {
                if ((ctrl.DataType === 'date' || ctrl.DataType === 'datetime') &&
                  parent.model[scope.Name] != null && angular.isString(parent.model[scope.Name])) {
                  if (parent.model[scope.Name] === '' || parent.model[scope.Name] === null) {
                    ctrl.value = parent.model[scope.Name];
                  } else {
                    ctrl.value = moment(parent.model[scope.Name]);
                  }
                } else {
                  ctrl.value = parent.model[scope.Name];
                }
              }

              parent.$watch(() => ctrl.value, value => {
                if (value !== parent.model[scope.Name]) {
                  parent.model[scope.Name] = value;
                }
              });
            }

            scope.$watch(() => parent.model[scope.Name], value => {
              if (value !== ctrl.value) {
                ctrl.value = value;
              }
            }, true);

            if (ctrl.value == null && (ctrl.defaultValue && ctrl.defaultValue != null)) {
              if ((ctrl.DataType === 'date' || ctrl.DataType === 'datetime') && angular.isString(ctrl.defaultValue)) {
                ctrl.defaultValue = new Date(ctrl.defaultValue);
              }

              if (ctrl.DataType === 'numeric' && angular.isString(ctrl.defaultValue)) {
                ctrl.defaultValue = parseFloat(ctrl.defaultValue);
              }

              ctrl.value = ctrl.defaultValue;
            }

            parent.model.$state = parent.model.$state || {};

            // This is the state API for every property in the Model
            parent.model.$state[scope.Name] = {
              $valid: () => {
                ctrl.checkValid();
                return ctrl.state.$errors.length === 0;
              },
              $dirty: ctrl.$dirty,
              $errors: ctrl.state.$errors
            };

            if (angular.equals(ctrl.state, parent.model.$state[scope.Name]) === false) {
              ctrl.state = parent.model.$state[scope.Name];
            }

            if (setDirty) {
              const formScope = ctrl.getFormField();

              if (formScope) {
                formScope.$setDirty();
              }
            }
          };

          parent.fields.push(ctrl);

          break;
        }

        parent = parent.$parent;
      }
    }
  }
})(angular);
