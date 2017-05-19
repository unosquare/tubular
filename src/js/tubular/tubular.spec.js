'use strict';

describe('Module: tubular', () => {
  beforeEach(() => {
    module('tubular.models');
    module('tubular.services');
    module('tubular.directives');
    module('tubular');
  });

  it('should load successfully', () => {});

  xit('should have version', () => {
    // How?
    inject(tubular => {
      expect(tubular.info().version).toBeDefined();
    });
  });
});
