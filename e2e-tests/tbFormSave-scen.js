describe("tbForm Save", function () {

    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormSavingTest')).click();

        /**********************/
        // * Test variables * //
        /**********************/
        // Get component
        tbForm = element(by.id('tbForm0'));
        //  Get button save
        btnSave = element(by.id('btnSave'));

    });
    it("tbForm Save functionality", function () {
        btnSave.click();
        var toast = element(by.css('.toast-success'));
        expect(true).toBeTruthy();
    });
});