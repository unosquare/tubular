/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('tbEmptyForm', function () {

    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbEmptyFormTest')).click();

    });

    it('should have an empty required field', function () {
        expect($('input[name=CustomerName]').getAttribute('value')).toBe('');
    });

    it('should not be able to click on save', function () {
        expect($('#btnSave').isEnabled()).toBe(false);
    });

    it('should load default value for numeric field', function () {
        expect($('input[name=MinimumOrders]').getAttribute('value')).toBe('1');
    });
});