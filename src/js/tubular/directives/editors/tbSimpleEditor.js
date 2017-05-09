(angular => {
    'use strict';

    const tbSimpleEditorCtrl = ['tubularEditorService', '$scope', 'translateFilter', 'filterFilter',
        function (tubular, $scope, translateFilter, filterFilter) {
            const $ctrl = this;

            $ctrl.validate = () => {
                if ($ctrl.regex && $ctrl.value) {
                    const patt = new RegExp($ctrl.regex);

                    if (patt.test($ctrl.value) === false) {
                        $ctrl.$valid = false;
                        $ctrl.state.$errors = [$ctrl.regexErrorMessage || translateFilter('EDITOR_REGEX_DOESNT_MATCH')];
                        return;
                    }
                }

                if ($ctrl.match) {
                    if ($ctrl.value !== $ctrl.$component.model[$ctrl.match]) {
                        const label = filterFilter($ctrl.$component.fields, { name: $ctrl.match }, true)[0].label;
                        $ctrl.$valid = false;
                        $ctrl.state.$errors = [translateFilter('EDITOR_MATCH', label)];
                        return;
                    }
                }

                if ($ctrl.min && $ctrl.value) {
                    if ($ctrl.value.length < parseInt($ctrl.min)) {
                        $ctrl.$valid = false;
                        $ctrl.state.$errors = [translateFilter('EDITOR_MIN_CHARS', $ctrl.min)];
                        return;
                    }
                }

                if ($ctrl.max && $ctrl.value) {
                    if ($ctrl.value.length > parseInt($ctrl.max)) {
                        $ctrl.$valid = false;
                        $ctrl.state.$errors = [translateFilter('EDITOR_MAX_CHARS', $ctrl.max)];
                        return;
                    }
                }
            };

            $ctrl.$onInit = () => tubular.setupScope($scope, null, $ctrl, false);
        }];

    angular.module('tubular.directives')
        /**
         * @ngdoc component
         * @name tbSimpleEditor
         * @module tubular.directives
         *
         * @description
         * The `tbSimpleEditor` component is the basic input to show in a grid or form.
         * It uses the `TubularModel` to retrieve column or field information.
         *
         * @param {string} name Set the field name.
         * @param {object} value Set the value.
         * @param {boolean} isEditing Indicate if the field is showing editor.
         * @param {string} editorType Set what HTML input type should display.
         * @param {boolean} showLabel Set if the label should be display.
         * @param {string} label Set the field's label otherwise the name is used.
         * @param {string} placeholder Set the placeholder text.
         * @param {string} help Set the help text.
         * @param {boolean} required Set if the field is required.
         * @param {boolean} readOnly Set if the field is read-only.
         * @param {number} min Set the minimum characters.
         * @param {number} max Set the maximum characters.
         * @param {string} regex Set the regex validation text.
         * @param {string} regexErrorMessage Set the regex validation error message.
         * @param {string} match Set the field name to match values.
         * @param {string} defaultValue Set the default value.
         */
        .component('tbSimpleEditor',
        {
            templateUrl: 'tbSimpleEditor.tpl.html',
            bindings: {
                regex: '@?',
                regexErrorMessage: '@?',
                value: '=?',
                isEditing: '=?',
                editorType: '@',
                showLabel: '=?',
                label: '@?',
                required: '=?',
                min: '=?',
                max: '=?',
                name: '@',
                placeholder: '@?',
                readOnly: '=?',
                help: '@?',
                defaultValue: '@?',
                match: '@?'
            },
            controller: tbSimpleEditorCtrl
        });
})(angular);