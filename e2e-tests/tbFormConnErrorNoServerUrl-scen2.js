describe("tbForm Connection Error",function(){
    
    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormConnErrorNoServerUrlTest2')).click();
        
        /**********************/
        // * Test variables * //
        /**********************/
        // Get component
        errorText = element(by.id('error')).getText();
    });
    it("tbForm connection error functionality",function(){
        expect(errorText).toEqual('');
    });
});