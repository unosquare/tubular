/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('tbSingleForm', function () {

    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbEmptyFormTest')).click();

    });

    describe("Form validations", function(){
        it('should have an empty required field', function() {
            expect($('input').getAttribute('value')).toBe('');
        });

        it('should not be able to click on save', function() {
            expect($('#btnSave').getAttribute('disabled')).not.toBeNull(null);
            expect($('#btnSave').getAttribute('disabled')).not.toBe('');
        });
    });
});