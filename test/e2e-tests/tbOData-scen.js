/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

// This protractor scen file tests tbColumn and tbGrid components with OData.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static.

describe('OData', function () {

    var firstDataRow,
        lastDataRow,
        iSortIcon,
        aOrderIdSorting,
        filterBtn,
        tbColumnFilter,
        popoverForm,
        applyBtn,
        filterSelect,
        valueInput,
        dataRows,
        aCustomerNameSorting,
        aShippedDateSorting;

    beforeAll(function () {
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

    describe('Grid OData Sorting', function () {

        beforeAll(function () {
            // Set test variables
            tbColumnFilter = element(by.tagName('tb-column-filter'));
            filterBtn = tbColumnFilter.$('.btn-popover');
            popoverForm = $('tb-column-filter form.tubular-column-filter-form');
            applyBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-success');
            filterSelect = popoverForm.$('select');
            valueInput = popoverForm.$('input:not(.ng-hide)');
            dataRows = element.all(by.repeater('row in $component.rows'));
        });

        var dataSetLowerId = '10248',
            dataSetHigherId = '11077',
            dataSet100HigerId = '10347',
            dataSet100LowerId = '10978',
            dataSetLowerCustomerName = 'ALFKI',
            dataSet100LowerCustomerName = 'TORTU',
            dataSetHigherCustomerName = 'WOLZA',
            dataSet100HigherCustomerName = 'BOTTM',
            dataSetLowerDate = '7/04/1996',
            dataSet100LowerDate = '3/26/1998',
            dataSetHigherDate = '5/06/1998';
        var dataSet100HigherDate = '11/06/1996';

        beforeEach(function () {
            // Clear possible sortings and start with default
            aOrderIdSorting.click().then(function () {
                iSortIcon.getAttribute('class').then(function (sortIconClass) {
                    if (sortIconClass.indexOf('arrow') !== -1) {
                        if (sortIconClass.indexOf('arrow-up') !== -1) {
                            aOrderIdSorting.click();
                        }

                        aOrderIdSorting.click();
                    }
                });
            });
        });

        it('should order data in ascending order when click-sorting an unsorted numeric column', function () {
            aOrderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetLowerId);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSet100HigerId);
        });

        it('should order data in descending order when click-sorting an ascending-sorted numeric column', function () {
            aOrderIdSorting.click();
            aOrderIdSorting.click();

            expect(firstDataRow.$$('td').first().getText()).toBe(dataSetHigherId);
            expect(lastDataRow.$$('td').first().getText()).toBe(dataSet100LowerId);
        });

        it('should order data in ascending order when click-sorting an unsorted text column', function () {
            aCustomerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetLowerCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSet100HigherCustomerName);
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function () {
            aCustomerNameSorting.click();
            aCustomerNameSorting.click();

            expect(firstDataRow.$$('td').get(1).getText()).toBe(dataSetHigherCustomerName);
            expect(lastDataRow.$$('td').get(1).getText()).toBe(dataSet100LowerCustomerName);
        });

        it('should order data in ascending order when click-sorting an unsorted date column', function () {
            aShippedDateSorting.click();

            expect(firstDataRow.$$('td').get(2).getText()).toMatch(dataSetLowerDate);
            expect(lastDataRow.$$('td').get(2).getText()).toMatch(dataSet100HigherDate);
        });

        it('should order data in descending order when click-sorting an ascending-sorted date column', function () {
            aShippedDateSorting.click();
            aShippedDateSorting.click();

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
                                filterOk = filterOk && (customer.indexOf(containedString) !== -1);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });
    });
});
