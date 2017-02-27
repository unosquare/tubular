/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('tbEmptyForm', () => {

    beforeAll(() => {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbEmptyFormTest')).click();

    });

    it('should have an empty required field', () => {
        expect($('input[name=CustomerName]').getAttribute('value')).toBe('');
    });

    it('should not be able to click on save', () => {
        expect($('#btnSave').isEnabled()).toBe(false);
    });

    it('should load default value for numeric field', () => {
        expect($('input[name=MinimumOrders]').getAttribute('value')).toBe('1');
    });
});