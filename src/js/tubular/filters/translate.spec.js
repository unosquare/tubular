'use strict';

describe('Module: tubular', () => {

  describe('Filter: translate', () => {
    var $filter, result, tubularTranslateService;

    beforeEach(() => {

      module('tubular.services');
      module($provide => {
        tubularTranslateService = jasmine.createSpyObj('translateService', ['translate']);

        $provide.value('tubularTranslate', tubularTranslateService);
      });

      inject(_$filter_ => $filter = _$filter_);
    });

    var filterTranslate = (input, param1, param2, param3, param4) => $filter('translate')(input, param1, param2, param3, param4);


    it('should translate without params', () => {
      tubularTranslateService.translate.and.returnValue('some translation');

      result = filterTranslate('somekey');

      expect(result).toEqual('some translation');
      expect(tubularTranslateService.translate).toHaveBeenCalledWith('somekey');
    });

    it('should translate with 1 param', () => {
      tubularTranslateService.translate.and.returnValue('some translation {0}');

      result = filterTranslate('somekey', 3);

      expect(result).toEqual('some translation 3');
      expect(tubularTranslateService.translate).toHaveBeenCalledWith('somekey');
    });

    it('should translate with 2 params', () => {
      tubularTranslateService.translate.and.returnValue('some {1} translation {0}');

      result = filterTranslate('somekey', 3, 45);

      expect(result).toEqual('some 45 translation 3');
      expect(tubularTranslateService.translate).toHaveBeenCalledWith('somekey');
    });

    it('should translate with 3 params', () => {
      tubularTranslateService.translate.and.returnValue('some {1} trans {2} lation {0}');

      result = filterTranslate('somekey', 3, 45, "php");

      expect(result).toEqual('some 45 trans php lation 3');
      expect(tubularTranslateService.translate).toHaveBeenCalledWith('somekey');
    });

    it('should translate with 4 params', () => {
      tubularTranslateService.translate.and.returnValue('{3} some {1} trans {2} lation {0}');

      result = filterTranslate('somekey', 3, 45, "php", "simio");

      expect(result).toEqual('simio some 45 trans php lation 3');
      expect(tubularTranslateService.translate).toHaveBeenCalledWith('somekey');
    });

    it('should translate with more than 4 params', () => {
      tubularTranslateService.translate.and.returnValue('{3} so{4}me {1} trans {2} lation {0}');

      result = filterTranslate('somekey', 3, 45, "php", "simio", "tubular");

      expect(result).toEqual('simio so{4}me 45 trans php lation 3');
      expect(tubularTranslateService.translate).toHaveBeenCalledWith('somekey');
    });

  });
});
