'use strict';

describe('Module: tubular', function() {

    describe('Tubular filters', function() {

        var $filter, result;

        beforeEach(function() {
            module('tubular');

            inject(function(_$filter_) {
                $filter = _$filter_;
            });
        });

        function filterErrorMessage(input) {
            return $filter('errormessage')(input);
        }

        function filterNumberOcurrency(input, format, symbol, fractionSize) {
            return $filter('numberorcurrency')(input, format, symbol, fractionSize);
        }

        function filterMoment(input, format) {
            return $filter('moment')(input, format);
        }

        it('should filter errormessage', function() {
            result = filterErrorMessage('');
            expect(result).toEqual('Connection Error', 'Empty errormessage');

            result = filterErrorMessage({
                'statusText': 'Fatal error'
            });
            expect(result).toEqual('Fatal error', 'input with statusText');

            result = filterErrorMessage({
                'data': {
                    'ExceptionMessage': 'object reference not set to instance of an object'
                }
            });
            expect(result).toEqual('object reference not set to instance of an object', 'input with ExceptionMessage');
        });

        it('should filter numberorcurrency', function() {
            result = filterNumberOcurrency('30');
            expect(result).toEqual('30.00', 'Number filter without fractionSize');

            result = filterNumberOcurrency('30', '', '', 1);
            expect(result).toEqual('30.0', 'Number filter with fractionSize');

            result = filterNumberOcurrency(30, 'I');
            expect(result).toEqual(30, 'Int filter');

            result = filterNumberOcurrency(30,'C');
            expect(result).toEqual('$30.00', 'Currency filter without symbol');

            result = filterNumberOcurrency(30,'C', '€' );
            expect(result).toEqual('€30.00', 'Currency filter without symbol');
        });

        it('should filter moment', function() {
            var date = '2017-03-24';
            result = filterMoment(date);
            expect(result).toEqual('Mar 24, 2017', 'Not-moment date');

            result = filterMoment(moment(date));
            expect(result).toEqual('3/24/2017', 'Moment filter with format');

            result = filterMoment(moment(date), 'YYYYMMDD');
            expect(result).toEqual('20170324', 'Moment filter without format');
        });

    });
});