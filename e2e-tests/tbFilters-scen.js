// This protractor scen file tests tubular-directives-filters components.

// tbFilterButtons internal component is implicitlly tested by the other tests in this file.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static and constrained
// to 53 records with consecutive ID's.

describe('Tubular Filters', function () {

    var tbColumnFilter,
        filterBtn,
        popoverForm,
        applyBtn,
        clearBtn,
        filterSelect,
        valueInput,
        dataRows;

    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFiltersTest')).click();

        // Go to page 1 if not there
        element(by.tagName('tb-grid-pager'))
            .$('li.pagination-first a')
            .click();

        // Limit tests to 10 showing elements
        element(by.model('$ctrl.$component.pageSize'))
            .$('[value="number:50"]')
            .click();

        /**********************/
        // * Test variables * //
        /**********************/
        tbColumnFilter = element(by.tagName('tb-column-filter'));
        filterBtn = tbColumnFilter.$('.btn-popover');
        popoverForm = $('form.tubular-column-filter-form');
        applyBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-success');
        clearBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-danger');
        filterSelect = popoverForm.$('select');
        valueInput = popoverForm.$('input:not(.ng-hide)')
        dataRows = element.all(by.repeater('row in $component.rows'));


        // Sort items by ascending ID if they aren't
        element.all(by.repeater('row in $component.rows'))
            .first()
            .getText()
            .then(function (textId) {
                if (textId != 1) {
                    element(by.tagName('thead'))
                        .$$('tr th').first()
                        .$('a')
                        .click();
                }
            });
    });

    describe('tbColumnFilter', function () {

        beforeEach(function () {
            // Clear filter
            filterBtn.click();
            clearBtn.click();
        });

        it('should cancel filtering when clicking outside filter-popover', function () {
            var originalData;
            var equalData;

            dataRows.getText().then(function (originalText) {
                originalData = originalText;
            });

            // Set filtering
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('Microsoft');

            // Click another element
            element(by.tagName('tb-grid-pager'))
                .$('li.pagination-first a')
                .click();

            // Compare data again
            dataRows.getText().then(function (modifiedText) {
                equalData = (originalData.length == modifiedText.length) && originalData.every(function (element, index) {
                    return element === modifiedText[index];
                });

                expect(equalData).toBe(true);
            });
        });

        it('should disable Value text input for "None" filter', function () {
            filterBtn.click();
            filterSelect.$('[value="string:None"]').click();

            expect(valueInput.getAttribute('disabled')).toMatch('/true/');
        });

        it('should disable apply button for "None" filter', function () {
            filterBtn.click();
            filterSelect.$('[value="string:None"]').click();

            expect(applyBtn.getAttribute('disabled')).toMatch('/disabled/');
        });

        it('should clear filtering when clicking on apply button for "None" filter', function () {
            var originalData;
            var equalData;

            // Get showing data
            dataRows.getText().then(function (text) {
                originalData = text;
            });

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click();

            // Filter with "None" and apply
            filterBtn.click();
            filterSelect.$('[value="string:None"]').click();
            applyBtn.click();

            // Compare data again
            dataRows.getText().then(function (text) {
                equalData = (originalData.length == text.length) && originalData.every(function (element, index) {
                    return element === text[index];
                });
            });

            expect(equalData).toBe(true);
        });

        it('should decorate popover button when showing data is being filtered for its column', function () {
            // Verify button has no decorating-class
            expect(filterBtn.getAttribute('class')).not.toMatch('/btn-success/');

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click();

            expect(filterBtn.getAttribute('class')).toMatch('/btn-success/');
        });

        it('should corretlly filter data for the "Equals" filtering option', function () {
            var filterOk = true;
            var filteredCustomer = 'Microsoft';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer == filteredCustomer);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Not Equals" filtering option', function () {
            var filterOk = true;
            var notShowingCustomer = 'Microsoft';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:NotEquals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer != notShowingCustomer);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Contains" filtering option', function () {
            var filterOk = true;
            var containedString = 'La';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Contains"]').click();
            valueInput.sendKeys('La');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer.indexOf(containedString) != -1);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Not Contains" filtering option', function () {
            var filterOk = true;
            var notContainedString = 'LLC';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:NotContains"]').click();
            valueInput.sendKeys('La');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer.indexOf(notContainedString) == -1);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Starts With" filtering option', function () {
            var filterOk = true;
            var startsWithString = 'Uno';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer.indexOf(startsWithString) == 0);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Not Starts With" filtering option', function () {
            var filterOk = true;
            var notStartsWithString = 'Uno';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer.indexOf(notStartsWithString) != 0);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Ends With" filtering option', function () {
            var filterOk = true;
            var endsWithString = 'xo';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {

                        filterOk = filterOk &&
                            (customer.indexOf(endsWithString) == (customer.length - endsWithString.length) + 1);
                    });
            });

            expect(filterOk).toBe(true);
        });

        it('should corretlly filter data for the "Not Ends With" filtering option', function () {
            var filterOk = true;
            var endsWithString = 'o';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click();

            // Verify filtering
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {

                        filterOk = filterOk &&
                            (customer.indexOf(endsWithString) != (customer.length - endsWithString.length) + 1);
                    });
            });

            expect(filterOk).toBe(true);
        });

    });

});