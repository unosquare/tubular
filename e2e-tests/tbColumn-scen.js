/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests tbColumn and tbGrid components.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbColumn', function() {

    var firstDataRow,
        lastDataRow,
        iSortIcon,
        aOrderIdSorting,
        aCustomerNameSorting,
        aShippedDateSorting;

    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbColumnSortingTest')).click();

        // Go to first page if not there    
        element(by.tagName('tb-grid-pager'))
            .$('li.pagination-first a')
            .click();

        // Select '100' on tbPageSizeSelector
        element(by.model('$ctrl.$component.pageSize'))
            .$('[value="number:100"]').click();
        /**********************/
        // * Test variables * //
        /**********************/
        // First showing row
        firstDataRow = element.all(by.repeater('row in $component.rows')).first();
        // Last showing row
        lastDataRow = element.all(by.repeater('row in $component.rows')).last();
        // Font-awesome sort icon (indicates sort-enabled and sort order)
        iSortIcon = element(by.tagName('thead'))
            .$$('tr th').first()
            .$('i');
        // Sort Order ID column link
        aOrderIdSorting = element(by.tagName('thead'))
            .$$('tr th').first()
            .$('a');
        // Sort Customer Name column link
        aCustomerNameSorting = element(by.tagName('thead'))
            .$$('tr th').get(1)
            .$('a');
        // Sort Shipped Date column link
        aShippedDateSorting = element(by.tagName('thead'))
            .$$('tr th').get(2)
            .$('a');
    });

    describe('Grid Sorting', function() {

        var dataSetLowerId = '1',
            dataSetHigherId = '53',
            dataSetLowerCustomerName = 'Advanced Technology Systems',
            dataSetHigherCustomerName = 'Vesta',
            dataSetLowerDate = /1\/28\/16 \d:17.*/,
            dataSetHigherDate;

        beforeEach(function() {
            // Clear possible sorting and start with default
            aShippedDateSorting.click();
            aShippedDateSorting.click();
            dataSetHigherDate = firstDataRow.$$('td').get(2).getText();
            aOrderIdSorting.click();
            iSortIcon.getAttribute('class').then(function(sortIconClass) {
                if (sortIconClass.indexOf('arrow') !== -1) {
                    if (sortIconClass.indexOf('arrow-up') !== -1) {
                        aOrderIdSorting.click();
                    }
                    aOrderIdSorting.click();
                }
            });
        });

        it('should order data in ascending order when click-sorting an unsorted numeric column', function() {
            aOrderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetLowerId);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSetHigherId);
        });

        it('should order data in descending order when click-sorting an ascending-sorted numeric column', function() {
            aOrderIdSorting.click();
            aOrderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetHigherId);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSetLowerId);
        });

        it('should order data in ascending order when click-sorting an unsorted text column', function() {
            aCustomerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function() {
            aCustomerNameSorting.click();
            aCustomerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
        });
        it('should order data in ascending order when click-sorting an unsorted date column', function () {
            aShippedDateSorting.click();
            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetLowerDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSetHigherDate);
            aShippedDateSorting.click();
            aShippedDateSorting.click();
        });
        it('should order data in descending order when click-sorting an ascending-sorted date column', function () {
            aShippedDateSorting.click();
            aShippedDateSorting.click();
            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetHigherDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSetLowerDate);
        });

    });

    describe('Grid Components', function() {
        it('should print grid', function () {
            var mainWindow;
            browser.getAllWindowHandles().then(function(handles) {
                mainWindow = handles[0]; //at this point there should be only 1 window
            }).then(function() {
                element(by.tagName('tb-print-button')).click().then(function () {
                    browser.getAllWindowHandles().then(function (handles) {
                        handles.forEach(function(handle) {
                            if (handle !== mainWindow) {
                                browser.switchTo().window(handle).then(function () { expect(browser.getCurrentUrl()).toMatch(/about/);  });
                            }
                        });
                    });
                });
            });
        });

        it('should export grid', function() {
            element(by.tagName('tb-export-button')).click().then(function() {
                element(by.tagName('tb-export-button')).$$('a').first().click().then(function() {
                });
            });
        });

        it('should show column selector', function () {
            element(by.tagName('tb-column-selector')).click();

            expect(element(by.css('div.modal')).isDisplayed()).toBe(true);

            // Send escape to close
            element(by.css('div.modal')).sendKeys('\uE00C');
        });
    });
});