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
        .factory('tubularHttp', [
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

                const service = {
                  userData : {
                      isAuthenticated: false,
                      username: '',
                      bearerToken: '',
                      expirationDate: null
                  },
                  authenticate : authenticate,
                  isAuthenticationExpired : isAuthenticationExpired,
                  removeAuthentication: removeAuthentication,
                  isAuthenticated: isAuthenticated,
                  isBearerTokenExpired: isBearerTokenExpired,
                  initAuth: initAuth
                }

                init();
                return service;

                function init() {
                    const savedData = angular.fromJson($window.localStorage.getItem(prefix + authData));

                    if (savedData != null) {
                        service.userData = savedData;
                    }
                }

                function isAuthenticationExpired(expirationDate) {
                    const now = new Date();
                    expirationDate = new Date(expirationDate);

                    return expirationDate - now <= 0;
                }



                function isBearerTokenExpired() {
                  return isAuthenticationExpired(service.userData.expirationDate);
                }

                function isAuthenticated() {
                  return service.userData.isAuthenticated && !isAuthenticationExpired(service.userData.expirationDate)
                }

                function removeAuthentication() {
                    $window.localStorage.removeItem(prefix + authData);
                    service.userData.isAuthenticated = false;
                    service.userData.username = '';
                    service.userData.bearerToken = '';
                    service.userData.expirationDate = null;
                    service.userData.refreshToken = null;
                }

                function authenticate(username, password) {
                    this.removeAuthentication();

                    return $http({
                        method: 'POST',
                        url: tubularConfig.webApi.tokenUrl(),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                    }).then(response => {
                        initAuth(response.data, username);
                        response.data.authenticated = true;

                        return response.data;
                    }, errorResponse => $q.reject(errorResponse.data));
                }


                function initAuth(data, username) {
                    service.userData.isAuthenticated = true;
                    service.userData.username = data.userName || username || service.userData.username;
                    service.userData.bearerToken = data.access_token;
                    service.userData.expirationDate = new Date();
                    service.userData.expirationDate = new Date(service.userData.expirationDate.getTime() + data.expires_in * 1000);
                    service.userData.role = data.role;
                    service.userData.refreshToken = data.refresh_token;

                    $window.localStorage.setItem(prefix + authData, angular.toJson(service.userData));
                }


            }
        ]);
})(angular);
