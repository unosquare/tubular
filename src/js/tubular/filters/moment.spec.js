'use strict';

describe('Module: tubular', () => {

  describe('Filter: moment', () => {
    var $filter, result, date;

    beforeEach(() => {
      module('tubular.core');

      inject(_$filter_ => $filter = _$filter_);

      date = '2017-03-24';
    });

    var filterMoment = (input, format) => $filter('moment')(input, format);

    it('should filter not-moment date', () => {

      result = filterMoment(date);
      expect(result).toEqual('Mar 24, 2017');
    });

    it('should filter date with format', () => {
      result = filterMoment(moment(date));
      expect(result).toEqual('3/24/2017');
    });

    it('should filter date without format', () => {
      result = filterMoment(moment(date), 'YYYYMMDD');
      expect(result).toEqual('20170324');
    });

  });
});
