/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,beforeEach:false */

var tubularTemplateServiceModule = require("../../dist/node-module.js");
var genFields = '\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-numeric-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-date-time-editor\u003e\r\n\t\u003ctb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t</tb-checkbox-field>';
var genCells = "\r\n\t\t<tb-cell-template column-name=\"Id\">\r\n\t\t\t<tb-numeric-editor is-editing=\"row.$isEditing\" value=\"row.Id\"></tb-numeric-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Name\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Name\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Company\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Company\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Email\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Email\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Phone\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Phone\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Birthday\">\r\n\t\t\t<tb-date-time-editor is-editing=\"row.$isEditing\" value=\"row.Birthday\"></tb-date-time-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"IsOwner\">\r\n\t\t\t<tb-checkbox-field is-editing=\"row.$isEditing\" value=\"row.IsOwner\"></tb-checkbox-field>\r\n\t\t</tb-cell-template>";

var firstColumn = {
    "Name": "Id",
    "DataType": "numeric",
    "Template": "{{row.Id | number}}",
    "Label": "Id",
    "EditorType": "tbNumericEditor",
    "Searchable": false,
    "Filter": true,
    "Visible": true,
    "Sortable": true,
    "IsKey": true,
    "SortOrder": 1,
    "SortDirection": "Ascending",
    "ShowLabel": true,
    "Placeholder": "",
    "Format": "",
    "Help": "",
    "Required": true,
    "ReadOnly": false
};

var models = [
    {
        "Id": 8,
        "Name": "Guzman Webster",
        "Company": "IDEGO",
        "Email": "guzmanwebster@idego.com",
        "Phone": "+1 (869) 428-2675",
        "Birthday": "Fri Mar 01 1996 00:57:47 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "false"
    },
    {
        "Id": 7,
        "Name": "Michelle Baker",
        "Company": "ZOINAGE",
        "Email": "michellebaker@zoinage.com",
        "Phone": "+1 (936) 427-2358",
        "Birthday": "Tue Dec 28 2004 14:58:04 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 4,
        "Name": "Williams Chase",
        "Company": "MARQET",
        "Email": "williamschase@marqet.com",
        "Phone": "+1 (973) 598-2805",
        "Birthday": "Thu Sep 09 1982 03:19:55 GMT-0500 (Central Daylight Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 6,
        "Name": "Amanda Britt",
        "Company": "NIQUENT",
        "Email": "amandabritt@niquent.com",
        "Phone": "+1 (934) 567-2694",
        "Birthday": "Wed May 06 1992 01:17:53 GMT-0500 (Central Daylight Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 7,
        "Name": "Craft Fernandez",
        "Company": "ISOSURE",
        "Email": "craftfernandez@isosure.com",
        "Phone": "+1 (814) 446-3624",
        "Birthday": "Wed Dec 30 1992 00:02:57 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "false"
    },
    {
        "Id": 2,
        "Name": "Wanda Weeks",
        "Company": "AMTAS",
        "Email": "wandaweeks@amtas.com",
        "Phone": "+1 (846) 510-2084",
        "Birthday": "Tue Feb 04 1997 01:49:44 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 2,
        "Name": "Sims Suarez",
        "Company": "ZEROLOGY",
        "Email": "simssuarez@zerology.com",
        "Phone": "+1 (927) 587-3401",
        "Birthday": "Thu Mar 07 2013 13:38:04 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 6,
        "Name": "Stein Garcia",
        "Company": "ACCUFARM",
        "Email": "steingarcia@accufarm.com",
        "Phone": "+1 (906) 507-3424",
        "Birthday": "Sat Nov 01 2008 17:57:32 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 5,
        "Name": "Summer Shaw",
        "Company": "PHUEL",
        "Email": "summershaw@phuel.com",
        "Phone": "+1 (943) 565-2278",
        "Birthday": "Wed Aug 02 2006 00:45:06 GMT-0500 (Central Daylight Time (Mexico))",
        "IsOwner": "true"
    },
    {
        "Id": 0,
        "Name": "Laurie Pacheco",
        "Company": "ENOMEN",
        "Email": "lauriepacheco@enomen.com",
        "Phone": "+1 (992) 456-2187",
        "Birthday": "Sun Dec 13 1981 07:06:47 GMT-0600 (Central Standard Time (Mexico))",
        "IsOwner": "true"
    }
];

describe('tubularTemplateServiceModule', function () {
        
    beforeAll(function () {
        // Get page
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbTemplateServiceModelTest')).click();
    });

    var columns = tubularTemplateServiceModule.createColumns(models);

    describe('#createColumns()', function () {
        it('should return an array with 7 elements', function () {
            expect(columns).not.toBe([]);
            expect(columns.length).toBe(7);
        });

        it('first element should match', function () {
            expect(JSON.stringify(columns[0]) === JSON.stringify(firstColumn)).toBe(true);
        });
    });

    describe('#generateFieldsArray()', function () {
        var fields = tubularTemplateServiceModule.generateFieldsArray(columns);

        it('should return an array with 7 elements', function () {
            expect(fields).not.toBe([]);
            expect(fields.length).toBe(7);
        });

        it('first element should match', function () {
            var expectedString = '\r\n\t<tb-numeric-editor name="Id"\r\n\t\tlabel="Id" show-label="true"\r\n\t\tplaceholder=""\r\n\t\trequired="true"\r\n\t\tread-only="false"\r\n\t\tformat=""\r\n\t\thelp="">\r\n\t</tb-numeric-editor>';
            expect(fields[0]).toMatch(expectedString);
        });
    });

    describe('#generatePopup()', function () {
        var htmlOutput = tubularTemplateServiceModule.generatePopup(models, "TEST");

        it('should html match', function () {
            var expectedString = '<tb-form model="Model">' +
                '<div class="modal-header"><h3 class="modal-title">TEST</h3></div>' +
                '<div class="modal-body">' + genFields + '</div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
                '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' +
                '</div>' +
                '</tb-form>';
                
            expectedString = expectedString.replace(/\s/g, "");
            var result = htmlOutput.replace(/\s/g, "");
            
            expect(expectedString === result).toBe(true);
        });
    });

    describe('#getEditorTypeByDateType()', function () {
        it('should be tbDateTimeEditor', function () {
            expect('tbDateTimeEditor').toMatch(tubularTemplateServiceModule.getEditorTypeByDateType('date'));
        });

        it('should be tbNumericEditor', function () {
            expect('tbNumericEditor').toMatch(tubularTemplateServiceModule.getEditorTypeByDateType('numeric'));
        });

        it('should be tbCheckboxField', function () {
            expect('tbCheckboxField').toMatch(tubularTemplateServiceModule.getEditorTypeByDateType('boolean'));
        });

        it('should be tbSimpleEditor', function () {
            expect('tbSimpleEditor').toMatch(tubularTemplateServiceModule.getEditorTypeByDateType(''));
        });
    });

    describe('#generateForm()', function () {
        var htmlOutput = tubularTemplateServiceModule.generateForm(columns, tubularTemplateServiceModule.defaults.formOptions);

        var options = tubularTemplateServiceModule.defaults.formOptions;
        options.Layout = 'Two-columns';
        var htmlOutputTwoCol = tubularTemplateServiceModule.generateForm(columns, options);

        options.Layout = 'Three-columns';
        var htmlOutputThreeCol = tubularTemplateServiceModule.generateForm(columns, options);

        it('should single layout html match', function () {
            var expectedString = '<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t' + genFields + '\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>';
            
            expectedString = expectedString.replace(/\s/g, "");
            var result = htmlOutput.replace(/\s/g, "");

            expect(expectedString === result).toBe(true);
        });

        it('should two columns layout html match', function () {
            var expectedString = "<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t\r\n\t<div class='row'>\r\n\t<div class='col-md-6'>\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-numeric-editor>\r\n\t<tb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-checkbox-field>\r\n\t</div>\r\n\t<div class='col-md-6'>\r\n\t<tb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-date-time-editor></div>\r\n\t</div>\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>";
                        
            expectedString = expectedString.replace(/\s/g, "");
            var result = htmlOutputTwoCol.replace(/\s/g, "");

            expect(expectedString === result).toBe(true);
        });

        it('should three columns layout html match', function () {
            var expectedString = "<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t\r\n\t<div class='row'>\r\n\t<div class='col-md-4'>\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-numeric-editor>\r\n\t<tb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-checkbox-field>\r\n\t</div>\r\n\t<div class='col-md-4'>\r\n\t<tb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t</div>\r\n\t<div class='col-md-4'>\r\n\t<tb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-date-time-editor>\r\n\t</div>\r\n\t</div>\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>";
            
            expectedString = expectedString.replace(/\s/g, "");
            var result = htmlOutputThreeCol.replace(/\s/g, "");

            expect(expectedString === result).toBe(true);
        });
    });

    describe('#generateCells()', function () {
        var htmlOutput = tubularTemplateServiceModule.generateCells(columns, 'Inline');

        it('should html match', function () {
            expect(htmlOutput === genCells).toBe(true);
        });
    });

    describe('#generateGrid()', function () {
        var htmlOutput = tubularTemplateServiceModule.generateGrid(columns, tubularTemplateServiceModule.defaults.gridOptions);

        it('should html match', function () {
            var expectedString = "<div class=\"container\">\r\n<tb-grid server-url=\"undefined\" request-method=\"GET\" class=\"row\" page-size=\"10\" require-authentication=\"false\" >\r\n\t<div class=\"row\">\r\n\t<tb-grid-pager class=\"col-md-6\"></tb-grid-pager>\r\n\t<div class=\"col-md-3\">\r\n\t\t<div class=\"btn-group\">\r\n\t\t<tb-print-button title=\"Tubular\"></tb-print-button>\r\n\t\t<tb-export-button filename=\"tubular.csv\" css=\"btn-sm\"></tb-export-button>\r\n\t\t</div>\r\n\t</div>\r\n\t<tb-text-search class=\"col-md-3\" css=\"input-sm\"></tb-text-search>\r\n\t</div>\r\n\t<div class=\"row\">\r\n\t<div class=\"col-md-12\">\r\n\t<div class=\"panel panel-default panel-rounded\">\r\n\t<tb-grid-table class=\"table-bordered\">\r\n\t<tb-column-definitions>\r\n\t\t<tb-column name=\"Id\" label=\"Id\" column-type=\"numeric\" sortable=\"true\" \r\n\t\t\tis-key=\"true\" searchable=\"false\" \r\n\t\t\tsort-direction=\"Ascending\" sort-order=\"1\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t\t<tb-column name=\"Name\" label=\"Name\" column-type=\"string\" sortable=\"true\" \r\n\t\t\tis-key=\"false\" searchable=\"true\" \r\n\t\t\tsort-direction=\"\" sort-order=\"0\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t\t<tb-column name=\"Company\" label=\"Company\" column-type=\"string\" sortable=\"true\" \r\n\t\t\tis-key=\"false\" searchable=\"true\" \r\n\t\t\tsort-direction=\"\" sort-order=\"0\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t\t<tb-column name=\"Email\" label=\"Email\" column-type=\"string\" sortable=\"true\" \r\n\t\t\tis-key=\"false\" searchable=\"true\" \r\n\t\t\tsort-direction=\"\" sort-order=\"0\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t\t<tb-column name=\"Phone\" label=\"Phone\" column-type=\"string\" sortable=\"true\" \r\n\t\t\tis-key=\"false\" searchable=\"true\" \r\n\t\t\tsort-direction=\"\" sort-order=\"0\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t\t<tb-column name=\"Birthday\" label=\"Birthday\" column-type=\"date\" sortable=\"true\" \r\n\t\t\tis-key=\"false\" searchable=\"false\" \r\n\t\t\tsort-direction=\"\" sort-order=\"0\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t\t<tb-column name=\"IsOwner\" label=\"Is Owner\" column-type=\"boolean\" sortable=\"true\" \r\n\t\t\tis-key=\"false\" searchable=\"false\" \r\n\t\t\tsort-direction=\"\" sort-order=\"0\" visible=\"true\">\r\n\t\t\t<tb-column-filter></tb-column-filter>\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>\r\n\t\t</tb-column>\r\n\t</tb-column-definitions>\r\n\t<tb-row-set>\r\n\t<tb-row-template ng-repeat=\"row in $component.rows\" row-model=\"row\">\r\n\t\t<tb-cell-template column-name=\"Id\">\r\n\t\t\t{{row.Id | number}}\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Name\">\r\n\t\t\t{{row.Name}}\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Company\">\r\n\t\t\t{{row.Company}}\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Email\">\r\n\t\t\t<a href=\"mailto:{{row.Email}}\">{{row.Email}}</a>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Phone\">\r\n\t\t\t{{row.Phone}}\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Birthday\">\r\n\t\t\t{{row.Birthday | date}}\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"IsOwner\">\r\n\t\t\t{{row.IsOwner ? \"TRUE\" : \"FALSE\" }}\r\n\t\t</tb-cell-template>\r\n\t</tb-row-template>\r\n\t</tb-row-set>\r\n\t</tb-grid-table>\r\n\t</div>\r\n\t</div>\r\n\t</div>\r\n\t<div class=\"row\">\r\n\t<tb-grid-pager class=\"col-md-6\"></tb-grid-pager>\r\n\t<tb-page-size-selector class=\"col-md-3\" selectorcss=\"input-sm\"></tb-page-size-selector>\r\n\t<tb-grid-pager-info class=\"col-md-3\"></tb-grid-pager-info>\r\n\t</div>\r\n</tb-grid>\r\n</div>";
            
            expectedString = expectedString.replace(/\s/g, "");
            var result = htmlOutput.replace(/\s/g, "");

            expect(expectedString === result).toBe(true);
        });
    });
});
