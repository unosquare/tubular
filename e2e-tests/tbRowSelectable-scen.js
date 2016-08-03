//tbRowSelectable test
describe('tbRowSelectable', function () {
    beforeAll(function(){
         browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbRowSelectable')).click();
    });
        
    it('selected rows', function () {
        element.all(by.repeater('row in $component.rows')).click();
        element(by.id('btnRows')).click();
        expect($('#lbRows').getText()).toBe('10');          
    });
    
    it('unselected rows', function () {
        element.all(by.repeater('row in $component.rows')).click();
        element(by.id('btnRows')).click();
        expect($('#lbRows').getText()).toBe('[Empty]');
    });
});