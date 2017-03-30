(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc factory
         * @name tubularPopupService
         *
         * @description
         * Use `tubularPopupService` to show or generate popups with a `tbForm` inside.
         */
        .factory('tubularPopupService', [
            '$uibModal',
            '$rootScope',
            'tubularTemplateService',
            function (
                $uibModal,
                $rootScope,
                tubularTemplateService) {

                return {
                    onSuccessForm: function (callback) {
                        var successHandle = $rootScope.$on('tbForm_OnSuccessfulSave', callback);

                        $rootScope.$on('$destroy', successHandle);
                    },

                    onConnectionError: function (callback) {
                        var errorHandle = $rootScope.$on('tbForm_OnConnectionError', callback);

                        $rootScope.$on('$destroy', errorHandle);
                    },

                    /**
                     * Opens a new Popup
                     * 
                     * @param {string} template 
                     * @param {object} model 
                     * @param {object} gridScope 
                     * @param {string} size 
                     * @returns {object} The Popup instance
                     */
                    openDialog: function (template, model, gridScope, size) {
                        if (angular.isUndefined(template)) {
                            template = tubularTemplateService.generatePopup(model);
                        }

                        var dialog = $uibModal.open({
                            templateUrl: template,
                            backdropClass: 'fullHeight',
                            animation: false,
                            size: size,
                            controller: 'GenericPopupController',
                            resolve: {
                                model: function () {
                                    return model;
                                },
                                gridScope: function () {
                                    return gridScope;
                                }
                            }
                        });

                        return dialog;
                    }
                };
            }
        ]);
})(angular);