/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

// This protractor scen file tests the tubularHttp.
describe('tbHttp', function () {

    beforeEach(function () {
        browser.get('index.html');
        element(by.id('tbLogin')).click();
    });

    it('should be authenticated', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');

        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnAuth')).click().then(function () {
                expect($('#isAuth').getText()).toBe('Is Authenticated');
            });
        });
    });

    it('retrieve data', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnRetData')).click().then(function () {
                expect($('#lbRet').getText()).toBe('true');
            });
        });
    });

    it('should not login bad credentials', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.');

        element(by.id('submitBtn')).click().then(function () {
            // browser.pause();
            element(by.id('btnRemoveAuth')).click().then(function () {
                element(by.id('btnAuth')).click().then(function () {
                    expect($('#isAuth').getText()).toBe('Not Authenticated');
                });
            });
        });
    });

    it('should have a refresh token', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnRetData')).click().then(function () {
                expect($('#lbRet').getText()).toBe('true');
                expect($('#lbRefreshToken').getText()).not.toBeNull();
            });
        });
    });

    it('should remove authentication', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnRemoveAuth')).click().then(function () {
                expect($('#expAuth').getText()).toBe('Not Authenticated');
            });
        });
    });

    it('get method-Is not authenticated', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnRemoveAuth')).click();
            element(by.id('btnGet')).click().then(function () {
                expect($('#lbGet').getText()).toBe('cancel');
            });
        });
    });

    it('post method-Is not authenticated', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnRemoveAuth')).click();
            element(by.id('btnPost')).click().then(function () {
                expect($('#lbPost').getText()).toBe('null');
            });
        });
    });

    it('should regenerate access token on post', function () {

        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function () {
            element(by.id('btnExpireAccessToken')).click().then(function () {
                $('#lbAccessToken').getText().then(function (value) {
                    var originalAccessToken = value;

                    element(by.id('btnUseRefreshToken')).click().then(function () {
                        browser.pause();
                        expect($('#lbAccessToken').getText()).not.toBe(originalAccessToken);
                    });
                });
            });
        });
    });
});
