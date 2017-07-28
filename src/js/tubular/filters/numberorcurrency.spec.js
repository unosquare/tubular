'use strict';

describe('Module: tubular', () => {

  describe('Filter: numberorcurrency', () => {
    var $filter, result;

    beforeEach(() => {
      module('tubular.core');

      inject(_$filter_ => $filter = _$filter_);
    });

    var filterNumberOcurrency = (input, format, symbol, fractionSize) => $filter('numberorcurrency')(input, format, symbol, fractionSize);

    it('should filter number without fractionSize', () => {
      result = filterNumberOcurrency('30');

      expect(result).toEqual('30.00');
    });

    it('should filter number with fractionSize', () => {
      result = filterNumberOcurrency('30', '', '', 1);

      expect(result).toEqual('30.0', 'Number filter with fractionSize');
    });

    it('should filter Int', () => {
      result = filterNumberOcurrency(30, 'I');

      expect(result).toEqual(30);
    });

    it('should filter currency without symbol', () => {
      result = filterNumberOcurrency(30, 'C');

      expect(result).toEqual('$30.00');
    });

    it('should filter currency with symbol', () => {
      result = filterNumberOcurrency(30, 'C', '€');

      expect(result).toEqual('€30.00');
    });

  });
});
