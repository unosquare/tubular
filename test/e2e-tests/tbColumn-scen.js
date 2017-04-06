/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests tbColumn and tbGrid components.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbColumn', () => {

    var firstDataRow,
        lastDataRow,
        aOrderIdSorting,
        aCustomerNameSorting,
        aCreationDateSorting;

    function updateFirstAndLastRow() {
        // First showing row
        firstDataRow = element.all(by.repeater('row in $component.rows')).first();
        // Last showing row
        lastDataRow = element.all(by.repeater('row in $component.rows')).last();
    }

    describe('Grid Sorting', () => {
        beforeEach(() => {
            // Go to test
            browser.get('index.html');
            browser.executeScript('window.sessionStorage.clear();window.localStorage.clear();');
            element(by.id('testsSelector')).click();
            element(by.id('tbColumnSortingTest')).click();

            // Go to first page if not there    
            element(by.tagName('tb-grid-pager'))
                .$('li.pagination-first a')
                .click();

            // Select '20' on tbPageSizeSelector
            element(by.model('$ctrl.$component.pageSize'))
                .$('[value="number:20"]').click();
            
            updateFirstAndLastRow();

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

        var dataSetLowerCustomerName = 'Advanced Technology Systems',
            dataSetHigherCustomerName = 'Vesta',
            dataSetLowerDate = /12\/30\/2015/,
            dataSetHigherDate = /1\/01\/2016/;

        it('should sort data in ascending order then on descending order when sorting by Order Id column', () => {
            aOrderIdSorting.click().then(() => {
                updateFirstAndLastRow();
                expect(firstDataRow.$$('td').first().getText()).toBe('1');
                expect(lastDataRow.$$('td').first().getText()).toBe('20');

                aOrderIdSorting.click().then(() => {
                    updateFirstAndLastRow();
                    expect(firstDataRow.$$('td').first().getText()).toBe('500');
                    expect(lastDataRow.$$('td').first().getText()).toBe('481');
                });
            });
        });

        it('should order data in ascending order when click-sorting an unsorted text column', () => {
            aCustomerNameSorting.click().then(() => {
                updateFirstAndLastRow();
                expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
            });
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', () => {
            aCustomerNameSorting.click().then(() => {
                aCustomerNameSorting.click().then(() => {
                    updateFirstAndLastRow();
                    expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
                });
            });
        });

        it('should order data in ascending order when click-sorting an unsorted date column', () => {
            aCreationDateSorting.click().then(() => {
                updateFirstAndLastRow();
                expect(firstDataRow.$$('td').get(3).getText()).toMatch(dataSetLowerDate);
            });
        });

        it('should order data in descending order when click-sorting twice an unsorted date column', () => {
            aCreationDateSorting.click().then(() => {
                aCreationDateSorting.click().then(() => {
                    updateFirstAndLastRow();
                    expect(firstDataRow.$$('td').get(3).getText()).toMatch(dataSetHigherDate);
                });
            });
        });
    });
});