/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

// This protractor scen file tests tbColumn and tbGrid components with OData.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static.

describe('OData', function() {

    var firstDataRow,
        lastDataRow,
        i_sortIcon,
        a_orderIdSorting,
        filterBtn,
        tbColumnFilter,
        popoverForm,
        applyBtn,
        clearBtn,
        filterSelect,
        valueInput,
        dataRows,
        a_customerNameSorting,
        a_shippedDateSorting;

    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbODataTest')).click();

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

    describe('Grid OData Sorting', function() {

        beforeAll(function () {
            // Set test variables
            tbColumnFilter = element(by.tagName('tb-column-filter'));
            filterBtn = tbColumnFilter.$('.btn-popover');
            popoverForm = $('tb-column-filter form.tubular-column-filter-form');
            applyBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-success');
            clearBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-danger');
            filterSelect = popoverForm.$('select');
            valueInput = popoverForm.$('input:not(.ng-hide)');
            dataRows = element.all(by.repeater('row in $component.rows'));
        });

        var dataSetLowerID = '10248',
            dataSetHigherID = '11077',
            dataSet100HigerID = '10347';
            dataSet100LowerID = '10978';
            dataSetLowerCustomerName = 'ALFKI',
            dataSet100LowerCustomerName = 'TORTU',
            dataSetHigherCustomerName = 'WOLZA',
            dataSet100HigherCustomerName = 'BOTTM',
            dataSetLowerDate = /7\/4\/96 */,
            dataSet100LowerDate = /3\/26\/98 */,
            dataSetHigherDate = /5\/6\/98 */;
            dataSet100HigherDate = /11\/6\/96 */;

        beforeEach(function() {
            // Clear possible sortings and start with default
            a_orderIdSorting.click().then(function(){
                i_sortIcon.getAttribute('class').then(function(sortIconClass) {
                if (sortIconClass.indexOf('arrow') != -1) {
                    if (sortIconClass.indexOf('arrow-up') != -1) {
                        a_orderIdSorting.click();
                    }

                    a_orderIdSorting.click();
                }
            });
            });
        });

        it('should order data in ascending order when click-sorting an unsorted numeric column', function() {
            a_orderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetLowerID);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSet100HigerID);
        });

        it('should order data in descending order when click-sorting an ascending-sorted numeric column', function() {
            a_orderIdSorting.click();
            a_orderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetHigherID);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSet100LowerID);
        });

        it('should order data in ascending order when click-sorting an unsorted text column', function() {
            a_customerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSet100HigherCustomerName);
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function() {
            a_customerNameSorting.click();
            a_customerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSet100LowerCustomerName);
        });

        it('should order data in ascending order when click-sorting an unsorted date column', function() {
            a_shippedDateSorting.click();

            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetLowerDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSet100HigherDate);
        });

        it('should order data in descending order when click-sorting an ascending-sorted date column', function() {
            a_shippedDateSorting.click();
            a_shippedDateSorting.click();

            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetHigherDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSet100LowerDate);
        });

        it('should correctly filter data for the "Contains" filtering option', function () {
            var filterOk = true;
            var containedString = 'KI';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Contains"]').click();
            valueInput.sendKeys(containedString);
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer.indexOf(containedString) != -1);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });
    });
});