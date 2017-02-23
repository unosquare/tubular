/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

// This protractor scen file tests tbColumn and tnForm components.

describe('tbSingleForm', function() {
    beforeEach(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbSingleFormTest')).click();

    });

    xit('should load correct info', function () {
        // TODO: ORLY? Microsoft?
        expect($('input').getAttribute('value')).toBe('Microsoft');
    });

    it('should change customer name', function () {
        $('#btnDefault').click().then(function() {
            expect($('input').getAttribute('value')).toBe('Unosquare');
        });            
    });

    it('should save it', function (done) {
        element(by.tagName('select')).$$('[value="string:Guadalajara, JAL, Mexico"]').click();
        $('#btnDefault').click();
        $('#btnSave').click();
        
        expect($('#textSave').getText()).toBe('Saved');
        $('input').clear();
        $('input').sendKeys('Microsoft');
        element(by.tagName('select')).$$('[value="string:Guadalajara, JAL, Mexico"]').click();
        $('#btnSave').click().then(function () {
            expect($('#textSave').getText()).toBe('Saved');
            done();
        });
        
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
        $('#btnClear').click().then(function(){
            expect($('input').getAttribute('value')).toBe('');
            expect($('select').$('option:checked').getText()).toEqual('');
        });
    });

    it('should not save if not Changes', function(){
        var text = $('input').getAttribute('value');

        $('#btnSave').click().then(function(){
            expect($('input').getAttribute('value')).toEqual(text);
        });
    });

    it('should not be able to click on save', function() {
        $('#btnCancel').click().then(function() {
            expect($('#btnSave').getAttribute('disabled')).not.toBeNull(null);
            expect($('#btnSave').getAttribute('disabled')).not.toBe('');
        });
    });
});
