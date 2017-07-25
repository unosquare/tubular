(angular => {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc directive
         * @name tbForm
         * @module tubular.directives
         * @restrict E
         *
         * @description
         * The `tbForm` directive is the base to create any form powered by Tubular. Define
         * `modelKey` to auto-load a record. The `serverSaveUrl` can be used to create a new or update
         * an existing record.
         *
         * Please don't bind a controller directly to the `tbForm`, Angular will throw an exception. If you want
         * to extend the form behavior put a controller in a upper node like a div.
         *
         * The `save` method can be forced to update a model against the REST service, otherwise if the Model
         * doesn't detect any change will ignore the save call.
         *
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverSaveMethod Set HTTP Method to save data.
         * @param {object} model The object model to show in the form.
         * @param {string} modelKey Defines the fields to use like Keys.
         * @param {string} formName Defines the form name.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         */
        .directive('tbForm',
        [
            function() {
                return {
                    templateUrl: 'tbForm.tpl.html',
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    scope: {
                        model: '=?',
                        serverUrl: '@',
                        serverSaveUrl: '@',
                        serverSaveMethod: '@',
                        modelKey: '@?',
                        requireAuthentication: '=?',
                        name: '@?formName',
                        onSave: '=?',
                        onError: '=?',
                    },
                    controller: 'tbFormController',
                    compile: () => ({ post: scope => scope.finishDefinition() })
                };
            }
        ]);
})(angular);