
// This protractor scen file tests tbGridPager component and the page navigation behaviour
// that is related with it. 

// It is assumed throughout the test that the data received for the main tbGrid
// component at the related HTML file (tbPager_test.html) is static and constrained
// to 53 records with consecutive ID's.

describe('tbGridPager', function() {
    var tbGridPager, 
        li_navListElements;
    
    beforeAll(function(){
        // Go to test
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbGridPagerTest')).click();
        
        // Select '10' on tbPageSizeSelector
        element(by.model('$ctrl.$component.pageSize'))
            .$('[value="number:10"]').click();
        
        // Get main pager elements
        tbGridPager = element(by.tagName('tb-grid-pager'));
        li_navListElements = tbGridPager.all(by.tagName('li'));
    });
        
    describe('navigation buttons', function(){
        
        it('should perform no action when clicking on the numbered navigation button corresponding to the current-showing results page', function(){
          var li_activeNavBtn = tbGridPager.all(by.className('active')).first();
          var firstDataRow = element.all(by.repeater('row in $component.rows')).first().getText();
          var lastDataRow = element.all(by.repeater('row in $component.rows')).last().getText()
          
          li_activeNavBtn.element(by.tagName('a')).click();
          
          expect(firstDataRow).toMatch(element.all(by.repeater('row in $component.rows')).first().getText());
          expect(lastDataRow).toMatch(element.all(by.repeater('row in $component.rows')).last().getText());
        });
        
        describe('first/non-last results page related functionallity', function(){
            
            it('should start on first results page on page-load', function() {
                var currentPageNumber = tbGridPager.all(by.className('active')).first().element(by.tagName('a')).getInnerHtml()
                
                expect(currentPageNumber).toMatch('1');
            });
        
            it('should disable "first" navigation button when in first results page', function(){
                var firstBtnClas = li_navListElements.get(0).getAttribute('class')

                expect(firstBtnClas).toMatch(/disabled/);
            });
            
            it('should disable "previous" navigation button when in first results page', function(){
                var previousBtnClas = li_navListElements.get(1).getAttribute('class')
                
                expect(previousBtnClas).toMatch(/disabled/);
            });
            
            it('should enable "last" navigation button when in a results page other than last', function(){                
                //Go to 3rd page
                li_navListElements.all(by.tagName('a')).get(4).click();
                
                // Get last button link class
                var lastBtnClass = li_navListElements.last().getAttribute('class');
                
                expect(lastBtnClass).not.toMatch(/disabled/);
            });
            
            it('should enable "next" navigation button when in a results page other than last', function(){                
                //Go to 5th page
                li_navListElements.all(by.tagName('a')).get(6).click();
                
                // Get last button link class
                var lastBtnClass = li_navListElements.last().getAttribute('class');
                
                expect(lastBtnClass).not.toMatch(/disabled/);
            });

        });
        
        describe('last/non-first results page related functionallity', function(){
            
            it('should disable "last" navigation button when in last results page', function(){
                // Go to last page
                li_navListElements.last().element(by.tagName('a')).click();
                
                // Get last button link class
                var lastBtnClass = li_navListElements.last().getAttribute('class');
                
                expect(lastBtnClass).toMatch(/disabled/);
            });
        
            it('should disable "next" navigation button when in last results page', function(){
                // Go to last page
                li_navListElements.last().element(by.tagName('a')).click();
                
                // Get next button link class
                var nextBtnClass = tbGridPager.all(by.className('pagination-next')).first().getAttribute('class');
                
                expect(nextBtnClass).toMatch(/disabled/);
            });
            
            it('should enable "first" navigation button when in a results page other than first', function(){
                //Go to 4th page
                li_navListElements.all(by.tagName('a')).get(5).click();
                
                // Get first button link class
                var firstBtnClas = li_navListElements.get(0).getAttribute('class')
                
                expect(firstBtnClas).not.toMatch(/disabled/);   
            });
            
            it('should enable "previous" navigation button when in a results page other than first', function(){
                //Go to 2d page
                li_navListElements.all(by.tagName('a')).get(3).click();
                
                // Get previous button link class
                var firstBtnClas = li_navListElements.get(1).getAttribute('class')
                
                expect(firstBtnClas).not.toMatch(/disabled/);   
            });
            
        });
        
    });
    
    describe('page navigation', function(){
        
        beforeEach(function () {
            // Go to first page
            li_navListElements.first().element(by.tagName('a')).click();
        })
                        
        it('should go to next results page when clicking on next navigation button', function() {
            var nextBtn = tbGridPager.all(by.className('pagination-next')).first().element(by.tagName('a'));
            
            // Go to next page
            nextBtn.click();
            
            var firstDataRow = element.all(by.repeater('row in $component.rows')).first().getText();
            expect(firstDataRow).toMatch(/^11\s/);
        });
        
        it('should go to previous results page when clicking on previous navigation button', function(){
            var nextBtn = tbGridPager.all(by.className('pagination-next')).first().element(by.tagName('a'));
            var prevBtn = tbGridPager.all(by.className('pagination-prev')).first().element(by.tagName('a'));
            
            // Go to next-to-next page (page 3)
            nextBtn.click();
            nextBtn.click();
            
            // Go back one page (page 2)
            prevBtn.click();
            
            var firstDataRow = element.all(by.repeater('row in $component.rows')).first().getText();

            expect(firstDataRow).toMatch(/^11\s/);
        });
        
        it('should go to last results page when clicking on last navigation button', function(){
            // Go to last page
            li_navListElements.last().element(by.tagName('a')).click();
            
            var lastDataRow = element.all(by.repeater('row in $component.rows')).last().getText();
            
            expect(lastDataRow).toMatch(/^53\s/);
        });
        
        it('should go to first results page when clicking on first navigation button', function(){
            // Go to last page
            li_navListElements.last().element(by.tagName('a')).click();
            
            // Go to first page
            li_navListElements.first().element(by.tagName('a')).click();
            
            var firstDataRow = element.all(by.repeater('row in $component.rows')).first().getText();
            
            expect(firstDataRow).toMatch(/^1\s/);
        });
        
        it('should go to corresponding results page when clicking on a numbered navigation button', function(){
             //Go to 4th page
            li_navListElements.all(by.tagName('a')).get(5).click();
            
            var firstDataRow = element.all(by.repeater('row in $component.rows')).first().getText();
            
            expect(firstDataRow).toMatch(/^31\s/);
        });
        
    }); 
    
});