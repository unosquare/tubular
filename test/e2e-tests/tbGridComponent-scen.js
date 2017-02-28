/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests the tbGridComponents.

describe('tbGridComponents', () => {
    var dataRows;

    beforeAll(() => {
        // Go to test
        dataRows = element.all(by.repeater('row in $component.rows'));
        browser.get('index.html');
    });

    beforeEach(() => {
        browser.executeScript('window.sessionStorage.clear();window.localStorage.clear();');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridComponentsTest')).click();
    });

    it('should add item with newRow method', () => {
        var lastItem = dataRows.last().getText();
        element(by.id('newButton')).click().then(() => {
            var newRow = $('tr[ng-show]');
            expect(newRow.isDisplayed()).toBe(true, 'should add a new row');

            newRow.$('input').sendKeys(new Date().toString()).then(() => {

                newRow.$$('button').first().click().then(() => {
                    var newLastItem = dataRows.last().getText();
                    expect(lastItem).not.toBe(newLastItem);
                });
            });
        });
    });

    it('should add item with newRow method and cancel action', () => {
        element(by.id('newButton')).click().then(() => {
            var newRow = $('tr[ng-show]');
            expect(newRow.isDisplayed()).toBe(true, 'should add a new row');

            newRow.$$('button').last().click().then(() => {
                expect(newRow.isDisplayed()).toBe(false, 'should remove the added row if canceled');
            });
        });
    });

    it('should update item with tbSaveButton', () => {
        var lastItem = dataRows.last();

        lastItem.$('tb-edit-button').click().then(() => {
            lastItem.$('input').clear().sendKeys('TEST').then(() => {

                lastItem.$$('button').first().click().then(() => {
                    expect(lastItem.$$('td').last().getText()).toBe('TEST');
                });
            });
        });
    });

    it('should NOT update item on cancel Update action', () => {
        var lastItem = dataRows.last();

        lastItem.$$('td').last().getText().then(function (originalValue) {
            lastItem.$$('button').get(2).click().then(() => {
                lastItem.$('input').sendKeys('TEST');
                lastItem.$$('button').get(1).click().then(() => {
                    expect(lastItem.$$('td').last().getText()).toBe(originalValue);
                });
            });
        });
    });

    it('should remove item with tbRemoveButton', () => {
        var originalCount = dataRows.count();
        var rowToRemove = dataRows.first();
        rowToRemove.$('tb-remove-button').click().then(() => {
            expect($('div.popover').isDisplayed()).toBe(true, 'should display popover');

            $('div.popover').$$('button').first().click().then(() => {
                dataRows.count().then(function (count) {
                    expect(count).not.toBe(originalCount, 'should remove the row from the table');
                });
            });
        });
    });

    it('should NOT remove item on cancel Remove action', () => {
        var rowToRemove = dataRows.first();

        rowToRemove.$('tb-remove-button').click().then(() => {
            expect($('div.popover').isDisplayed()).toBe(true, 'should display popover');

            $('div.popover').$$('button').last().click().then(() => {
                element.all(by.css('popover')).count().then(count => expect(count).toBe(0, 'should hide popover'));
            });
        });
    });

});
