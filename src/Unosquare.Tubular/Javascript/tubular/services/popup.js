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
                            controller:
                                // TODO: Move out of this scope
                                [
                                '$scope', function ($scope) {
                                    $scope.Model = model;

                                    $scope.savePopup = function (innerModel, forceUpdate) {
                                        innerModel = innerModel || $scope.Model;

                                        // If we have nothing to save and it's not a new record, just close
                                        if (!forceUpdate && !innerModel.$isNew && !innerModel.$hasChanges) {
                                            $scope.closePopup();
                                            return null;
                                        }

                                        var result = innerModel.save(forceUpdate);

                                        if (angular.isUndefined(result) || result === false) {
                                            return null;
                                        }

                                        result.then(
                                            function (data) {
                                                $scope.$emit('tbForm_OnSuccessfulSave', data);
                                                $rootScope.$broadcast('tbForm_OnSuccessfulSave', data);
                                                $scope.Model.$isLoading = false;
                                                if (gridScope.autoRefresh) gridScope.retrieveData();
                                                dialog.close();

                                                return data;
                                            },
                                            function (error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                                $rootScope.$broadcast('tbForm_OnConnectionError', error);
                                                $scope.Model.$isLoading = false;

                                                return error;
                                            });

                                        return result;
                                    };

                                    $scope.closePopup = function () {
                                        if (angular.isDefined($scope.Model.revertChanges)) {
                                            $scope.Model.revertChanges();
                                        }

                                        dialog.close();
                                    };
                                }
                                ]
                        });

                        return dialog;
                    }
                };
            }
        ]);
})(angular);