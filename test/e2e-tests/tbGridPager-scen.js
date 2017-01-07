/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests tbGridPager component and the page navigation behavior
// that is related with it. 

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbPager_test.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbGridPager', function () {

    var tbGridPager,
        firstDataRow,
        lastDataRow,
        firstNavBtn,
        previousNavBtn,
        lastNavBtn,
        nextNavBtn,
        totalRecords,
        pageSize,
        activeNavBtn;

    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridPagerTest')).click();

        /**********************/
        // * Test variables * //
        /**********************/
        // Get component
        tbGridPager = element(by.tagName('tb-grid-pager'));
        // First showing row
        firstDataRow = element.all(by.repeater('row in $component.rows')).first();
        // Last showing row
        lastDataRow = element.all(by.repeater('row in $component.rows')).last();
        // First-page button 
        firstNavBtn = tbGridPager.$('.pagination-first');
        // Previous-page button 
        previousNavBtn = tbGridPager.$('.pagination-prev');
        // Last-page button 
        lastNavBtn = tbGridPager.$('.pagination-last');
        // Next-page button
        nextNavBtn = tbGridPager.$('.pagination-next');
        // Current showing page button
        activeNavBtn = tbGridPager.$('.active');

        // Select '10' on tbPageSizeSelector
        element(by.model('$ctrl.$component.pageSize'))
            .$('[value="number:10"]').click();

        pageSize = 10;

        var recordsRegex = /Showing (\d+) to (\d+) of (\d+) records/;
        element(by.tagName('tb-grid-pager-info')).$('.pager-info').getText().then(function (result) {
            var pagerResults = recordsRegex.exec(result);
            // Since the result will be something like ["Showing 31 to 40 of 49 records", "31", "40", "49"]
            // We need the third item in the results
            totalRecords = parseInt(pagerResults[3]);
        });

        // Go to first page if not there
        firstNavBtn.$('a').click();

        // Ensure data is sorted by ascending-ID
        firstDataRow.getText().then(function (textId) {
            if (textId !== 1) {
                element(by.tagName('thead'))
                    .$$('tr th').first()
                    .$('a')
                    .click();
            }
        });
    });

    describe('navigation buttons', function () {

        it('should perform no action when clicking on the numbered navigation button corresponding to the current-showing results page', function () {
            activeNavBtn.$('a').click();

            expect(firstDataRow.getText()).toMatch(/^1\s/);
            expect(lastDataRow.getText()).toMatch(/^10\s/);
        });

        describe('first/non-last results page related functionallity', function () {

            it('should disable "first" and "previous" navigation buttons when in first results page', function () {
                //Go to first page
                firstNavBtn.$('a').click();

                expect(firstNavBtn.getAttribute('class')).toMatch(/disabled/);
                expect(previousNavBtn.getAttribute('class')).toMatch(/disabled/);
            });

            it('should enable "last" and "next" navigation buttons when in a results page other than last', function () {
                //Go to 3rd page
                tbGridPager.$$('li').get(4).$('a').click();

                expect(lastNavBtn.getAttribute('class')).not.toMatch(/disabled/);
                expect(nextNavBtn.getAttribute('class')).not.toMatch(/disabled/);
            });

        });

        describe('last/non-first results page related functionallity', function () {

            it('should disable "last" and "next" navigation buttons when in last results page', function () {
                // Go to last page
                lastNavBtn.$('a').click();

                expect(lastNavBtn.getAttribute('class')).toMatch(/disabled/);
                expect(nextNavBtn.getAttribute('class')).toMatch(/disabled/);
            });

            it('should enable "first" and "previous" navigation buttons when in a results page other than first', function () {
                //Go to 4th page
                tbGridPager.$$('li').get(5).$('a').click();

                expect(firstNavBtn.getAttribute('class')).not.toMatch(/disabled/);
                expect(previousNavBtn.getAttribute('class')).not.toMatch(/disabled/);
            });

        });

    });

    describe('page navigation', function () {

        it('should go to next results page when clicking on next navigation button', function () {
            firstNavBtn.$('a').click();
            nextNavBtn.$('a').click();
            expect(firstDataRow.getText()).toMatch(/^11\s/);
        });

        it('should go to previous results page when clicking on previous navigation button', function () {
            // Go to next-to-next page (page 3)
            nextNavBtn.$('a').click();
            // Go back one page (page 2)
            previousNavBtn.$('a').click();

            expect(firstDataRow.getText()).toMatch(/^11\s/);
        });

        it('should go to last results page when clicking on last navigation button', function () {
            lastNavBtn.$('a').click();

            expect(lastNavBtn.getAttribute('class')).toMatch(/disabled/);
            expect(nextNavBtn.getAttribute('class')).toMatch(/disabled/);

            // Update active nav
            activeNavBtn = tbGridPager.$('.active');

            expect(activeNavBtn.$('a').getText()).toEqual(Math.ceil(totalRecords / pageSize).toString());
        });

        it('should go to first results page when clicking on first navigation button', function () {
            // Go to last page
            lastNavBtn.$('a').click();

            // Go to first page again
            firstNavBtn.$('a').click();

            expect(firstDataRow.getText()).toMatch(/^1\s/);
        });

        it('should go to corresponding results page when clicking on a numbered navigation button', function () {
            //Go to 4th page
            tbGridPager.$$('li').get(5).$('a').click();

            expect(firstDataRow.getText()).toMatch(/^31\s/);
        });

    });

});