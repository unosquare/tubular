var TbGridApi = require('./tb-grid-api')
/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('Sorting', function () {

    beforeEach(function () {
        browser.get('/');

    });

    afterEach(function () {
        browser.executeScript('window.sessionStorage.clear();window.localStorage.clear();');
    });

    it("sort by numeric column", function () {
        let tbGrid = new TbGridApi('.tubular-grid-table');
        let idColHeader = tbGrid.colHeaders().first();
        expect(idColHeader.getText()).toContain('Address id');

        let firstRow = tbGrid.rows().first();
        expect(firstRow.$$('td').first().getText()).toBe('1');

        // sort asc
        tbGrid.sortColumn(idColHeader);

        // sort desc
        tbGrid.sortColumn(idColHeader);

        firstRow = tbGrid.rows().first();
        expect(firstRow.$$('td').first().getText()).toBe('50');
    });

    it("sort by text column", function () {
        let tbGrid = new TbGridApi('.tubular-grid-table');
        let firstNameColHeader = tbGrid.colHeaders().get(1);
        expect(firstNameColHeader.getText()).toContain('First Name');

        let firstRow = tbGrid.rows().first();
        expect(firstRow.$$('td').get(1).getText()).toBe('Tommie');

        // sort asc
        tbGrid.sortColumn(firstNameColHeader);

        firstRow = tbGrid.rows().first();
        expect(firstRow.$$('td').get(1).getText()).toBe('Abramo');

        // sort desc
        tbGrid.sortColumn(firstNameColHeader);

        firstRow = tbGrid.rows().first();
        expect(firstRow.$$('td').get(1).getText()).toBe('Zaria');
    });
});