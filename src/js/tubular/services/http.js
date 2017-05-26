(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularHttp
         *
         * @description
         * Use `tubularHttp` to connect a grid or a form to a HTTP Resource. Internally this service is
         * using `$http` to make all the request.
         *
         * This service provides authentication using bearer-tokens. Based on https://bitbucket.org/david.antaramian/so-21662778-spa-authentication-example
         */
        .service('tubularHttp', [
            '$http',
            '$q',
            '$document',
            'tubularConfig',
            '$window',
            function (
                $http,
                $q,
                $document,
                tubularConfig,
                $window) {
                const authData = 'auth_data';
                const prefix = tubularConfig.localStorage.prefix();
                const me = this;

                function init() {
                    const savedData = angular.fromJson($window.localStorage.getItem(prefix + authData));

                    if (savedData != null) {
                        me.userData = savedData;
                    }
                }

                function isAuthenticationExpired(expirationDate) {
                    const now = new Date();
                    expirationDate = new Date(expirationDate);

                    return expirationDate - now <= 0;
                }

                me.userData = {
                    isAuthenticated: false,
                    username: '',
                    bearerToken: '',
                    expirationDate: null
                };

                me.isBearerTokenExpired = () => isAuthenticationExpired(me.userData.expirationDate);

                me.isAuthenticated = () => me.userData.isAuthenticated && !isAuthenticationExpired(me.userData.expirationDate);

                me.removeAuthentication = function () {
                    $window.localStorage.removeItem(prefix + authData);
                    me.userData.isAuthenticated = false;
                    me.userData.username = '';
                    me.userData.bearerToken = '';
                    me.userData.expirationDate = null;
                    me.userData.refreshToken = null;
                };

                me.authenticate = function (username, password) {
                    this.removeAuthentication();

                    return $http({
                        method: 'POST',
                        url: tubularConfig.webApi.tokenUrl(),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                    }).then(response => {
                        me.initAuth(response.data, username);
                        response.data.authenticated = true;

                        return response.data;
                    }, errorResponse => $q.reject(errorResponse.data));
                };

                // TODO: make private this function
                me.initAuth = (data, username) => {
                    me.userData.isAuthenticated = true;
                    me.userData.username = data.userName || username || me.userData.username;
                    me.userData.bearerToken = data.access_token;
                    me.userData.expirationDate = new Date();
                    me.userData.expirationDate = new Date(me.userData.expirationDate.getTime() + data.expires_in * 1000);
                    me.userData.role = data.role;
                    me.userData.refreshToken = data.refresh_token;

                    $window.localStorage.setItem(prefix + authData, angular.toJson(me.userData));
                };

                init();
            }
        ]);
})(angular);
