'use strict';

describe('Module: tubular.services', function () {

    describe('Service: tubularTranslate', function () {
        var tubularTranslate;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularTranslate_) {
                tubularTranslate = _tubularTranslate_;
            });
        });

        it('should be defined', function () {
            expect(tubularTranslate).toBeDefined();
        });

        it('should have default and current language to be "en"', function () {
            expect(tubularTranslate.currentLanguage && tubular.defaultLanguage).toBe('en');
        });

        it('should have translation tables to have same keys', function () {
            tubularTranslate.translationTable.forEach(value, key);
        });

        it('should change the language', function () {
            tubularTranslate.setLanguage('es');
            expect(tubularTranslate.currentLanguage).toBe('es');

        });

        it('should translate', function () {
            tubularTranslate.setLanguage('es');
            var result = tubularTranslate.translate('OP_EQUALS');
            expect(result).toBe('Equals');

        });

        it('should add new translation', function () {

            tubularTranslate.addTranslation('it', 'OP_STARTSWITH', 'Inizia con');
            expect(translationTable[2]).toBe('it');

        });

    });
});