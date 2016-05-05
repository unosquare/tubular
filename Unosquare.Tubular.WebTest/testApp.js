(function() {
    'use strict';

    // define console methods if not defined
    if (typeof console === "undefined") {
        window.console = {
            log: function () { },
            debug: function () { },
            error: function () { },
            assert: function () { },
            info: function () { },
            warn: function () { },
        };
    }

    angular.module('testApp.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/tbGridPagerTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbGridPager_tests.html',
                        title: 'Tubular Grid Pager (and related) Tests'
                    })
                    .when('/tbColumnTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbColumn_tests.html',
                        title: 'Tubular Column Tests'
                    })
                    .when('/tbFiltersTests', {
                        templateUrl: '/Unosquare.Tubular.WebTest/common/tbFilters_tests.html',
                        title: 'Tubular Column Tests'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });

                $locationProvider.html5Mode(true);
            }
        ]).config([
        '$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('noCacheInterceptor');
        }
        ]).factory('noCacheInterceptor', function () {
            return {
                request: function (config) {
                    if (config.method == 'GET' && config.url.indexOf('.htm') === -1 && config.url.indexOf('blob:') === -1) {
                        var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = config.url + separator + 'noCache=' + new Date().getTime();
                    }
                    return config;
                }
            };
        });

    angular.module('app', [
        'tubular',
        'testApp.routes'
    ]).run([
        'tubularTranslate', function (tubularTranslate) {
            // Uncomment if you want to start with Spanish
            //tubularTranslate.setLanguage('es');
            // I need to check this
            tubularTranslate.addTranslation('es', 'UI_LANG', 'English').addTranslation('en', 'UI_LANG', 'Español');
            // console.log(tubularTranslate.translationTable);
        }
    ]);
})();