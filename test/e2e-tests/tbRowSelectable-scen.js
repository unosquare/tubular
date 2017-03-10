/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

//tbRowSelectable test
describe('tbRowSelectable', () => {
    beforeAll(() => {
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbRowSelectable')).click();
    });

    it('selected rows', (done) => {
        element.all(by.repeater('row in $component.rows')).click();
        var rows = element.all(by.repeater('row in $component.rows'));
        var countRows = rows.count();
        element(by.id('btnRows')).click();

        $('#lbRows').getText().then(count => {
            countRows.then(result => {
                expect(parseInt(count)).toEqual(result);
                done();
            });
        });
    });

    it('unselected rows', () => {
        element.all(by.repeater('row in $component.rows')).click();
        element(by.id('btnRows')).click();
        expect($('#lbRows').getText()).toBe('0');
    });
});