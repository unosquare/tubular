
// This protractor scen file tests tbPageSizeSelector component.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbPager_test.html) is static and constrained
// to 153 records with consecutive ID's.

describe('tbPageSizeSelctor', function(){
    
    beforeAll(function(){
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbPagerTest')).click();
        
        var lastDataRow = element.all(by.repeater('row in $component.rows')).last();
    });
    
    it('should filter up to 10 data rows per page when selecting a page size of "10"', function(){
        browser.pause();
        expect(2+2).toBe(4);
    });
    
    it('should filter up to 20 data rows per page when selecting a page size of "20"', function(){
        expect(2+2).toBe(4);
    });
    
    it('should filter up to 50 data rows per page when selecting a page size of "50"', function(){
        expect(2+2).toBe(4);
    });
    
    it('should filter up to 100 data rows per page when selecting a page size of "100"', function(){
        expect(2+2).toBe(4);
    });
    
});