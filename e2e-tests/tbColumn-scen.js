// This protractor scen file tests tbColumn component.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbColumn', function() {

    var firstDataRow,
        lastDataRow,
        i_sortIcon,
        a_orderIdSorting,
        a_customerNameSorting,
        a_shippedDateSorting,
        a_shipperCitySorting;

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
        i_sortIcon = element(by.tagName('thead'))
            .$$('tr th').first()
            .$('i');
        // Sort Order ID column link
        a_orderIdSorting = element(by.tagName('thead'))
            .$$('tr th').first()
            .$('a');
        // Sort Customer Name column link
        a_customerNameSorting = element(by.tagName('thead'))
            .$$('tr th').get(1)
            .$('a');
        // Sort Shipped Date column link
        a_shippedDateSorting = element(by.tagName('thead'))
            .$$('tr th').get(2)
            .$('a');
    });

    describe('Grid Sorting', function() {

        var dataSetLowerID = '1',
            dataSetHigherID = '53',
            dataSetLowerCustomerName = 'Advanced Technology Systems',
            dataSetHigherCustomerName = 'Vesta',
            dataSetLowerDate = /1\/28\/16 \d:17.*/,
            dataSetHigherDate = /5\/11\/16 \d:00.*/;

        beforeEach(function() {
            // Clear possible sortings and start with default
            a_orderIdSorting.click();
            i_sortIcon.getAttribute('class').then(function(sortIconClass) {
                if (sortIconClass.indexOf('arrow') != -1) {
                    if (sortIconClass.indexOf('arrow-up') != -1) {
                        a_orderIdSorting.click();
                    }
                    a_orderIdSorting.click();
                }
            });
        });

        it('should order data in ascending order when click-sorting an unsorted numeric column', function() {
            a_orderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetLowerID);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSetHigherID);
        });

        it('should order data in descending order when click-sorting an ascending-sorted numeric column', function() {
            a_orderIdSorting.click();
            a_orderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetHigherID);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSetLowerID);
        });

        it('should order data in ascending order when click-sorting an unsorted text column', function() {
            a_customerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function() {
            a_customerNameSorting.click();
            a_customerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
        });

        it('should order data in ascending order when click-sorting an unsorted date column', function() {
            a_shippedDateSorting.click();

            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetLowerDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSetHigherDate);
        });

        it('should order data in descending order when click-sorting an ascending-sorted date column', function() {
            a_shippedDateSorting.click();
            a_shippedDateSorting.click();

            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetHigherDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSetLowerDate);
        });

    });

    describe('Grid Components', function() {
        it('should print grid', function () {
            element(by.tagName('tb-print-button')).click().then(function () {
                browser.getAllWindowHandles().then(function (handles) {
                    newWindowHandle = handles[1]; // this is your new window
                    browser.switchTo().window(newWindowHandle).then(function () {
                        expect(browser.getCurrentUrl()).toMatch(/about/);
                    });
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