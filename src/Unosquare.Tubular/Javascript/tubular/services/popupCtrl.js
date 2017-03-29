(function (angular) {
    'use strict';

    angular.module('tubular.services')
        .controller('popupCtrl', [
            '$rootScope',
            '$scope',
            '$uibModalInstance',
            'model',
            'gridScope',
            function (
                $rootScope,
                $scope,
                $uibModalInstance,
                model,
                gridScope) {

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
                            $uibModalInstance.close();

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

                    $uibModalInstance.close();
                };
            }
        ]);
})(angular);