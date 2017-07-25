class TbGridApi {

    constructor(tbGridTableSelector) {
        this.tbTable = $(tbGridTableSelector);
    }

    colHeaders() {
        return this.tbTable.all(by.css('tr th'));
    }

    rows() {
        return this.tbTable.all(by.repeater('row in $component.rows'));
    }

    sortColumn(columnHeader) {
        columnHeader.$('a').click();
    }
}

module.exports = TbGridApi;