(function() {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularTemplateService
         *
         * @description
         * Use `tubularTemplateService` to generate `tbGrid` and `tbForm` templates.
         * 
         * This service is just a facade to the node module expose like `tubularTemplateServiceModule`.
         */
        .service('tubularTemplateService', [
            '$templateCache',
            function tubularTemplateService($templateCache) {
                var me = this;

                me.enums = tubularTemplateServiceModule.enums;
                me.defaults = tubularTemplateServiceModule.defaults;

                me.generatePopup = function(model, title) {
                    var templateName = 'temp' + (new Date().getTime()) + '.html';
                    var template = tubularTemplateServiceModule.generatePopup(model, title);

                    $templateCache.put(templateName, template);

                    return templateName;
                };

                me.createColumns = function(model) {
                    return tubularTemplateServiceModule.createColumns(model);
                };

                me.generateForm = function(fields, options) {
                    return tubularTemplateServiceModule.generateForm(fields, options);
                };

                me.generateGrid = function(columns, options) {
                    return tubularTemplateServiceModule.generateGrid(columns, options);
                };
            }
        ]);
})();