(function(angular) {
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
            '$http', '$timeout', '$q', '$cacheFactory', 'localStorageService', '$filter',
            function($http, $timeout, $q, $cacheFactory, localStorageService, $filter) {
                var me = this;

                function isAuthenticationExpired(expirationDate) {
                    var now = new Date();
                    expirationDate = new Date(expirationDate);

                    return expirationDate - now <= 0;
                }

                function removeData() {
                    localStorageService.remove('auth_data');
                }

                function saveData() {
                    removeData();
                    localStorageService.set('auth_data', me.userData);
                }

                function setHttpAuthHeader() {
                    $http.defaults.headers.common.Authorization = 'Bearer ' + me.userData.bearerToken;
                }

                function retrieveSavedData() {
                    var savedData = localStorageService.get('auth_data');

                    if (typeof savedData === 'undefined' || savedData == null) {
                        throw 'No authentication data exists';
                    } else if (isAuthenticationExpired(savedData.expirationDate)) {
                        throw 'Authentication token has already expired';
                    } else {
                        me.userData = savedData;
                        setHttpAuthHeader();
                    }
                }

                function clearUserData() {
                    me.userData.isAuthenticated = false;
                    me.userData.username = '';
                    me.userData.bearerToken = '';
                    me.userData.expirationDate = null;
                }

                me.userData = {
                    isAuthenticated: false,
                    username: '',
                    bearerToken: '',
                    expirationDate: null
                };

                me.cache = $cacheFactory('tubularHttpCache');
                me.useCache = true;
                me.requireAuthentication = true;
                me.refreshTokenUrl = me.tokenUrl = '/api/token';
                me.setTokenUrl = function(val) { me.tokenUrl = val; };
                me.setRequireAuthentication = function(val) { me.requireAuthentication = val; };

                me.isAuthenticated = function() {
                    if (!me.userData.isAuthenticated || isAuthenticationExpired(me.userData.expirationDate)) {
                        try {
                            retrieveSavedData();
                        } catch (e) {
                            return false;
                        }
                    }

                    return true;
                };

                me.removeAuthentication = function() {
                    removeData();
                    clearUserData();
                    $http.defaults.headers.common.Authorization = null;
                };

                me.authenticate = function(username, password, successCallback, errorCallback, persistData, userDataCallback) {
                    this.removeAuthentication();

                    $http({
                        method: 'POST',
                        url: me.tokenUrl,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: 'grant_type=password&username=' + username + '&password=' + password
                    }).success(function(data) {
                        me.handleSuccessCallback(userDataCallback, successCallback, persistData, data, username);
                    }).error(function(data) {
                        me.handleErrorCallback(errorCallback, data);
                    });
                };

                me.handleSuccessCallback = function (userDataCallback, successCallback, persistData, data, username) {
                    me.userData.isAuthenticated = true;
                    me.userData.username = data.userName || username;
                    me.userData.bearerToken = data.access_token;
                    me.userData.expirationDate = new Date();
                    me.userData.expirationDate = new Date(me.userData.expirationDate.getTime() + data.expires_in * 1000);
                    me.userData.role = data.role;
                    me.userData.refreshToken = data.refresh_token;

                    if (typeof userDataCallback === 'function') {
                        userDataCallback(data);
                    }

                    setHttpAuthHeader();

                    if (persistData) {
                        saveData();
                    }

                    if (typeof successCallback === 'function') {
                        successCallback();
                    }
                };

                me.handleErrorCallback = function(errorCallback, data) {
                    if (typeof errorCallback === 'function') {
                        if (data.error_description) {
                            errorCallback(data.error_description);
                        } else {
                            errorCallback($filter('translate')('UI_HTTPERROR'));
                        }
                    }
                };

                me.addTimeZoneToUrl = function(url) {
                    var separator = url.indexOf('?') === -1 ? '?' : '&';
                    return url + separator + 'timezoneOffset=' + new Date().getTimezoneOffset();
                }

                me.saveDataAsync = function(model, request) {
                    var component = model.$component;
                    model.$component = null;
                    var clone = angular.copy(model);
                    model.$component = component;

                    var originalClone = angular.copy(model.$original);

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

                    var dataRequest = me.retrieveDataAsync(request);

                    dataRequest.promise.then(function(data) {
                        model.$hasChanges = false;
                        model.resetOriginal();

                        return data;
                    });

                    return dataRequest;
                };

                me.getExpirationDate = function() {
                    var date = new Date();
                    var minutes = 5;
                    return new Date(date.getTime() + minutes * 60000);
                };

                me.refreshSession = function(persistData, errorCallback) {
                    $http({
                        method: 'POST',
                        url: me.refreshTokenUrl,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: 'grant_type=refresh_token&refresh_token=' + me.userData.refreshToken
                    }).success(function(data) {
                        me.handleSuccessCallback(null, null, persistData, data);
                    }).error(function(data) {
                        me.handleErrorCallback(errorCallback, data);
                    });
                };

                me.getCancel = function(canceller) {
                    return function(reason) {
                        console.error(reason);
                        canceller.resolve(reason);
                    }
                };

                me.retrieveDataAsync = function(request) {
                    var canceller = $q.defer();
                    var cancel = me.getCancel(canceller);

                    if (angular.isUndefined(request.requireAuthentication)) {
                        request.requireAuthentication = me.requireAuthentication;
                    }

                    if (angular.isString(request.requireAuthentication)) {
                        request.requireAuthentication = request.requireAuthentication === "true";
                    }

                    if (request.requireAuthentication && me.isAuthenticated() === false) {
                        if (me.userData.refreshToken) {
                            me.refreshSession(true);
                        } else {
                            return {
                                promise: $q(function(resolve) {
                                    resolve(null);
                                }),
                                cancel: cancel
                            };
                        }
                    }

                    var checksum = JSON.stringify(request);

                    if ((request.requestMethod === 'GET' || request.requestMethod === 'POST') && me.useCache) {
                        var data = me.cache.get(checksum);

                        if (angular.isDefined(data) && data.Expiration.getTime() > new Date().getTime()) {
                            return {
                                promise: $q(function(resolve) {
                                    resolve(data.Set);
                                }),
                                cancel: cancel
                            };
                        }
                    }

                    request.timeout = request.timeout || 17000;

                    var timeoutHanlder = $timeout(function() {
                        cancel('Timed out');
                    }, request.timeout);

                    var promise = $http({
                        url: request.serverUrl,
                        method: request.requestMethod,
                        data: request.data,
                        timeout: canceller.promise
                    }).then(function(response) {
                        $timeout.cancel(timeoutHanlder);

                        if (me.useCache) {
                            me.cache.put(checksum, { Expiration: me.getExpirationDate(), Set: response.data });
                        }

                        return response.data;
                    }, function(error) {
                        if (angular.isDefined(error) && angular.isDefined(error.status) && error.status === 401) {
                            if (me.isAuthenticated()) {
                                if (me.userData.refreshToken) {
                                    me.refreshSession(true);

                                    return me.retrieveDataAsync(request);
                                } else {
                                    me.removeAuthentication();
                                    // Let's trigger a refresh
                                    document.location = document.location;
                                }
                            }
                        }

                        return $q.reject(error);
                    });

                    return {
                        promise: promise,
                        cancel: cancel
                    };
                };

                me.get = function(url, params) {
                    if (me.requireAuthentication && !me.isAuthenticated()) {
                        var canceller = $q.defer();

                        // Return empty dataset
                        return {
                            promise: $q(function(resolve) {
                                resolve(null);
                            }),
                            cancel: me.getCancel(canceller)
                        };
                    }

                    return { promise: $http.get(url, params).then(function(data) { return data.data; }) };
                };

                me.getBinary = function(url) {
                    return me.get(url, { responseType: 'arraybuffer' });
                };

                me.delete = function(url) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'DELETE'
                    });
                };

                me.post = function(url, data) {
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
                me.postBinary = function(url, formData) {
                    var canceller = $q.defer();
                    var cancel = me.getCancel(canceller);

                    if (me.requireAuthentication && me.isAuthenticated() === false) {
                        // Return empty dataset
                        return {
                            promise: $q(function(resolve) {
                                resolve(null);
                            }),
                            cancel: cancel
                        };
                    }

                    var promise = $http({
                        url: url,
                        method: "POST",
                        headers: { 'Content-Type': undefined },
                        transformRequest: function(data) {
                            // TODO: Remove?
                            return data;
                        },
                        data: formData
                    });

                    return {
                        promise: promise,
                        cancel: cancel
                    };
                };

                me.put = function(url, data) {
                    return me.retrieveDataAsync({
                        serverUrl: url,
                        requestMethod: 'PUT',
                        data: data
                    });
                };

                me.getByKey = function(url, key) {
                    var urlData = me.addTimeZoneToUrl(url).split('?');
                    var getUrl = urlData[0] + key;

                    if (urlData.length > 1) getUrl += '?' + urlData[1];

                    return me.get(getUrl);
                };

                // This is a kind of factory to retrieve a DataService
                me.instances = [];

                me.registerService = function(name, instance) {
                    me.instances[name] = instance;
                };

                me.getDataService = function(name) {
                    if (angular.isUndefined(name) || name == null || name === 'tubularHttp') {
                        return me;
                    }

                    var instance = me.instances[name];

                    return instance == null ? me : instance;
                };
            }
        ]);
})(window.angular);