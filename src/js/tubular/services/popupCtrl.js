(angular => {
    'use strict';

    angular.module('tubular.services')
        .controller('GenericPopupController', [
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

                $scope.savePopup = (innerModel, forceUpdate) => {
                    innerModel = innerModel || $scope.Model;

                    // If we have nothing to save and it's not a new record, just close
                    if (!forceUpdate && !innerModel.$isNew && !innerModel.$hasChanges()) {
                        $scope.closePopup();
                        return null;
                    }

                    return gridScope.saveRow(innerModel, forceUpdate).then(() => $uibModalInstance.close());
                };

                $scope.closePopup = () => {
                    if (angular.isDefined($scope.Model.revertChanges)) {
                        $scope.Model.revertChanges();
                    }

                    $uibModalInstance.close();
                };

                $scope.onSave = () => {
                    $scope.closePopup();
                    gridScope.retrieveData();
                };
            }
        ]);
})(angular);