// This protractor scen file tests tubular-directives-filters components.

// tbFilterButtons internal component is implicitlly tested by the other tests in this file.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbColumn_tests.html) is static and constrained
// to 53 records with consecutive ID's.

function loadData() {
    browser.sleep(5000);
    return browser.wait(function () {
        return $('.tubular-overlay.ng-hide').isPresent().then(function (isPresent) {
            return isPresent;
        });
    });
}

describe('Tubular Filters', function () {

    describe('tbColumnFilter', function () {
        var tbColumnFilter,
            filterBtn,
            popoverForm,
            applyBtn,
            clearBtn,
            filterSelect,
            valueInput,
            dataRows;

        beforeAll(function () {
            // Get page
            browser.get('index.html');
            element(by.id('testsSelector')).click();
            element(by.id('tbFiltersTest')).click();

            // Set test variables
            tbColumnFilter = element(by.tagName('tb-column-filter'));
            filterBtn = tbColumnFilter.$('.btn-popover');
            popoverForm = $('form.tubular-column-filter-form');
            applyBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-success');
            clearBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-danger');
            filterSelect = popoverForm.$('select');
            valueInput = popoverForm.$('input:not(.ng-hide)')
            dataRows = element.all(by.repeater('row in $component.rows'));

            // Always show 50 recods and go to first page
            loadData()
                .then(function () {
                    element(by.model('$ctrl.$component.pageSize')).$('[value="number:50"]').click();
                    element(by.tagName('tb-grid-pager')).$('.pagination-first a').click();
                });
        });

        beforeEach(function () {
            // Close popover, if it's open
            element(by.tagName('tb-grid-pager')).$('.pagination-first a').click();

            // Clear filters
            filterBtn.click()
                .then(function () {
                    clearBtn.click()
                        .then(function () {
                            loadData();
                        });
                });
        });

        it('should cancel filtering when clicking outside filter-popover', function () {
            var originalData;
            var equalData;

            dataRows.getText()
                // Get original text
                .then(function (originalText) {
                    originalData = originalText;
                })
                // Filter and click away
                .then(function () {
                    filterBtn.click()
                        // Set filtering
                        .then(function () {
                            filterSelect.$('[value="string:Equals"]').click();
                            valueInput.sendKeys('Microsoft');
                        })
                        // Click another element
                        .then(function () {
                            element(by.tagName('tb-grid-pager')).$('li.pagination-first a').click();
                        })
                })
                // Compare data again
                .then(function () {
                    dataRows.getText()
                        .then(function (modifiedText) {
                            equalData = (originalData.length == modifiedText.length) && originalData.every(function (element, index) {
                                return element === modifiedText[index];
                            });

                            expect(equalData).toBe(true);
                        });
                });
        });

        it('should disable Value text-input for "None" filter', function () {
            filterBtn.click();
            filterSelect.$('[value="string:None"]').click();

            expect(valueInput.getAttribute('disabled')).toBe('true');
        });

        it('should disable apply button for "None" filter', function () {
            filterBtn.click();

            filterSelect.$('[value="string:None"]').click();
            expect(applyBtn.getAttribute('disabled')).toBe('true');
        });

        it('should clear filtering when clicking on apply button for "None" filter', function () {
            var originalData;
            var equalData;

            dataRows.getText()
                // Get original showing data
                .then(function (oldText) {
                    originalData = oldText;
                })
                // Set filter and apply <-- This is tested by other 'it' block
                .then(function () {
                    filterBtn.click();
                    filterSelect.$('[value="string:Equals"]').click();
                    valueInput.sendKeys('Microsoft');
                    applyBtn.click()
                        .then(function () {
                            loadData();
                        });
                })
                // Filter with "None" and apply
                .then(function () {
                    filterBtn.click();
                    filterSelect.$('[value="string:None"]').click();
                    applyBtn.click()
                        .then(function () {
                            loadData();
                        });
                })
                // Compare data
                .then(function () {
                    dataRows.getText()
                        .then(function (newText) {
                            equalData = (originalData.length == newText.length) && originalData.every(function (element, index) {
                                return element === newText[index];
                            });

                            expect(equalData).toBe(true);
                        });
                });
        });

        it('should decorate popover button when showing data is being filtered for its column', function () {
            // Verify button has no decorating-class
            expect(filterBtn.getAttribute('class')).not.toMatch(/btn-success/);

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click()
                .then(function () {
                    loadData().
                        then(function () {
                            expect(filterBtn.getAttribute('class')).toMatch(/btn-success/);
                        });
                });
        });

        it('should corretlly filter data for the "Equals" filtering option', function () {
            var filterOk = true;
            var filteredCustomer = 'Microsoft';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer == filteredCustomer);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Not Equals" filtering option', function () {
            var filterOk = true;
            var notShowingCustomer = 'Microsoft';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:NotEquals"]').click();
            valueInput.sendKeys('Microsoft');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer != notShowingCustomer);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Contains" filtering option', function () {
            var filterOk = true;
            var containedString = 'La';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Contains"]').click();
            valueInput.sendKeys('La');
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

        it('should corretlly filter data for the "Not Contains" filtering option', function () {
            var filterOk = true;
            var notContainedString = 'La';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:NotContains"]').click();
            valueInput.sendKeys('La');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer.indexOf(notContainedString) == -1);
                                if (filterOk == false) {
                                    console.log(notContainedString);
                                    console.log(customer);
                                }
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Starts With" filtering option', function () {
            var filterOk = true;
            var startsWithString = 'Uno';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer.indexOf(startsWithString) == 0);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Not Starts With" filtering option', function () {
            var filterOk = true;
            var notStartsWithString = 'Uno';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer.indexOf(notStartsWithString) != 0);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Ends With" filtering option', function () {
            var filterOk = true;
            var endsWithString = 'xo';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {

                                filterOk = filterOk &&
                                    (customer.indexOf(endsWithString) == (customer.length - endsWithString.length) + 1);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Not Ends With" filtering option', function () {
            var filterOk = true;
            var endsWithString = 'o';

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:StartsWith"]').click();
            valueInput.sendKeys('La');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(1).getText()
                            .then(function (customer) {

                                filterOk = filterOk &&
                                    (customer.indexOf(endsWithString) != (customer.length - endsWithString.length) + 1);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

    });
    
});