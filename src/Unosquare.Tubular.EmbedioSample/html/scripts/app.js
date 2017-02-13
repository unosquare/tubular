(function(angular) {
    'use strict';

    angular.module('app', [
            'ngRoute',
            'toastr',
            'tubular'
        ]).controller('TitleController', [
            '$scope', '$route', function($scope, $route) {
                var me = this;
                me.content = "Home";
                $scope.$on('$routeChangeSuccess', function() {
                    me.content = $route.current.title;
                });
            }
        ])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', 'toastr', function ($scope, $location, toastr) {
                $scope.$on('tbGrid_OnBeforeRequest', function (event, eventData) { console.log(eventData); });

                $scope.$on('tbGrid_OnRemove', function () { toastr.success("Record removed"); });

                $scope.$on('tbGrid_OnConnectionError', function (error) { toastr.error(error.statusText || "Connection error"); });

                $scope.$on('tbGrid_OnSavingNoChanges', function() {
                    toastr.warning("Nothing to save");
                    $location.path('/');
                });
            }
        ]);
})(angular);