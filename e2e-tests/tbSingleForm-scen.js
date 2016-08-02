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
            $('#btnSave').click();
            
        });
    
        it('should save it', function(){
            expect($('#textSave').getText()).toBe('Saved');
            browser.get('index.html');
            element(by.id('testsSelector')).click();
            element(by.id('tbSingleFormTest')).click();
            $('input').clear();
            $('input').sendKeys('Microsoft');
            $('#btnSave').click(); 
        });
        
        it('should clear the inputs', function(){
            $('#btnCancel').click().then(function(){
                expect($('input').getAttribute('value')).toBe('');
            });
        });
        
        it('should update', function(){
            $('#btnDefault').click();           
            $("#btnUpdate").click().then(function(){
                browser.get('index.html');
                element(by.id('testsSelector')).click();
                element(by.id('tbSingleFormTest')).click();
                expect($('input').getAttribute('value')).toBe('Unosquare');                 
            });
            $('input').clear();
            $('input').sendKeys('Microsoft');
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
});