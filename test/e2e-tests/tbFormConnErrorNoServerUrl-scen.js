/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('tbForm Connection Error NoServerUrl', () => {
    var errorText;

    beforeAll(() => {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormConnErrorNoServerUrlTest')).click();
        
        /**********************/
        // * Test variables * //
        /**********************/
        // Get component
        errorText = element(by.id('error')).getText();
    });

    it('tbForm connection error functionality',()  => expect(errorText).toEqual('No data found'));
});