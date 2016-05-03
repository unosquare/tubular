
// This protractor scen file tests tbPageSizeSelector component.

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbPager_test.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbPageSizeSelctor', function(){
    
    var dataRowsCollection,
        firstDataRow,
        lastDataRow,
        tbGridPager,
        li_tbGridPager_elems,
        firstPageBtn,
        prevPageBtn,
        nextPageBtn;
        
    beforeAll(function(){        
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbPagerTest')).click();
                        
        ////////////////////////
        // * Test variables * //
        ////////////////////////

        // tbPageSizeSelector element
        tbPageSizeSelector = element(by.model('$ctrl.$component.pageSize'));
        // All showing rows
        dataRowsCollection = element.all(by.repeater('row in $component.rows'));
        // First showing row
        firstDataRow = element.all(by.repeater('row in $component.rows')).first();
        // Last showing row
        lastDataRow = element.all(by.repeater('row in $component.rows')).last();
        // First page button
        firstPageBtn = element(by.tagName('tb-grid-pager')).all(by.tagName('li'))
            .$$('li.pagination-first a');
        // Next page button
        nextPageBtn = element(by.tagName('tb-grid-pager')).all(by.tagName('li'))
            .$$('li.pagination-next a');
    });
    
    beforeEach(function(){
        // Go to page 1 on every test if not there
        firstPageBtn.click();
    });
    
    it('should filter up to 10 data rows per page when selecting a page size of "10"', function(){        
        // Select '10' on tbPageSizeSelector
        tbPageSizeSelector.$('[value="number:10"]').click();
        
        expect(firstDataRow.$$('td').first().getText()).toBe('1');
        expect(lastDataRow.$$('td').first().getText()).toBe('10');
        expect(dataRowsCollection.count()).toBe(10);
    });
    
    it('should filter up to 20 data rows per page when selecting a page size of "20"', function(){
        // Select '20' on tbPageSizeSelector
        tbPageSizeSelector.$('[value="number:20"]').click();
        
        // Go to next page of results (page 2)
        nextPageBtn.click();
        
        expect(firstDataRow.$$('td').first().getText()).toBe('21');
        expect(lastDataRow.$$('td').first().getText()).toBe('40');
        expect(dataRowsCollection.count()).toBe(20);
    });
    
    it('should filter up to 50 data rows per page when selecting a page size of "50"', function(){
        // Select '50' on tbPageSizeSelector
        tbPageSizeSelector.$('[value="number:50"]').click();
        
        // Verifying results on results-page 1
        expect(firstDataRow.$$('td').first().getText()).toBe('1');
        expect(lastDataRow.$$('td').first().getText()).toBe('50');
        expect(dataRowsCollection.count()).toBe(50);
        
        // Go to next page of results (page 2)
        nextPageBtn.click();
        
        // Verifying results on results-page 2
        expect(firstDataRow.$$('td').first().getText()).toBe('51');
        expect(lastDataRow.$$('td').first().getText()).toBe('53');
        expect(dataRowsCollection.count()).toBe(3);
    });
    
    it('should filter up to 100 data rows per page when selecting a page size of "100"', function(){
        // Select '100' on tbPageSizeSelector
        tbPageSizeSelector.$('[value="number:100"]').click();
        
        expect(firstDataRow.$$('td').first().getText()).toBe('1');
        expect(lastDataRow.$$('td').first().getText()).toBe('53');
        expect(dataRowsCollection.count()).toBe(53);
    });
    
});