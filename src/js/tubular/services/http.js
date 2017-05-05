﻿(function (angular) {
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
            '$timeout',
            '$q',
            'translateFilter',
            '$log',
            '$document',
            'tubularConfig',
            '$window',
            function (
                $http,
                $timeout,
                $q,
                translateFilter,
                $log,
                $document,
                tubularConfig,
                $window) {
                var authData = 'auth_data';
                var prefix = tubularConfig.localStorage.prefix();
                var me = this;

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

                function retrieveSavedData() {
                    const savedData = angular.fromJson($window.localStorage.getItem(prefix + authData));

                    if (angular.isUndefined(savedData)) {
                        throw 'No authentication data exists';
                    } else if (isAuthenticationExpired(savedData.expirationDate)) {
                        throw 'Authentication token has already expired';
                    } else {
                        me.userData = savedData;
                    }
                }

                function getCancel(canceller) {
                    return reason => {
                        $log.error(reason);
                        canceller.resolve(reason);
                    };
                }

                me.userData = {
                    isAuthenticated: false,
                    username: '',
                    bearerToken: '',
                    expirationDate: null
                };

                me.isBearerTokenExpired = ()  => isAuthenticationExpired(me.userData.expirationDate);

                me.isAuthenticated = () => {
                    if (!me.userData.isAuthenticated || isAuthenticationExpired(me.userData.expirationDate)) {
                        try {
                            retrieveSavedData();
                        } catch (e) {
                            return false;
                        }
                    }

                    return true;
                };

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
                        data: 'grant_type=password&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
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

                function addTimeZoneToUrl(url) {
                    return url +
                        (url.indexOf('?') === -1 ? '?' : '&') +
                        'timezoneOffset=' +
                        new Date().getTimezoneOffset();
                }

                me.saveDataAsync = (model, request) => {
                    const component = model.$component;
                    model.$component = null;
                    const clone = angular.copy(model);
                    model.$component = component;

                    const originalClone = angular.copy(model.$original);

                    delete clone.$isEditing;
                    delete clone.$hasChanges;
                    delete clone.$original;
                    delete clone.$state;
                    delete clone.$valid;
                    delete clone.$component;
                    delete clone.$isLoading;
                    delete clone.$isNew;

                    if (model.$isNew) {
                        request.serverUrl = addTimeZoneToUrl(request.serverUrl);
                        request.data = clone;
                    } else {
                        request.data = {
                            Old: originalClone,
                            New: clone,
                            TimezoneOffset: new Date().getTimezoneOffset()
                        };
                    }

                    return me.retrieveDataAsync(request)
                        .then(data => {
                            model.$hasChanges = false;
                            model.resetOriginal();

                            return data;
                        });
                };

                me.retrieveDataAsync = request => {
                    const canceller = $q.defer();
                    var cancel = getCancel(canceller);

                    if (angular.isUndefined(request.requireAuthentication)) {
                        request.requireAuthentication = tubularConfig.webApi.requireAuthentication();
                    }

                    if (angular.isString(request.requireAuthentication)) {
                        request.requireAuthentication = request.requireAuthentication === 'true';
                    }

                    // TODO: This is wrong requireAuthentication should validate request too
                    if (!tubularConfig.webApi.enableRefreshTokens()) {
                        if (tubularConfig.webApi.requireAuthentication() && me.isAuthenticated() === false) {
                            // Return empty dataset
                            return $q(resolve => resolve(null));
                        }
                    }

                    request.timeout = request.timeout || 17000;

                    var timeoutHandler = $timeout(() =>cancel('Timed out'), request.timeout);

                    return $http({
                        url: request.serverUrl,
                        method: request.requestMethod,
                        data: request.data,
                        timeout: canceller.promise
                    }).then(response => {
                        $timeout.cancel(timeoutHandler);

                        return response.data;
                    }, error => {
                        if (error.status === 401) {
                            me.removeAuthentication();

                            // Let's trigger a refresh
                            $document.location = $document.location;
                        }

                        return $q.reject(error);
                    });
                };

                init();
            }
        ]);
})(angular);