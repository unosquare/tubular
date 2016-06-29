
// This protractor scen file tests the tubularHttp.

describe('tbHttp', function () {

    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('tbLogin')).click();
    });

    
    it('should perform login', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');

        element(by.id('submitBtn')).click().then(function() {

        });
    });
});
