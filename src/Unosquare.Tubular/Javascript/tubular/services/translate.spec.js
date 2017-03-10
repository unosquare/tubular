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

        it('should have current language to be "en"', function () {
            expect(tubularTranslate.currentLanguage).toBe('en');
        });

        it('should have default language to be "en"', function () {
            expect(tubularTranslate.defaultLanguage).toBe('en');
        });

        xit('should have translation tables to have same keys', function () {
            tubularTranslate.translationTable.forEach(value, key);
        });

        it('should change the language', function () {
            tubularTranslate.setLanguage('es');
            expect(tubularTranslate.currentLanguage).toBe('es');
        });

        it('should translate', function () {
            tubularTranslate.setLanguage('es');
            expect(tubularTranslate.translate('OP_EQUALS')).toBe('Igual');

        });

        it('should add new translation', function () {
            tubularTranslate.addTranslation('it', 'OP_STARTSWITH', 'Inizia con');
            tubularTranslate.setLanguage('it');
            expect(tubularTranslate.translate('OP_STARTSWITH')).toBe('Inizia con');
        });

    });
});