'use strict';

describe('Module: tubular.services', () => {

    describe('Service: tubularTranslate', () => {
        var tubularTranslate;

        beforeEach(() => {
            module('tubular.services');

            inject(_tubularTranslate_ => tubularTranslate = _tubularTranslate_);
        });

        it('should be defined', () => expect(tubularTranslate).toBeDefined());

        it('should have current language to be "en"', () => {
            expect(tubularTranslate.currentLanguage).toBe('en');
        });

        it('should have default language to be "en"', () => {
            expect(tubularTranslate.defaultLanguage).toBe('en');
        });

        xit('should have translation tables to have same keys', () => {
            tubularTranslate.translationTable.forEach(value, key);
        });

        it('should change the language', () => {
            tubularTranslate.setLanguage('es');
            expect(tubularTranslate.currentLanguage).toBe('es');
        });

        it('should translate', () => {
            tubularTranslate.setLanguage('es');
            expect(tubularTranslate.translate('OP_EQUALS')).toBe('Igual');

        });

        it('should add new translation', () => {
            tubularTranslate.addTranslation('it', 'OP_STARTSWITH', 'Inizia con');
            tubularTranslate.setLanguage('it');
            expect(tubularTranslate.translate('OP_STARTSWITH')).toBe('Inizia con');
        });
    });
});