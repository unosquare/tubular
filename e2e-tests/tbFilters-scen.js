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

function setPagination() {
    element(by.model('$ctrl.$component.pageSize')).$('[value="number:50"]').click();
    element(by.tagName('tb-grid-pager')).$('.pagination-first a').click();
}

describe('Tubular Filters', function () {

    var tbColumnFilter,
        tbColumnDateTimeFilter,
        filterBtn,
        popoverForm,
        applyBtn,
        clearBtn,
        filterSelect,
        valueInput,
        secondValueInput,
        dataRows,
        tbTextSearch,
        tbTextSearchInput,
        tbTextSearchClearBtn;

    beforeAll(function () {
        // Get page
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFiltersTest')).click();
    });

    describe('tbColumnFilter', function () {

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

            // Always show 50 records and go to first page
            loadData().then(setPagination);
        });

        afterAll(function () {
            // Clear filters
            element(by.tagName('tb-grid-pager')).$('.pagination-first a').click()
                .then(function () {
                    element(by.tagName('tb-grid-pager')).$('.pagination-first a').click().then(function () {
                        filterBtn.click().then(function () {
                            clearBtn.click().then(function () {
                                loadData();
                            });
                        });
                    });
                });
        });

        beforeEach(function () {
            // Clear filters
            element(by.tagName('tb-grid-pager')).$('.pagination-first a').click()
                .then(function () {
                    element(by.tagName('tb-grid-pager')).$('.pagination-first a').click().then(function () {
                        filterBtn.click().then(function () {
                            clearBtn.click().then(function () {
                                loadData();
                            });
                        });
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
                        .then(function() {
                            filterSelect.$('[value="string:Equals"]').click().then(function() {
                                valueInput.sendKeys('Microsoft');
                            });
                        })
                        // Click another element
                        .then(function() {
                            element(by.tagName('tb-grid-pager')).$('li.pagination-first a').click();
                        });
                })
                // Compare data again
                .then(function () {
                    dataRows.getText()
                        .then(function (modifiedText) {
                            equalData = (originalData.length == modifiedText.length) && originalData.every(function (element, index) {
                                return element === modifiedText[index];
                            })
                        })
                        .then(function () {
                            expect(equalData).toBe(true);
                        });
                });
        });

        it('should disable Value text-input for "None" filter', function () {
            filterBtn.click().then(function () {
                filterSelect.$('[value="string:None"]').click().then(function () {
                    expect(valueInput.getAttribute('disabled')).toBe('true');
                });
            });
        });

        it('should disable apply button for "None" filter', function () {
            filterBtn.click().then(function () {
                expect(applyBtn.getAttribute('disabled')).toBe('true');
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

        it('should correctly filter data for the "Equals" filtering option', function () {
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

        it('should correctly filter data for the "Not Equals" filtering option', function () {
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

        it('should correctly filter data for the "Contains" filtering option', function () {
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

        it('should correctly filter data for the "Not Contains" filtering option', function () {
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
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should correctly filter data for the "Starts With" filtering option', function () {
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

        it('should correctly filter data for the "Not Starts With" filtering option', function () {
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

        it('should correctly filter data for the "Ends With" filtering option', function () {
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

        it('should correctly filter data for the "Not Ends With" filtering option', function () {
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

    describe('tbColumnDateTimeFilter', function () {

        beforeAll(function () {
            // Set test variables
            tbColumnDateTimeFilter = element(by.tagName('tb-column-date-time-filter'));
            filterBtn = tbColumnDateTimeFilter.$('.btn-popover');
            popoverForm = $('tb-column-date-time-filter form.tubular-column-filter-form');
            applyBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-success');
            clearBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-danger');
            filterSelect = popoverForm.$('select');
            valueInput = popoverForm.$$('input:not(.ng-hide)').first();
            secondValueInput = popoverForm.$$('input').last();
            dataRows = element.all(by.repeater('row in $component.rows'));

            // Always show 50 records and go to first page
            loadData().then(setPagination);
        });

         afterAll(function () {
             // Clear filters
             element(by.tagName('tb-grid-pager')).$('.pagination-first a').click()
                 .then(function () {
                     element(by.tagName('tb-grid-pager')).$('.pagination-first a').click().then(function () {
                         filterBtn.click().then(function () {
                             clearBtn.click().then(function () {
                                 loadData();
                             });
                         });
                     });
                 });
         });

         beforeEach(function () {
             // Clear filters
             element(by.tagName('tb-grid-pager')).$('.pagination-first a').click()
                 .then(function () {
                     element(by.tagName('tb-grid-pager')).$('.pagination-first a').click().then(function () {
                         filterBtn.click().then(function () {
                             clearBtn.click().then(function () {
                                 loadData();
                             });
                         });
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
                        .then(function() {
                            filterSelect.$('[value="string:Gt"]').click();
                            valueInput.sendKeys('02/05/2016');
                        })
                        // Click another element
                        .then(function() {
                            element(by.tagName('tb-grid-pager')).$('li.pagination-first a').click();
                        });
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
                    filterSelect.$('[value="string:Gt"]').click();
                    valueInput.sendKeys('02/05/2016');
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
            filterSelect.$('[value="string:Gt"]').click();
            valueInput.sendKeys('02/05/2016');
            applyBtn.click()
                .then(function () {
                    loadData().
                        then(function () {
                            expect(filterBtn.getAttribute('class')).toMatch(/btn-success/);
                        });
                });
        });

        it('should correctly filter data for the "Equals" filtering option', function () {
            var filterOk = true;
            var filterMatcher = /0*1\/30\/2016\s.*/;

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Equals"]').click();
            valueInput.sendKeys('01/30/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(2).getText()
                            .then(function (date) {
                                filterOk = filterOk && (filterMatcher.test(date));
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should correctly filter data for the "Not Equals" filtering option', function () {
            var filterOk = true;
            var filterMatcher = /0*1\/30\/2016\s.*/;

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:NotEquals"]').click();
            valueInput.sendKeys('01/30/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    dataRows.each(function (row, index) {
                        row.$$('td').get(2).getText()
                            .then(function (date) {

                                console.log('*************************** NOT EQUALS ****************************');
                                console.log('           date: ' + date);
                                console.log(filterMatcher.test(date));

                                filterOk = !filterOk && !(filterMatcher.test(date));

                                console.log('filterOk: ' + filterOk);

                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });  

        it('should correctly filter data for the "Between" filtering option', function () {
            var filterOk = true;
            var minDate = new Date('02/04/2016 00:00 AM');
            var maxDate = new Date('02/05/2016 00:00 AM');

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Between"]').click();
            valueInput.sendKeys('02/04/2016');
            secondValueInput.sendKeys('02/05/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    loadData().then(function () {
                        dataRows.each(function (row, index) {
                            row.$$('td').get(2).getText()
                                .then(function (date) {
                                    filterOk = filterOk && (minDate <= new Date(date) <= maxDate);
                                });
                        });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should correctly filter data for the "Greater-or-equal" filtering option', function () {
            var filterOk = true;
            var referenceDate = new Date('02/04/2016 00:00 AM');

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Gte"]').click();
            valueInput.sendKeys('02/04/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    loadData().then(function () {
                        dataRows.each(function (row, index) {
                            row.$$('td').get(2).getText()
                                .then(function (date) {
                                    filterOk = filterOk && (new Date(date) >= referenceDate);
                                });
                        });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should corretlly filter data for the "Greater" filtering option', function () {
            var filterOk = true;
            var referenceDate = new Date('02/04/2016 00:00 AM');

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Gt"]').click();
            valueInput.sendKeys('02/04/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    loadData().then(function () {
                        dataRows.each(function (row, index) {
                            row.$$('td').get(2).getText()
                                .then(function (date) {
                                    filterOk = filterOk && (new Date(date) > referenceDate);
                                });
                        });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should correctly filter data for the "Less-or-equal" filtering option', function () {
            var filterOk = true;
            var referenceDate = new Date('02/04/2016 00:00 AM');

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Lte"]').click();
            valueInput.sendKeys('02/04/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    loadData().then(function () {
                        dataRows.each(function (row, index) {
                            row.$$('td').get(2).getText()
                                .then(function (date) {
                                    filterOk = filterOk && (new Date(date) <= referenceDate);
                                });
                        });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });

        it('should correctly filter data for the "Less" filtering option', function () {
            var filterOk = true;
            var referenceDate = new Date('02/04/2016 00:00 AM');

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$('[value="string:Lt"]').click();
            valueInput.sendKeys('02/04/2016');
            applyBtn.click()
                .then(function () {
                    // Verify filtering
                    loadData().then(function () {
                        dataRows.each(function (row, index) {
                            row.$$('td').get(2).getText()
                                .then(function (date) {
                                    filterOk = filterOk && (new Date(date) < referenceDate);
                                });
                        });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
        });
    });

    describe('tbColumnOptionsFilter', function () {

        beforeAll(function () {
            // Set test variables
            tbColumnOptionsFilter = element(by.tagName('tb-column-options-filter'));
            filterBtn = tbColumnOptionsFilter.$('.btn-popover');
            popoverForm = $('tb-column-options-filter form.tubular-column-filter-form');
            applyBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-success');
            clearBtn = popoverForm.$('tb-column-filter-buttons').$('.btn-danger');
            filterSelect = popoverForm.$('select');
            valueInput = popoverForm.$('input:not(.ng-hide)');
            dataRows = element.all(by.repeater('row in $component.rows'));

            // Always show 50 recods and go to first page
            loadData().then(setPagination);
        });

        afterAll(function () {
            // Clear filters
            element(by.tagName('tb-grid-pager')).$('.pagination-first a').click()
                .then(function () {
                    element(by.tagName('tb-grid-pager')).$('.pagination-first a').click().then(function () {
                        filterBtn.click().then(function () {
                            clearBtn.click().then(function () {
                                loadData();
                            });
                        });
                    });
                });
        });

        beforeEach(function () {
            // Clear filters
            element(by.tagName('tb-grid-pager')).$('.pagination-first a').click()
                .then(function () {
                    element(by.tagName('tb-grid-pager')).$('.pagination-first a').click().then(function () {
                        filterBtn.click().then(function () {
                            clearBtn.click().then(function () {
                                loadData();
                            });
                        });
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
                            filterSelect.$$('option').first().click()
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

        it('should decorate popover button when showing data is being filtered for its column', function () {
            // Verify button has no decorating-class
            expect(filterBtn.getAttribute('class')).not.toMatch(/btn-success/);

            // Set filter and apply it
            filterBtn.click();
            filterSelect.$$('option').first().click()
            applyBtn.click()
                .then(function () {
                    loadData().
                        then(function () {
                            expect(filterBtn.getAttribute('class')).toMatch(/btn-success/);
                        });
                });
        });

        it('should filter column-elements in accordance to the selected filter when selecting a single option', function () {
            var filterOk = true;
            var options;

            filterBtn.click();

            filterSelect.$$('option').getText().then(function (text) {
                options = text;
            })
                .then(function () {
                    options.forEach(function (option, index) {
                        filterSelect.$$('option').get(index).click().then(function () {
                            applyBtn.click();
                            loadData().then(function () {

                                dataRows.each(function (row) {
                                    row.$$('td').get(3).getText().then(function (data) {
                                        filterOk = filterOk && (data == option);
                                    });
                                });

                            });
                        })
                            .then(function () {
                                filterBtn.click().then(function () {
                                    clearBtn.click().then(function () {
                                        loadData().then(function () {
                                            filterBtn.click();
                                        });
                                    });
                                });
                            });
                    })
                })
                .then(function () {
                    expect(filterOk).toBe(true);
                });
        });

    });

    describe('tbTextSearch', function () {

        beforeAll(function () {
            // Set this tests variables
            tbTextSearch = $('tb-text-search');
            tbTextSearchInput = tbTextSearch.$('input');
            tbTextSearchClearBtn = tbTextSearch.$('button');
            dataRows = element.all(by.repeater('row in $component.rows'));

            // Always show 50 recods and go to first page
            loadData().then(setPagination);
        });

        afterAll(function () {
            // Clear filters
            tbTextSearchClearBtn.isDisplayed().then(function (displayed) {
                if (displayed) {
                    tbTextSearchClearBtn.click().then(function () {
                        loadData().then(function () { });
                    });
                }
            });
        });

        beforeEach(function () {
            // Clear filters
            tbTextSearchClearBtn.isDisplayed().then(function (displayed) {
                if (displayed) {
                    tbTextSearchClearBtn.click().then(function () {
                        loadData().then(function () { });
                    });
                }
            });
        });

        it('min-chars is not set', function () {
            expect(tbTextSearch.getAttribute('min-chars')).toBe(null);
        });


        it('should filter data in searchable-column customer name to matching inputted text, starting from 3 characters', function () {
            var filterOk = true;
            var filteredCustomer = 'Microsoft';

            // Set first 2 chars input
            tbTextSearchInput.sendKeys('cr');

            // Expect rows not to be filtered
            dataRows.each(function (row, index) {
                row.$$('td').get(1).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer == filteredCustomer);
                    });
            }).then(function () {
                expect(filterOk).toBe(false);
            }).then(function () {
                filterOk = true;

                // Send 3rd char input
                tbTextSearchInput.sendKeys('o');

                // Verify filtering
                loadData().then(function () {
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
        });

        it('should filter data in searchable-column shipper city to matching inputted text, starting from 3 characters', function () {
            var filterOk = true;
            var filteredCity = 'Los Angeles, CA, USA';

            // Set first 2 chars input
            tbTextSearchInput.sendKeys('lo');

            // Expect rows not to be filtered
            dataRows.each(function (row, index) {
                row.$$('td').get(3).getText()
                    .then(function (customer) {
                        filterOk = filterOk && (customer == filteredCity);
                    });
            }).then(function () {
                expect(filterOk).toBe(false);
            }).then(function () {
                filterOk = true;

                // Send 3rd char input
                tbTextSearchInput.sendKeys('s');

                // Verify filtering
                loadData().then(function () {
                    dataRows.each(function (row, index) {
                        row.$$('td').get(3).getText()
                            .then(function (customer) {
                                filterOk = filterOk && (customer == filteredCity);
                            });
                    }).then(function () {
                        expect(filterOk).toBe(true);
                    });
                });
            });
        });

        it('should show clear button when there is inputted text only', function () {
            expect(tbTextSearchClearBtn.isDisplayed()).toBe(false);
            tbTextSearchInput.sendKeys('1').then(function () {
                expect(tbTextSearchClearBtn.isDisplayed()).toBe(true);
            });
        });

        it('should clear filtering when clicking clear button', function () {
            var filteredDataCount;

            // Send filtering
            tbTextSearchInput.sendKeys('uno');

            // Verify filtering
            loadData().then(function () {
                dataRows.count().then(function (dataCount) {
                    filteredDataCount = dataCount;
                })
                    .then(function () {
                        tbTextSearchClearBtn.click();

                        loadData().then(function () {
                            expect(dataRows.count()).not.toBe(filteredDataCount);
                        });
                    });
            });
        });

    });
});