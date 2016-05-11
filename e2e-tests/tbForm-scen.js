describe("tbForm",function(){
    var tbForm,
        orderIdEditor,
        customerNameEditor,
        shipperCityEditor,
        amountEditor,
        shippedDateEditor,
        createdUserIdEditor,
        isShippedEditor;
    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormTest')).click();
        
        /**********************/
        // * Test variables * //
        /**********************/
        // Get component
        tbForm = element(by.id('tbForm0'));
        //  Get fields from tb-form
        orderIdEditor = element(by.css('input[name=OrderID]'));
        customerNameEditor = element(by.css('input[name=CustomerName]'));
        shipperCityEditor = element(by.css('input[name=ShipperCity]'));
        amountEditor = element(by.css('input[name=Amount]'));
        shippedDateEditor = element(by.css('input[name=ShippedDate]'));
        createdUserIdEditor = element(by.css('input[name=CreatedUserId]'));
        orderTypeEditor = element(by.css('input[name=OrderType]'));
        isShippedEditor = element(by.css('input[name=IsShipped]'));
    });
    it("tbForm defined",function(){
        expect(tbForm).toBeDefined();
        expect(tbForm).not.toBeNull();
    });
    it("tbForm editors filled out",function(){
        expect(orderIdEditor.getAttribute('value')).toBe("53");
        expect(customerNameEditor.getAttribute('value')).toBe("Microsoft");
        expect(shipperCityEditor.getAttribute('value')).toBe("Portland, OR, USA");
        expect(amountEditor.getAttribute('value')).toBe("362");
        expect(shippedDateEditor.getAttribute('value')).toBe("2016-02-06");
        expect(createdUserIdEditor.getAttribute('value')).toBe("mariodivece");
        expect(orderTypeEditor.getAttribute('value')).toBe("24");
        expect(isShippedEditor.getAttribute('checked')).toBe('true');
    });
    
    it("Cancel button",function(){
        //  Button Cancel
        element(by.id('btnCancel')).click();
        
        expect(orderIdEditor.getAttribute('value')).toBe("");
        expect(customerNameEditor.getAttribute('value')).toBe("");
        expect(shipperCityEditor.getAttribute('value')).toBe("");
        expect(amountEditor.getAttribute('value')).toBe("");
        // TODO: Empty date is not working
        //expect(shippedDateEditor.getAttribute('value')).toBe("");
        expect(createdUserIdEditor.getAttribute('value')).toBe("");
        expect(orderTypeEditor.getAttribute('value')).toBe("");    
    });
});