'use strict';

describe('Module: tubular', () => {

  it('should have version', () => {
      expect(angular.module('tubular').info().version).toBeDefined();
  });
});
