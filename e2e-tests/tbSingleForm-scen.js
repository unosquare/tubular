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
            expect($('input').getText()).toBe('Microsoft');
        });

        it('should change customer name', function () {
            $('button[class=btn-warning]').click().then(function() {
                expect($('input').getText()).toBe('Unosquare');
            });
        });
    });
});