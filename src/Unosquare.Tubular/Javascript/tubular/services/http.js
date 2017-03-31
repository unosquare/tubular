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
            '$timeout',
            '$q',
            'translateFilter',
            '$log',
            '$document',
            'tubularConfig',
            '$window',
            'prefix',
            function (
                $http,
                $timeout,
                $q,
                translateFilter,
                $log,
                $document,
                tubularConfig,
                $window,
                prefix) {
                var authData = 'auth_data';
                var me = this;

                function init() {
                    const savedData = $window.localStorage.getItem(prefix + authData);

                    if (angular.isDefined(savedData) && savedData != null) {
                        me.userData = savedData;
                    }
                }

                function isAuthenticationExpired(expirationDate) {
                    const now = new Date();
                    expirationDate = new Date(expirationDate);

                    return expirationDate - now <= 0;
                }

                function retrieveSavedData() {
                    const savedData = $window.localStorage.getItem(prefix + authData);

                    if (angular.isUndefined(savedData)) {
                        throw 'No authentication data exists';
                    } else if (isAuthenticationExpired(savedData.expirationDate)) {
                        throw 'Authentication token has already expired';
                    } else {
                        me.userData = savedData;
                    }
                }

                function getCancel(canceller) {
                    return function (reason) {
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

                me.isBearerTokenExpired = function () {
                    return isAuthenticationExpired(me.userData.expirationDate);
                };

                me.isAuthenticated = function () {
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
                    }).then(function (response) {
                        me.initAuth(response.data, username);
                        response.data.authenticated = true;

                        return response.data;
                    }, function (errorResponse) {
                        return $q.reject(errorResponse.data);
                    });
                };

                me.initAuth = function (data, username) {
                    me.userData.isAuthenticated = true;
                    me.userData.username = data.userName || username || me.userData.username;
                    me.userData.bearerToken = data.access_token;
                    me.userData.expirationDate = new Date();
                    me.userData.expirationDate = new Date(me.userData.expirationDate.getTime() + data.expires_in * 1000);
                    me.userData.role = data.role;
                    me.userData.refreshToken = data.refresh_token;

                    $window.localStorage.setItem(prefix + authData, JSON.stringify(me.userData));
                };

                me.addTimeZoneToUrl = function (url) {
                    return url +
                        (url.indexOf('?') === -1 ? '?' : '&') +
                        'timezoneOffset=' +
                        new Date().getTimezoneOffset();
                };

                me.saveDataAsync = function (model, request) {
                    const component = model.$component;
                    model.$component = null;
                    const clone = angular.copy(model);
                    model.$component = component;

                    const originalClone = angular.copy(model.$original);

                    delete clone.$isEditing;
                    delete clone.$hasChanges;
                    delete clone.$selected;
                    delete clone.$original;
                    delete clone.$state;
                    delete clone.$valid;
                    delete clone.$component;
                    delete clone.$isLoading;
                    delete clone.$isNew;

                    if (model.$isNew) {
                        request.serverUrl = me.addTimeZoneToUrl(request.serverUrl);
                        request.data = clone;
                    } else {
                        request.data = {
                            Old: originalClone,
                            New: clone,
                            TimezoneOffset: new Date().getTimezoneOffset()
                        };
                    }

                    return me.retrieveDataAsync(request)
                        .then(function (data) {
                            model.$hasChanges = false;
                            model.resetOriginal();

                            return data;
                        });
                };

                me.getExpirationDate = function () {
                    const date = new Date();
                    return new Date(date.getTime() + 5 * 60000); // Add 5 minutes
                };

                me.retrieveDataAsync = function (request) {
                    const canceller = $q.defer();
                    var cancel = getCancel(canceller);

                    if (angular.isUndefined(request.requireAuthentication)) {
                        request.requireAuthentication = tubularConfig.webApi.requireAuthentication();
                    }

                    if (angular.isString(request.requireAuthentication)) {
                        request.requireAuthentication = request.requireAuthentication === 'true';
                    }

                    if (!tubularConfig.webApi.enableRefreshTokens()) {
                        if (tubularConfig.webApi.requireAuthentication() && me.isAuthenticated() === false) {
                            // Return empty dataset
                            return $q(function (resolve) { resolve(null); });
                        }
                    }

                    request.timeout = request.timeout || 17000;

                    var timeoutHandler = $timeout(function () {
                        cancel('Timed out');
                    }, request.timeout);

                    return $http({
                        url: request.serverUrl,
                        method: request.requestMethod,
                        data: request.data,
                        timeout: canceller.promise
                    }).then(function (response) {
                        $timeout.cancel(timeoutHandler);

                        return response.data;
                    }, function (error) {
                        if (error.status === 401) {
                            me.removeAuthentication();

                            // Let's trigger a refresh
                            $document.location = $document.location;
                        }

                        return $q.reject(error);
                    });
                };

                me.get = function (url, params) {
                    if (!tubularConfig.webApi.enableRefreshTokens()) {
                        if (tubularConfig.webApi.requireAuthentication() && !me.isAuthenticated()) {

                            // Return empty dataset
                            return $q(function (resolve) { resolve(null); });
                        }
                    }

                    return $http.get(url, params)
                        .then(function (data) { return data.data; });
                };

                me.getBinary = function (url) {
                    return me.get(url, { responseType: 'arraybuffer' });
                };

                me.delete = function (url) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'DELETE'
                    });
                };

                me.post = function (url, data) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'POST',
                        data: data
                    });
                };

                /*
                 * @function postBinary
                 * 
                 * @description
                 * Allow to post a `FormData` object with `$http`. You need to append the files
                 * in your own FormData.
                 */
                me.postBinary = function (url, formData) {
                    if (!tubularConfig.webApi.enableRefreshTokens()) {
                        if (tubularConfig.webApi.requireAuthentication() && !me.isAuthenticated()) {
                            // Return empty dataset
                            return $q(function (resolve) { resolve(null); });
                        }
                    }

                    return $http({
                        url: url,
                        method: 'POST',
                        headers: { 'Content-Type': undefined },
                        transformRequest: function (data) { return data; },
                        data: formData
                    });
                };

                me.put = function (url, data) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'PUT',
                        data: data
                    });
                };

                me.getByKey = function (url, key) {
                    const urlData = me.addTimeZoneToUrl(url).split('?');
                    var getUrl = urlData[0] + key;

                    if (urlData.length > 1) {
                        getUrl += '?' + urlData[1];
                    }

                    return me.get(getUrl);
                };

                // This is a kind of factory to retrieve a DataService
                me.instances = [];

                me.registerService = function (name, instance) {
                    me.instances[name] = instance;
                };

                me.getDataService = function (name) {
                    if (angular.isUndefined(name) || name == null || name === 'tubularHttp') {
                        return me;
                    }

                    const instance = me.instances[name];

                    return instance == null ? me : instance;
                };

                init();
            }
        ]);
})(angular);