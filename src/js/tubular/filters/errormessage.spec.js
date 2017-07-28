'use strict';

describe('Module: tubular', () => {

  describe('Filter: errormessage', () => {
    var $filter, result;

    beforeEach(() => {
      module('tubular.core');

      inject(_$filter_ => $filter = _$filter_);
    });

    var filterErrorMessage = (input) => $filter('errormessage')(input);


    it('should filter empty errormessage', () => {
      result = filterErrorMessage('');
      expect(result).toEqual('Connection Error');
    });

    it('should filter status text', () => {
      result = filterErrorMessage({
        'statusText': 'Fatal error'
      });

      expect(result).toEqual('Fatal error');
    });

    it('should filter ExceptionMessage', () => {
      result = filterErrorMessage({
        'data': {
          'ExceptionMessage': 'object reference not set to instance of an object'
        }
      });
      expect(result).toEqual('object reference not set to instance of an object');
    });
  });
});
