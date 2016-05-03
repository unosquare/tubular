
// This protractor scen file tests the tbGridPagerInfo component.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbPager_test.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbGridPagerInfo', function () {
    
    var tbGridPagerInfo;

    beforeAll(function () {
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridPagerInfoTest')).click();

        // Select '10' on tbPageSizeSelector
        element(by.model('$ctrl.$component.pageSize'))
            .$('[value="number:10"]').click();
            
            browser.pause();

        ////////////////////////
        // * Test variables * //
        ////////////////////////
        
        browser.pause();

        // Get the component
        var tbGridPagerInfo = element(by.tagName('tb-grid-pager-info'));
        // First page button
        var firstPageBtn = element(by.tagName('tb-grid-pager')).all(by.tagName('li')).$$('li.pagination-first a');
        // Next page button
        var nextPageBtn = element(by.tagName('tb-grid-pager')).all(by.tagName('li')).$$('li.pagination-next a');
    });
    
    
    it("should show text in accordance to numbered of filter rows and current results-page", function(){
       // Go to page one if not there
       firstPageBtn.click();
       
    });

});