(function() {
    'use strict';

    angular.module('tubular.services').service('tubularTemplateService', [
        '$templateCache',
        function tubularTemplateService($templateCache) {
            var me = this;

            me.generatePopup = function(model, title) {
                var templateName = 'temp' + (new Date().getTime()) + '.html';
                var template = tubularTemplateServiceModule.generatePopup(model, title);

                $templateCache.put(templateName, template);

                return templateName;
            };

            me.createColumns = function(model) {
                return tubularTemplateServiceModule.createColumns(model);
            }

            me.generateForm = function(fields, options) {
                return tubularTemplateServiceModule.generateForm(fields, options);
            };

            me.generateGrid = function(columns, options) {
                return tubularTemplateServiceModule.generateGrid(columns, options);
            };
        }
    ]);
})();