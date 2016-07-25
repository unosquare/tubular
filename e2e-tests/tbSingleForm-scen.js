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
            $('input').clear().then(function(){
                $('input').sendKeys = "Microsoft";
            });
        });
        
        it('should save it', function(){
            $('#btnSave').click().then(function(){
                 expect($('#textSpan').getText()).toBe("Saved");
            });           
        });

        
    });
});