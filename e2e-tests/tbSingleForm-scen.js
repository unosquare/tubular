/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

// This protractor scen file tests tbColumn and tnForm components.

describe('tbSingleForm', function() {

    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbSingleFormTest')).click();

    });

    describe('Form fields', function() {
       it('should load correct info', function() {
            expect($('input').getAttribute('value')).toBe('Microsoft');
        });

        it('should change customer name', function () {

            $('#btnDefault').click().then(function() {
                expect($('input').getAttribute('value')).toBe('Unosquare');
            });            
        });
    
        it('should save it', function(){
            browser.get('index.html');
            element(by.id('testsSelector')).click();
            element(by.id('tbSingleFormTest')).click();
            $('#btnDefault').click();
            $('#btnSave').click();
            $('input').clear();
            $('input').sendKeys('Microsoft');
            $('#btnSave').click();
            expect($('#textSave').getText()).toBe('Saved');
        });
        
        it('should clear the inputs', function(){
            $('#btnCancel').click().then(function(){
                expect($('input').getAttribute('value')).toBe('');
            });
        });
        
        it('should update', function(){
            $('#btnDefault').click();
            if($('#textSave').getText() === ''){
                $('#btnUpdate').click();
                browser.get('index.html');
                element(by.id('testsSelector')).click();
                element(by.id('tbSingleFormTest')).click();
            }
            expect($('input').getAttribute('value')).toBe('Unosquare');                            
            $('input').clear();
            $('input').sendKeys('Microsoft');
            element(by.tagName('select')).$$('[value="string:Guadalajara, JAL, Mexico"]').click();
            $('#btnSave').click();
        });
        
        it('should reset editor', function(){
            browser.get('index.html');
            element(by.id('testsSelector')).click();
            element(by.id('tbSingleFormTest')).click();
            $("#btnClear").click().then(function(){
                expect($('input').getAttribute('value')).toBe('');
                expect($('select').$('option:checked').getText()).toEqual('');
            });
        });
        
        it('should not save if not Changes', function(){
            browser.get('index.html');
            element(by.id('testsSelector')).click();
            element(by.id('tbSingleFormTest')).click();
            var text = $('input').getAttribute('value');
            $('#btnSave').click().then(function(){
                expect($('input').getAttribute('value')).toEqual(text);
            });
        });
    });

    describe("Form validations", function() {
        it('should load correct info', function() {
            expect($('input').getAttribute('value')).toBe('Microsoft');
        });

        it('should not be able to click on save', function() {
            $('#btnCancel').click().then(function() {
                expect($('#btnSave').getAttribute('disabled')).not.toBeNull(null);
                expect($('#btnSave').getAttribute('disabled')).not.toBe('');
            });
        });
    });
});