var TbGridApi = require('./tb-grid-api')
/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('Free text search', function () {

    beforeEach(function () {
        browser.get('/');

    });

    afterEach(function () {
        browser.executeScript('window.sessionStorage.clear();window.localStorage.clear();');
    });

    it("search only text columns", function () {
        expect(true).toBe(true);
    });
});