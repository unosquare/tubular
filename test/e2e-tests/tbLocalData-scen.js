/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

// This protractor scen file tests tbColumn and tbGrid components with Local Data.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static.

describe('LocalData', function() {

    var firstDataRow,
        lastDataRow,
        iSortIcon,
        filterBtn,
        tbColumnFilter,
        popoverForm,
        applyBtn,
        filterSelect,
        valueInput,
        dataRows,
        aCustomerNameSorting,
        aShippedCitySorting;

    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbLocalDataTest')).click();

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
        // Sort Customer Name column link
        aCustomerNameSorting = element(by.tagName('thead'))
            .$$('tr th').first()
            .$('a');
        // Sort Shipped Date column link
        aShippedCitySorting = element(by.tagName('thead'))
            .$$('tr th').get(2)
            .$('a');
    });

    describe('Grid Local Data Sorting', function() {

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

        var dataSetLowerCustomerName = 'Apple',
            dataSetHigherCustomerName = 'Unosquare';

        beforeEach(function() {
            // Clear possible sortings and start with default
            aShippedCitySorting.click();
            iSortIcon.getAttribute('class').then(function(sortIconClass) {
                if (sortIconClass.indexOf('arrow') !== -1) {
                    if (sortIconClass.indexOf('arrow-up') !== -1) {
                        aShippedCitySorting.click();
                    }

                    aShippedCitySorting.click();
                }
            });
        });

        it('should order data in ascending order when click-sorting an unsorted text column', function() {
            aCustomerNameSorting.click();
            expect(firstDataRow.$$('td').get(0).getText()).toBe(dataSetLowerCustomerName);
            expect(lastDataRow.$$('td').get(0).getText()).toBe(dataSetHigherCustomerName);
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function() {
            aCustomerNameSorting.click();
            aCustomerNameSorting.click();
            expect(firstDataRow.$$('td').get(0).getText()).toBe(dataSetHigherCustomerName);
            expect(lastDataRow.$$('td').get(0).getText()).toBe(dataSetLowerCustomerName);
            });

        it('should correctly filter data for the "Contains" filtering option', function () {
            var filterOk = true;
            var containedString = 'pp';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Contains"]').click();
            valueInput.clear();
            valueInput.sendKeys(containedString);

            //Time out to wait the applyBtn to be enabled
            //filterSelect.$('[value="string:Contains"]').click(); not working
            var EC = protractor.ExpectedConditions;
            browser.wait(EC.elementToBeClickable(applyBtn), 5000);

            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row) {
                        row.$$('td').first().getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer.indexOf(containedString) !== -1);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });
        
        it('should correctly filter data for the "Contains" with ENTER key', function () {
            var filterOk = true;
            var containedString = 'pp';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Contains"]').click();
            valueInput.clear();
            valueInput.sendKeys(containedString);
            valueInput.sendKeys(protractor.Key.ENTER)
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row) {
                        row.$$('td').first().getText()
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