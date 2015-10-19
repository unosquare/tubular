(function() {
    'use strict';

    angular.module('app.reporting', ['tubular.services'])
        .controller("reportingCtrl", function($scope) {
            $scope.$on('tbReporting_OnConnectionError', function(event, error) { toastr.error(error); });
            $scope.$on('tbReporting_OnSuccessfulSave', function(event, message) { toastr.success(message); });
            $scope.$on('tbReporting_OnRemoved', function(event, message) { toastr.success(message); });
        });
})();