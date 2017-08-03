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

            let refreshTokenRequest = null;
            const tubularHttpName = 'tubularHttp';
            const evtInvalidAuthData = 'tbAuthentication_OnInvalidAuthenticationData';

            const service = {
                request: request,
                requestError: requestError,
                response: response,
                responseError: responseError
            };

            return service;

            function request(config) {
                // If the request ignore the authentication bypass
                if (config.requireAuthentication === false) {
                    return config;
                }

                if (tubularConfig.webApi.authBypassUrls().some(item => config.url.indexOf(item) >= 0)) {
                    return config;
                }

                // Get the service here because otherwise, a circular dependency injection will be detected
                const tubularHttp = $injector.get(tubularHttpName);
                const webApiSettings = tubularConfig.webApi;
                config.headers = config.headers || {};

                // Handle requests going to API
                if (!checkStatic(config.url) &&
                    webApiSettings.tokenUrl() !== config.url &&
                    webApiSettings.refreshTokenUrl() !== config.url &&
                    webApiSettings.requireAuthentication()) {

                    if (!tubularHttp.isAuthenticated()) {
                        return $q.reject({ error: 'User not authenticated, new login required.', status: 401, config: config });
                    }

                    // When using refresh tokens and bearer token has expired,
                    // avoid the round trip on go directly to try refreshing the token
                    if (webApiSettings.enableRefreshTokens() &&
                        tubularHttp.userData.refreshToken &&
                        tubularHttp.isBearerTokenExpired()) {
                        return $q.reject({ error: 'expired token', status: 401, config: config });
                    }
                    else {
                        config.headers.Authorization = `Bearer ${tubularHttp.userData.bearerToken}`;
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

            function resolveRefreshToken(tubularHttp, deferred, rejection) {
                const webApiSettings = tubularConfig.webApi;

                rejection.triedRefreshTokens = true;

                if (!refreshTokenRequest) {
                    refreshTokenRequest = $injector.get('$http')({
                        method: 'POST',
                        url: webApiSettings.refreshTokenUrl(),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: `grant_type=refresh_token&refresh_token=${tubularHttp.userData.refreshToken}`
                    });
                }

                refreshTokenRequest.then(r => {
                    refreshTokenRequest = null;
                    tubularHttp.initAuth(r.data);

                    if (tubularHttp.isAuthenticated()) {
                        rejection.config.headers.Authorization = `Bearer ${tubularHttp.userData.bearerToken}`;
                        $injector.get('$http')(rejection.config)
                            .then(resp => deferred.resolve(resp), () => deferred.reject(r));
                    }
                    else {
                        deferred.reject(rejection);
                    }
                }, response => {
                    refreshTokenRequest = null;
                    tubularHttp.removeAuthentication();
                    deferred.reject(response);

                    $injector.get('$rootScope').$emit(evtInvalidAuthData);
                    return;
                });
            }

            function responseError(rejection) {
                const deferred = $q.defer();

                if (rejection.status === 401) {
                    const webApiSettings = tubularConfig.webApi;

                    if (webApiSettings.tokenUrl() !== rejection.config.url &&
                        webApiSettings.requireAuthentication()) {

                        const tubularHttp = $injector.get(tubularHttpName);

                        if (webApiSettings.enableRefreshTokens() &&
                            webApiSettings.refreshTokenUrl() !== rejection.config.url &&
                            tubularHttp.isBearerTokenExpired() &&
                            tubularHttp.userData.refreshToken) {
                            resolveRefreshToken(tubularHttp, deferred, rejection);
                            return deferred.promise;
                        }
                        else {
                            tubularHttp.removeAuthentication();
                            $injector.get('$rootScope').$emit(evtInvalidAuthData);
                        }
                    }
                }

                deferred.reject(rejection);

                return deferred.promise;
            }
        }]);
})(angular);
