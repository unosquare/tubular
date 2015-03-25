(function() {
    'use strict';

    angular.module('tubular.directives', ['tubular.services', 'tubular.models', 'LocalStorageModule', 'autocomplete'])
        .config([
            'localStorageServiceProvider', function(localStorageServiceProvider) {
                localStorageServiceProvider.setPrefix('tubular');

                // define console methods if not defined
                if (typeof console === "undefined") {
                    window.console = {
                        log: function() {},
                        debug: function() {},
                        error: function() {},
                        assert: function() {},
                        info: function() {},
                        warn: function() {},
                    };
                }
            }
        ])
        .constant("tubularConst", {
            "upCssClass": "fa-long-arrow-up",
            "downCssClass": "fa-long-arrow-down"
        })
        .filter('errormessage', function() {
            return function(input) {
                if (angular.isDefined(input) && angular.isDefined(input.data) && angular.isDefined(input.data.ExceptionMessage))
                    return input.data.ExceptionMessage;

                return input.statusText || "Connection Error";
            };
        }).filter('numberorcurrency', [
            '$filter', function($filter) {
                return function(input, format, symbol, fractionSize) {
                    symbol = symbol || "$";
                    fractionSize = fractionSize || 2;

                    if (format == 'C') {
                        return $filter('currency')(input, symbol, fractionSize);
                    }

                    return $filter('number')(input, fractionSize);
                };
            }
        ])
        // Based on https://github.com/sparkalow/angular-truncate/blob/master/src/truncate.js
        .filter('characters', function() {
            return function(input, chars, breakOnWord) {
                if (isNaN(chars)) return input;
                if (chars <= 0) return '';

                if (input && input.length > chars) {
                    input = input.substring(0, chars);

                    if (!breakOnWord) {
                        var lastspace = input.lastIndexOf(' ');
                        //get last space
                        if (lastspace !== -1) {
                            input = input.substr(0, lastspace);
                        }
                    } else {
                        while (input.charAt(input.length - 1) === ' ') {
                            input = input.substr(0, input.length - 1);
                        }
                    }
                    return input + '…';
                }

                return input;
            };
        });
})();