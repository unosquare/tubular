(function () {
    'use strict';

    // User Service based on https://bitbucket.org/david.antaramian/so-21662778-spa-authentication-example
    angular.module('tubular.services').service('tubularHttp', [
        '$http', '$timeout', '$q', '$cacheFactory', '$cookieStore', function tubularHttp($http, $timeout, $q, $cacheFactory, $cookieStore) {
            function isAuthenticationExpired(expirationDate) {
                var now = new Date();
                expirationDate = new Date(expirationDate);

                return expirationDate - now <= 0;
            }

            function saveData() {
                removeData();
                $cookieStore.put('auth_data', me.userData);
            }

            function removeData() {
                $cookieStore.remove('auth_data');
            }

            function retrieveSavedData() {
                var savedData = $cookieStore.get('auth_data');
                if (typeof savedData === 'undefined') {
                    throw new Exception('No authentication data exists');
                } else if (isAuthenticationExpired(savedData.expirationDate)) {
                    throw new Exception('Authentication token has already expired');
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

            function setHttpAuthHeader() {
                $http.defaults.headers.common.Authorization = 'Bearer ' + me.userData.bearerToken;
            }

            var me = this;
            me.userData = {
                isAuthenticated: false,
                username: '',
                bearerToken: '',
                expirationDate: null,
            };

            me.cache = $cacheFactory('tubularHttpCache');
            me.useCache = true;
            me.requireAuthentication = true;

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

            me.setRequireAuthentication = function(val) {
                me.requireAuthentication = val;
            };

            me.removeAuthentication = function() {
                removeData();
                clearUserData();
                $http.defaults.headers.common.Authorization = null;
            };

            me.authenticate = function(username, password, successCallback, errorCallback, persistData) {
                this.removeAuthentication();
                var config = {
                    method: 'POST',
                    url: '/api/token',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    data: 'grant_type=password&username=' + username + '&password=' + password,
                };

                $http(config)
                    .success(function(data) {
                        me.userData.isAuthenticated = true;
                        me.userData.username = data.userName;
                        me.userData.bearerToken = data.access_token;
                        me.userData.expirationDate = new Date(data['.expires']);
                        setHttpAuthHeader();
                        if (persistData === true) {
                            saveData();
                        }
                        if (typeof successCallback === 'function') {
                            successCallback();
                        }
                    })
                    .error(function(data) {
                        if (typeof errorCallback === 'function') {
                            if (data.error_description) {
                                errorCallback(data.error_description);
                            } else {
                                errorCallback('Unable to contact server; please, try again later.');
                            }
                        }
                    });
            };

            me.saveDataAsync = function(model, request) {
                var clone = angular.copy(model);
                var originalClone = angular.copy(model.$original);

                delete clone.$isEditing;
                delete clone.$hasChanges;
                delete clone.$selected;
                delete clone.$original;
                delete clone.$state;
                delete clone.$valid;

                request.data = {
                    Old: originalClone,
                    New: clone
                };

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

            me.checksum = function(obj) {
                var keys = Object.keys(obj).sort();
                var output = [], prop;
                for (var i = 0; i < keys.length; i++) {
                    prop = keys[i];
                    output.push(prop);
                    output.push(obj[prop]);
                }
                return JSON.stringify(output);
            };

            me.retrieveDataAsync = function(request) {
                var canceller = $q.defer();

                var cancel = function(reason) {
                    console.error(reason);
                    canceller.resolve(reason);
                };

                if (angular.isString(request.requireAuthentication)) {
                    request.requireAuthentication = request.requireAuthentication == "true";
                } else {
                    request.requireAuthentication = request.requireAuthentication || me.requireAuthentication;
                }

                if (request.requireAuthentication && me.isAuthenticated() == false) {
                    // Return empty dataset
                    return {
                        promise: $q(function(resolve, reject) {
                            resolve(null);
                        }),
                        cancel: cancel
                    };
                }

                var checksum = me.checksum(request);

                if ((request.requestMethod == 'GET' || request.requestMethod == 'POST') && me.useCache) {
                    var data = me.cache.get(checksum);

                    if (angular.isDefined(data) && data.Expiration.getTime() > new Date().getTime()) {
                        return {
                            promise: $q(function(resolve, reject) {
                                resolve(data.Set);
                            }),
                            cancel: cancel
                        };
                    }
                }

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
                }, function (error) {
                    if (angular.isDefined(error) && angular.isDefined(error.status) && error.status == 401) {
                        if (me.isAuthenticated()) {
                            me.removeAuthentication();
                            // Let's trigger a refresh
                            document.location = document.location;
                        }
                    }

                    return $q.reject(error);
                });

                request.timeout = request.timeout || 15000;

                var timeoutHanlder = $timeout(function() {
                    cancel('Timed out');
                }, request.timeout);

                return {
                    promise: promise,
                    cancel: cancel
                };
            };

            me.get = function (url) {
                // TODO: How to know if we need Token
                return { promise: $http.get(url) };
            };

            me.delete = function(url) {
                return me.retrieveDataAsync({
                    serverUrl: url,
                    requestMethod: 'DELETE',
                });
            };

            me.post = function(url, data) {
                return me.retrieveDataAsync({
                    serverUrl: url,
                    requestMethod: 'POST',
                    data: data
                });
            };

            me.put = function(url, data) {
                return me.retrieveDataAsync({
                    serverUrl: url,
                    requestMethod: 'PUT',
                    data: data
                });
            };

            me.getByKey = function (url, key) {
                return { promise: me.get(url + key).promise.then(function (data) { return data.data; }) };
            };
        }
    ]);
})();