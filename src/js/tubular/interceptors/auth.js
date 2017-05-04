(function (angular) {
    'use strict';
    /**
     * @ngdoc function
     * @name tubularAuthInterceptor
     * @description
     *
     * Implement a httpInterceptor to handle authorization using bearer tokens
     *
     * @constructor
     * @returns {Object} A httpInterceptor
     */
    angular.module('tubular.services')
        .factory('tubularAuthInterceptor', ['$q', '$injector', 'tubularConfig', function ($q, $injector, tubularConfig) {

            var authRequestRunning = null;
            var tubularHttpName = 'tubularHttp';

            var service = {
                request: request,
                requestError: requestError,
                response: response,
                responseError: responseError
            };

            return service;

            function request(config) {
                // Get the service here because otherwise, a circular dependency injection will be detected
                var tubularHttp = $injector.get(tubularHttpName);
                var webApiSettings = tubularConfig.webApi;

                config.headers = config.headers || {};

                // Handle requests going to API
                if (!checkStatic(config.url) && webApiSettings.tokenUrl() !== config.url &&
                    webApiSettings.requireAuthentication() &&
                    tubularHttp.userData.bearerToken) {

                    config.headers.Authorization = 'Bearer ' + tubularHttp.userData.bearerToken;

                    // When using refresh tokens and bearer token has expired,
                    // avoid the round trip on go directly to try refreshing the token
                    if (webApiSettings.enableRefreshTokens() && tubularHttp.userData.refreshToken
                        && tubularHttp.isBearerTokenExpired()) {
                        return $q.reject({ error: 'expired token', status: 401, config: config });
                    }
                }

                return config;
            }

            function checkStatic(url) {
                return /\.(htm|html|css|js|jsx)/.test(url);
            }

            function requestError(rejection) {
                return $q.reject(rejection);
            }

            function response(response) {
                return response;
            }

            function responseError(rejection) {
                var deferred = $q.defer();

                switch (rejection.status) {
                    case 401:
                        var tubularHttp = $injector.get(tubularHttpName);
                        var webApiSettings = tubularConfig.webApi;
                        var apiBaseUrl = webApiSettings.baseUrl();

                        if (
                            rejection.config.url.substring(0, apiBaseUrl.length) === apiBaseUrl &&
                            webApiSettings.tokenUrl() !== rejection.config.url &&
                            webApiSettings.enableRefreshTokens() &&
                            webApiSettings.requireAuthentication() &&
                            tubularHttp.userData.refreshToken) {

                            rejection.triedRefreshTokens = true;

                            if (!authRequestRunning) {
                                authRequestRunning = $injector.get('$http')({
                                    method: 'POST',
                                    url: webApiSettings.refreshTokenUrl(),
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    data: 'grant_type=refresh_token&refresh_token=' + tubularHttp.userData.refreshToken
                                });
                            }

                            authRequestRunning.then(function (r) {
                                authRequestRunning = null;
                                tubularHttp.initAuth(r.data);

                                if (webApiSettings.requireAuthentication() && tubularHttp.isAuthenticated()) {
                                    rejection.config.headers.Authorization = 'Bearer ' + tubularHttp.userData.bearerToken;
                                    $injector.get('$http')(rejection.config)
                                        .then(resp => deferred.resolve(resp), () => deferred.reject(r));
                                }
                                else {
                                    deferred.reject(rejection);
                                }
                            }, function (response) {
                                authRequestRunning = null;
                                deferred.reject(response);
                                tubularHttp.removeAuthentication();
                                $injector.get('$state').go('/Login');
                                return;
                            });
                        }
                        else {
                            deferred.reject(rejection);
                        }

                        return deferred.promise;
                    default:
                        break;
                }

                deferred.reject(rejection);
                return deferred.promise;
            }
        }]);
})(angular);
