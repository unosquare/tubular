'use strict';

describe('Module: tubular.services', function () {
    var genFields = '\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-numeric-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-date-time-editor\u003e\r\n\t\u003ctb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t</tb-checkbox-field>';
    var genCells = '\r\n\t\t<tb-cell-template column-name="Id">\r\n\t\t\t<tb-numeric-editor is-editing="row.$isEditing" value="row.Id"></tb-numeric-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name="Name">\r\n\t\t\t<tb-simple-editor is-editing="row.$isEditing" value="row.Name"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name="Company">\r\n\t\t\t<tb-simple-editor is-editing="row.$isEditing" value="row.Company"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name="Email">\r\n\t\t\t<tb-simple-editor is-editing="row.$isEditing" value="row.Email"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name="Phone">\r\n\t\t\t<tb-simple-editor is-editing="row.$isEditing" value="row.Phone"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name="Birthday">\r\n\t\t\t<tb-date-time-editor is-editing="row.$isEditing" value="row.Birthday"></tb-date-time-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name="IsOwner">\r\n\t\t\t<tb-checkbox-field is-editing="row.$isEditing" value="row.IsOwner"></tb-checkbox-field>\r\n\t\t</tb-cell-template>';

    var firstColumn = {
        'Name': 'Id',
        'DataType': 'numeric',
        'Template': '{{row.Id | number}}',
        'Label': 'Id',
        'EditorType': 'tbNumericEditor',
        'Searchable': false,
        'Filter': true,
        'Visible': true,
        'Sortable': true,
        'IsKey': true,
        'SortOrder': 1,
        'SortDirection': 'Ascending',
        'ShowLabel': true,
        'Placeholder': '',
        'Format': '',
        'Help': '',
        'Required': true,
        'ReadOnly': false
    };

    var models = [
        {
            'Id': 8,
            'Name': 'Guzman Webster',
            'Company': 'IDEGO',
            'Email': 'guzmanwebster@idego.com',
            'Phone': '+1 (869) 428-2675',
            'Birthday': 'Fri Mar 01 1996 00:57:47 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'false'
        },
        {
            'Id': 7,
            'Name': 'Michelle Baker',
            'Company': 'ZOINAGE',
            'Email': 'michellebaker@zoinage.com',
            'Phone': '+1 (936) 427-2358',
            'Birthday': 'Tue Dec 28 2004 14:58:04 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 4,
            'Name': 'Williams Chase',
            'Company': 'MARQET',
            'Email': 'williamschase@marqet.com',
            'Phone': '+1 (973) 598-2805',
            'Birthday': 'Thu Sep 09 1982 03:19:55 GMT-0500 (Central Daylight Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 6,
            'Name': 'Amanda Britt',
            'Company': 'NIQUENT',
            'Email': 'amandabritt@niquent.com',
            'Phone': '+1 (934) 567-2694',
            'Birthday': 'Wed May 06 1992 01:17:53 GMT-0500 (Central Daylight Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 7,
            'Name': 'Craft Fernandez',
            'Company': 'ISOSURE',
            'Email': 'craftfernandez@isosure.com',
            'Phone': '+1 (814) 446-3624',
            'Birthday': 'Wed Dec 30 1992 00:02:57 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'false'
        },
        {
            'Id': 2,
            'Name': 'Wanda Weeks',
            'Company': 'AMTAS',
            'Email': 'wandaweeks@amtas.com',
            'Phone': '+1 (846) 510-2084',
            'Birthday': 'Tue Feb 04 1997 01:49:44 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 2,
            'Name': 'Sims Suarez',
            'Company': 'ZEROLOGY',
            'Email': 'simssuarez@zerology.com',
            'Phone': '+1 (927) 587-3401',
            'Birthday': 'Thu Mar 07 2013 13:38:04 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 6,
            'Name': 'Stein Garcia',
            'Company': 'ACCUFARM',
            'Email': 'steingarcia@accufarm.com',
            'Phone': '+1 (906) 507-3424',
            'Birthday': 'Sat Nov 01 2008 17:57:32 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 5,
            'Name': 'Summer Shaw',
            'Company': 'PHUEL',
            'Email': 'summershaw@phuel.com',
            'Phone': '+1 (943) 565-2278',
            'Birthday': 'Wed Aug 02 2006 00:45:06 GMT-0500 (Central Daylight Time (Mexico))',
            'IsOwner': 'true'
        },
        {
            'Id': 0,
            'Name': 'Laurie Pacheco',
            'Company': 'ENOMEN',
            'Email': 'lauriepacheco@enomen.com',
            'Phone': '+1 (992) 456-2187',
            'Birthday': 'Sun Dec 13 1981 07:06:47 GMT-0600 (Central Standard Time (Mexico))',
            'IsOwner': 'true'
        }
    ];

    describe('Service: templateService', function () {
        var columns, tubularTemplateService;

        beforeEach(function () {
            module('tubular.services');
            module(function ($filterProvider) {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter; });
            });

            inject(function (_tubularTemplateService_) {
                tubularTemplateService = _tubularTemplateService_;
                columns = tubularTemplateService.createColumns(models);
            });
        });

        describe('Method: createColumns', function () {
            it('should return an array with 7 columns', function () {
                expect(columns).not.toBe([]);
                expect(columns.length).toBe(7);
            });

            it('first element should match', function () {
                expect(JSON.stringify(columns[0])).toEqual(JSON.stringify(firstColumn));
            });
        });

        describe('Method: generateFieldsArray', function () {
            var fields;

            beforeEach(function() {
                fields = tubularTemplateService.generateFieldsArray(columns);
            });

            it('should return an array with 7 fields', function () {
                expect(fields).not.toBe([]);
                expect(fields.length).toBe(7);
            });

            it('first element should match', function () {
                var expectedString =
                    '\r\n\t<tb-numeric-editor name="Id"\r\n\t\tlabel="Id" show-label="true"\r\n\t\tplaceholder=""\r\n\t\trequired="true"\r\n\t\tread-only="false"\r\n\t\tformat=""\r\n\t\thelp="">\r\n\t</tb-numeric-editor>';
                expect(fields[0]).toMatch(expectedString);
            });
        });

        describe('Method: generatePopup', function () {
            it('should html match', function () {
                var htmlOutput = tubularTemplateService.generatePopupTemplate(models, 'TEST');
                var expectedString = '<tb-form model="Model">' +
                    '<div class="modal-header"><h3 class="modal-title">TEST</h3></div>' +
                    '<div class="modal-body">' +
                    genFields +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button class="btn btn-primary" ng-click="savePopup()" ng-disabled="!Model.$valid()">Save</button>' +
                    '<button class="btn btn-danger" ng-click="closePopup()" formnovalidate>Cancel</button>' +
                    '</div>' +
                    '</tb-form>';

                expectedString = expectedString.replace(/\s/g, '');
                var result = htmlOutput.replace(/\s/g, '');

                expect(expectedString).toEqual(result);
            });
        });

        describe('Method: getEditorTypeByDateType', function () {
            it('should be tbDateTimeEditor', function () {
                expect('tbDateTimeEditor')
                    .toMatch(tubularTemplateService.getEditorTypeByDateType('date'));
            });

            it('should be tbNumericEditor', function () {
                expect('tbNumericEditor')
                    .toMatch(tubularTemplateService.getEditorTypeByDateType('numeric'));
            });

            it('should be tbCheckboxField', function () {
                expect('tbCheckboxField')
                    .toMatch(tubularTemplateService.getEditorTypeByDateType('boolean'));
            });

            it('should be tbSimpleEditor', function () {
                expect('tbSimpleEditor').toMatch(tubularTemplateService.getEditorTypeByDateType(''));
            });
        });

        describe('Method: generateForm', function () {
            it('should single layout html match', function () {
                var htmlOutput = tubularTemplateService.generateForm(columns, tubularTemplateService.defaults.formOptions);

                var expectedString =
                    '<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t' + genFields + '\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>';

                expectedString = expectedString.replace(/\s/g, '');
                var result = htmlOutput.replace(/\s/g, '');

                expect(expectedString).toEqual(result);
            });

            it('should two columns layout html match', function () {
                var options = tubularTemplateService.defaults.formOptions;
                options.Layout = 'Two-columns';
                var htmlOutputTwoCol = tubularTemplateService.generateForm(columns, options);

                var expectedString =
                    '<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t\r\n\t<div class=\"row\">\r\n\t<div class=\"col-md-6\">\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-numeric-editor>\r\n\t<tb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-checkbox-field>\r\n\t</div>\r\n\t<div class=\"col-md-6\">\r\n\t<tb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-date-time-editor></div>\r\n\t</div>\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>';
                
                expectedString = expectedString.replace(/\s/g, '');
                var result = htmlOutputTwoCol.replace(/\s/g, '');

                expect(expectedString).toEqual(result);
            });

            it('should three columns layout html match', function () {
                var options = tubularTemplateService.defaults.formOptions;
                options.Layout = 'Three-columns';
                var htmlOutputThreeCol = tubularTemplateService.generateForm(columns, options);

                var expectedString =
                    '<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t\r\n\t<div class=\"row\">\r\n\t<div class=\"col-md-4\">\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-numeric-editor>\r\n\t<tb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-checkbox-field>\r\n\t</div>\r\n\t<div class=\"col-md-4\">\r\n\t<tb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t</div>\r\n\t<div class=\"col-md-4\">\r\n\t<tb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-date-time-editor>\r\n\t</div>\r\n\t</div>\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>';

                expectedString = expectedString.replace(/\s/g, '');
                var result = htmlOutputThreeCol.replace(/\s/g, '');

                expect(expectedString).toEqual(result);
            });
        });

        describe('Method: generateCells', function () {
            it('should cells html match', function () {
                var htmlOutput = tubularTemplateService.generateCells(columns, 'Inline');

                expect(htmlOutput).toEqual(genCells);
            });
        });

        describe('Method: generateGrid', function () {
            it('should grid html match', function () {
                var htmlOutput = tubularTemplateService
                    .generateGrid(columns, tubularTemplateService.defaults.gridOptions);

                var expectedString =
                    '<divclass="container"><tb-gridserver-url="undefined"request-method="GET"class="row"page-size="10"require-authentication="false"><divclass="row"><tb-grid-pagerclass="col-md-6"></tb-grid-pager><divclass="col-md-3"><divclass="btn-group"><tb-print-buttontitle="Tubular"></tb-print-button><tb-export-buttonfilename="tubular.csv"css="btn-sm"></tb-export-button></div></div><tb-text-searchclass="col-md-3"css="input-sm"></tb-text-search></div><divclass="row"><divclass="col-md-12"><divclass="panelpanel-defaultpanel-rounded"><tb-grid-tableclass="table-bordered"><tb-column-definitions>[objectObject]<tb-columnname="Name"label="Name"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header>{{label}}</tb-column-header></tb-column><tb-columnname="Company"label="Company"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header>{{label}}</tb-column-header></tb-column><tb-columnname="Email"label="Email"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header>{{label}}</tb-column-header></tb-column><tb-columnname="Phone"label="Phone"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header>{{label}}</tb-column-header></tb-column><tb-columnname="Birthday"label="Birthday"column-type="date"sortable="true"is-key="false"searchable="false"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header>{{label}}</tb-column-header></tb-column><tb-columnname="IsOwner"label="IsOwner"column-type="boolean"sortable="true"is-key="false"searchable="false"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header>{{label}}</tb-column-header></tb-column></tb-column-definitions><tb-row-set><tb-row-templateng-repeat="rowin$component.rows"row-model="row"><tb-cell-templatecolumn-name="Id">{{row.Id|number}}</tb-cell-template><tb-cell-templatecolumn-name="Name">{{row.Name}}</tb-cell-template><tb-cell-templatecolumn-name="Company">{{row.Company}}</tb-cell-template><tb-cell-templatecolumn-name="Email"><ahref="mailto:{{row.Email}}">{{row.Email}}</a></tb-cell-template><tb-cell-templatecolumn-name="Phone">{{row.Phone}}</tb-cell-template><tb-cell-templatecolumn-name="Birthday">{{row.Birthday|moment}}</tb-cell-template><tb-cell-templatecolumn-name="IsOwner">{{row.IsOwner?"TRUE":"FALSE"}}</tb-cell-template></tb-row-template></tb-row-set></tb-grid-table></div></div></div><divclass="row"><tb-grid-pagerclass="col-md-6"></tb-grid-pager><tb-page-size-selectorclass="col-md-3"selectorcss="input-sm"></tb-page-size-selector><tb-grid-pager-infoclass="col-md-3"></tb-grid-pager-info></div></tb-grid></div>';

                expect(expectedString).toEqual(htmlOutput.replace(/\s/g, ''));
            });
        });
    });
});