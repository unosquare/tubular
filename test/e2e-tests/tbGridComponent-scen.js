/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests the tbGridComponents.

describe('tbGridComponents', function () {
    var dataRows;

    beforeAll(function () {
        // Go to test
        dataRows = element.all(by.repeater('row in $component.rows'));
        browser.get('index.html');
    });

    beforeEach(function () {
        browser.executeScript('window.sessionStorage.clear();window.localStorage.clear();');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridComponentsTest')).click();
    });

    it('should add item with newRow method', function () {
        var lastItem = dataRows.last().getText();
        element(by.id('newButton')).click().then(function () {
            var newRow = $('tr[ng-show]');
            expect(newRow.isDisplayed()).toBe(true, 'should add a new row');

            newRow.$('input').sendKeys(new Date().toString()).then(function () {

                newRow.$$('button').first().click().then(function () {
                    var newLastItem = dataRows.last().getText();
                    expect(lastItem).not.toBe(newLastItem);
                });
            });
        });
    });

    it('should add item with newRow method and cancel action', function () {
        element(by.id('newButton')).click().then(function () {
            var newRow = $('tr[ng-show]');
            expect(newRow.isDisplayed()).toBe(true, 'should add a new row');

            newRow.$$('button').last().click().then(function () {
                expect(newRow.isDisplayed()).toBe(false, 'should remove the added row if canceled');
            });
        });
    });

    it('should update item with tbSaveButton', function () {
        var lastItem = dataRows.last();

        lastItem.$$('button').first().click().then(function () {
            console.log('clicked the edit button');
            lastItem.$('input').clear().sendKeys('TEST').then(function () {
                console.log('updated value');
                lastItem.$$('button').first().click().then(function () {
                    console.log('clicked update');
                    expect(lastItem.$$('td').last().getText()).toBe("TEST");
                });
            });
        });
    });

    it('should NOT update item on cancel Update action', function () {
        var lastItem = dataRows.last();

        lastItem.$$('td').last().getText().then(function (originalValue) {
            lastItem.$$('button').get(2).click().then(function () {
                lastItem.$('input').sendKeys('TEST');
                lastItem.$$('button').get(1).click().then(function () {
                    expect(lastItem.$$('td').last().getText()).toBe(originalValue);
                });
            });
        });
    });

    it('should remove item with tbRemoveButton', function () {
        var originalCount = dataRows.count();
        var rowToRemove = dataRows.first();
        rowToRemove.$('tb-remove-button').click().then(function () {
            expect($('div.popover').isDisplayed()).toBe(true, 'should display popover');

            $('div.popover').$$('button').first().click().then(function () {
                dataRows.count().then(function (count) {
                    expect(count).not.toBe(originalCount, 'should remove the row from the table');
                });
            });
        });
    });

    it('should NOT remove item on cancel Remove action', function () {
        var rowToRemove = dataRows.first();

        rowToRemove.$('tb-remove-button').click().then(function () {
            expect($('div.popover').isDisplayed()).toBe(true, 'should display popover');

            $('div.popover').$$('button').last().click().then(function () {
                element.all(by.css('popover')).count().then(function (count) {
                    expect(count).toBe(0, 'should hide popover');
                });
            });
        });
    });

});
