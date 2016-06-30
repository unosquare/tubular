
// This protractor scen file tests the tbGridComponents.

describe('tbGridComponents', function () {

    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridComponentsTest')).click();
    });

    it('should add item with newRow method', function () {
        var lastItem = element.all(by.repeater('row in $component.rows')).last().getText();

        element(by.id('newButton')).click().then(function() {
            var newRow = $('tr[ng-show]');
            expect(newRow.isDisplayed()).toBe(true);
            newRow.$('input').sendKeys('DEMO');

            newRow.$$('button').first().click().then(function() {
                var newLastItem = element.all(by.repeater('row in $component.rows')).last().getText();

                expect(lastItem).not.toBe(newLastItem);
            });
        });
    });

    it('should add item with newRow method and cancel action', function () {
        element(by.id('newButton')).click().then(function () {
            var newRow = $('tr[ng-show]');
            expect(newRow.isDisplayed()).toBe(true);

            newRow.$$('button').last().click().then(function () {
                expect(newRow.isDisplayed()).toBe(false);
            });
        });
    });

    it('should update item with tbSaveButton', function () {
        var lastItem = element.all(by.repeater('row in $component.rows')).last();
        var originalValue = lastItem.$$('td').last().getText();
        console.log(lastItem);

        lastItem.$$('button').first().click().then(function () {
            console.log("Showing");
            lastItem.$('input').sendKeys('TEST');
        });
    });

    it('should update item with tbSaveButton and cancel action', function () {
        var lastItem = element.all(by.repeater('row in $component.rows')).last();
        var originalValue = lastItem.$$('td').last().getText();
        console.log(lastItem);

        lastItem.$$('button').first().click().then(function () {
            console.log("Showing");
            lastItem.$('input').sendKeys('TEST');

            lastItem.$$('button').last().click().then(function () {

                expect(lastItem.$$('td').last().getText()).not.toBe(originalValue);
            });
        });
    });

    it('should remove item with tbRemoveButton', function () {
        var originalCount = element.all(by.repeater('row in $component.rows')).count();
        var lastItem = element.all(by.repeater('row in $component.rows')).last();

        lastItem.$('tb-remove-button').click().then(function () {
            expect($('div.popover').isDisplayed()).toBe(true);

            $('div.popover').$$('button').first().click().then(function() {
                element.all(by.repeater('row in $component.rows')).count().then(function (count) {
                    expect(count).not.toBe(originalCount);
                });
            });
        });
    });

    it('should remove item with tbRemoveButton and cancel action', function () {
        var lastItem = element.all(by.repeater('row in $component.rows')).last();

        lastItem.$('tb-remove-button').click().then(function () {
            expect($('div.popover').isDisplayed()).toBe(true);

            $('div.popover').$$('button').last().click().then(function () {
                element.all($('div.popover')).count().then(function (count) {
                    expect(count).toBe(0);
                });
            });
        });
    });
});
