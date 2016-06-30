// This protractor scen file tests tbColumn and tbGrid components with Local Data.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static.

describe('LocalData', function() {

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

    describe('Grid Local Data Sorting', function() {

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

        var dataSetLowerCustomerName = 'Apple',
            dataSetHigherCustomerName = 'Unosquare';

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

        it('should order data in ascending order when click-sorting an unsorted text column', function() {
            a_customerNameSorting.click();

            expect(firstDataRow.$$('td').get(0).getText()).toBe(dataSetLowerCustomerName);
            expect(lastDataRow.$$('td').get(0).getText()).toBe(dataSetHigherCustomerName);
        });

        it('should order data in descending order when click-sorting an ascending-sorted text column', function() {
            a_customerNameSorting.click();
            a_customerNameSorting.click();

            expect(firstDataRow.$$('td').get(0).getText()).toBe(dataSetHigherCustomerName);
            expect(lastDataRow.$$('td').get(0).getText()).toBe(dataSetLowerCustomerName);
        });

        it('should correctly filter data for the "Contains" filtering option', function () {
            var filterOk = true;
            var containedString = 'pp';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Contains"]').click();
            valueInput.sendKeys(containedString);
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
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