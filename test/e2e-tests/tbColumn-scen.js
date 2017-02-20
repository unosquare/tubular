/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests tbColumn and tbGrid components.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbColumn', function () {

    var firstDataRow,
        lastDataRow,
        iSortIcon,
        aOrderIdSorting,
        aCustomerNameSorting,
        aCreationDateSorting;

    function updateFirstAndLastRow() {
        // First showing row
        firstDataRow = element.all(by.repeater('row in $component.rows')).first();
        // Last showing row
        lastDataRow = element.all(by.repeater('row in $component.rows')).last();
    }

    describe('Grid Sorting', function () {
        beforeEach(function () {
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

            updateFirstAndLastRow();

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
            aCreationDateSorting = element(by.tagName('thead'))
                .$$('tr th').get(3)
                .$('a');
        });

        afterEach(function () {
            element(by.id('btnClearLocalStorage')).click();
        });

        var dataSetLowerId = '1',
            dataSetHigherId = '500',
            dataSetLowerCustomerName = 'Advanced Technology Systems',
            dataSetHigherCustomerName = 'Vesta',
            dataSetLowerDate = /12\/30\/2015/,
            dataSetHigherDate = /1\/01\/2016/;

        it('should sort data in ascending order then on descending order when sorting by Order Id column', function () {
            aOrderIdSorting.click().then(function () {
                updateFirstAndLastRow();
                expect(firstDataRow.$$('td').first().getText()).toBe(dataSetLowerId);
                expect(lastDataRow.$$('td').first().getText()).toBe('100');

                aOrderIdSorting.click().then(function () {
                    updateFirstAndLastRow();
                    expect(firstDataRow.$$('td').first().getText()).toBe(dataSetHigherId);
                    expect(lastDataRow.$$('td').first().getText()).toBe('401');
                });
            });
        });


        it('should order data in ascending order when click-sorting an unsorted text column', function () {

            aCustomerNameSorting.click().then(function () {
                updateFirstAndLastRow();
                expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
            });

        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function () {

            aCustomerNameSorting.click().then(function () {
                aCustomerNameSorting.click().then(function () {
                    updateFirstAndLastRow();
                    expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
                });
            });
        });

        it('should order data in ascending order when click-sorting an unsorted date column', function () {
            aCreationDateSorting.click().then(function () {
                updateFirstAndLastRow();
                expect(firstDataRow.$$('td').get(3).getText()).toMatch(dataSetLowerDate);
            });
        });

        it('should order data in descending order when click-sorting twice an unsorted date column', function () {
            aCreationDateSorting.click().then(function () {
                aCreationDateSorting.click().then(function () {
                    updateFirstAndLastRow();
                    expect(firstDataRow.$$('td').get(3).getText()).toMatch(dataSetHigherDate);
                });
            });
        });
    });
});