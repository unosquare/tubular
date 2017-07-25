/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('Sorting', function () {


    beforeAll(function () {
        // Go to test
        browser.get('/');
    });

    it("sort by default column", function () {
        let tbTable = $('.tubular-grid-table');
        let colHeader = tbTable.all(by.css('tr th')).first();
        
        expect(colHeader.getText()).toContain('Address id');

        let firstRow = element.all(by.repeater('row in $component.rows')).first();
        expect(firstRow.$$('td').first().getText()).toBe('1');

        // sort asc
        colHeader.$('a').click();

        // sort desc
        colHeader.$('a').click();

        firstRow = element.all(by.repeater('row in $component.rows')).first();
        expect(firstRow.$$('td').first().getText()).toBe('50');
    });
});