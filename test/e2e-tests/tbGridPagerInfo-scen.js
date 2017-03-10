/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

// This protractor scen file tests the tbGridPagerInfo component.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbPager_test.html) is static and constrained
// to 500 records with consecutive ID's.

describe('tbGridPagerInfo', () => {

    var tbGridPagerInfo,
        nextPageBtn,
        tbPageSizeSelector;

    beforeAll(() => {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridPagerInfoTest')).click();

        /**********************/
        // * Test variables * //
        /**********************/
        // Get the component
        tbGridPagerInfo = element(by.tagName('tb-grid-pager-info'));
        // Next page button
        nextPageBtn = element(by.tagName('tb-grid-pager')).$('li.pagination-next a');
        // Page size selector component
        tbPageSizeSelector = element(by.model('$ctrl.$component.pageSize'));

        // Go to first page if not there    
        element(by.tagName('tb-grid-pager'))
            .$('li.pagination-first a')
            .click();

        // Select '10' on tbPageSizeSelector
        tbPageSizeSelector.$('[value="number:10"]').click();
    });

    it('should show text in accordance to numbered of filter rows and current results-page', done => {
        // Started on page 1
        expect(tbGridPagerInfo.getText()).toBe('Showing 1 to 10 of 500 records');

        // Go to page 2 and change number of showing records to 20
        nextPageBtn.click();
        tbPageSizeSelector.$('[value="number:20"]').click();

        expect(tbGridPagerInfo.getText()).toBe('Showing 21 to 40 of 500 records');

        // Go page 3
        nextPageBtn.click()
            .then(() => {
                expect(tbGridPagerInfo.getText()).toBe('Showing 41 to 60 of 500 records');
                done();
            });
    });

    it('should show count in footer', () => expect(element(by.id('count')).getText()).toBe('500'));
});