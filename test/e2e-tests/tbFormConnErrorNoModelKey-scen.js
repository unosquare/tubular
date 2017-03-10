describe('tbForm Connection Error NoModelKey',() => {
    var errorText;

    beforeAll(() => {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormConnErrorNoModelKeyTest')).click();
        
        /**********************/
        // * Test variables * //
        /**********************/
        // Get component
        errorText = element(by.id('error')).getText();
    });

    it('tbForm connection error functionality',() => expect(errorText).toEqual('No data found'));
});