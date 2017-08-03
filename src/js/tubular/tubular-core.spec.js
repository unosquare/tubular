'use strict';

describe('Module: tubular.core', () => {
    let tubular;

    beforeEach(() => {
        module('tubular.core');

        inject((_tubular_) => {
            tubular = _tubular_;
        });
    });

    it('should be defined', () => {
        expect(tubular).toBeDefined();
    });

    it('should find value in object', () => {
        const testObject = { ASC: 'ascending', DESC: 'descending' };
        expect(tubular.isValueInObject('ASC', testObject)).toBe(false);
        expect(tubular.isValueInObject('ascending', testObject)).toBe(true);
    });

    it('should find url in list', () => {
        const testObject = ['some/endpoint/url', 'other/endpoint/url2'];

        expect(tubular.isUrlInList(testObject, 'http://unosquarelabs.com/some/endpoint/url')).toBe(true);
        expect(tubular.isUrlInList(testObject, 'http://unosquarelabs.com/other/endpoint/url2')).toBe(true);
        expect(tubular.isUrlInList(testObject, 'http://unosquarelabs.com/unknown/endpoint/url')).toBe(false);
    });
});
