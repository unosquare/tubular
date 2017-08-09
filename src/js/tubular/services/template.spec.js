'use strict';

describe('Module: tubular.services', () => {
    var genFields = '\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-numeric-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-simple-editor\u003e\r\n\t\u003ctb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\"\u003e\r\n\t\u003c/tb-date-time-editor\u003e\r\n\t\u003ctb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\"\u003e\r\n\t</tb-checkbox-field>';
    var genCells = '<tdtb-cellng-transcludecolumn-name="Id"><tb-numeric-editoris-editing="row.$isEditing"value="row.Id"></tb-numeric-editor></td><tdtb-cellng-transcludecolumn-name="Name"><tb-simple-editoris-editing="row.$isEditing"value="row.Name"></tb-simple-editor></td><tdtb-cellng-transcludecolumn-name="Company"><tb-simple-editoris-editing="row.$isEditing"value="row.Company"></tb-simple-editor></td><tdtb-cellng-transcludecolumn-name="Email"><tb-simple-editoris-editing="row.$isEditing"value="row.Email"></tb-simple-editor></td><tdtb-cellng-transcludecolumn-name="Phone"><tb-simple-editoris-editing="row.$isEditing"value="row.Phone"></tb-simple-editor></td><tdtb-cellng-transcludecolumn-name="Birthday"><tb-date-time-editoris-editing="row.$isEditing"value="row.Birthday"></tb-date-time-editor></td><tdtb-cellng-transcludecolumn-name="IsOwner"><tb-checkbox-fieldis-editing="row.$isEditing"value="row.IsOwner"></tb-checkbox-field></td>';
    var genCellsToExport = '<tb-cell-templatecolumn-name="Id"><tb-numeric-editoris-editing="row.$isEditing"value="row.Id"></tb-numeric-editor></tb-cell-template><tb-cell-templatecolumn-name="Name"><tb-simple-editoris-editing="row.$isEditing"value="row.Name"></tb-simple-editor></tb-cell-template><tb-cell-templatecolumn-name="Company"><tb-simple-editoris-editing="row.$isEditing"value="row.Company"></tb-simple-editor></tb-cell-template><tb-cell-templatecolumn-name="Email"><tb-simple-editoris-editing="row.$isEditing"value="row.Email"></tb-simple-editor></tb-cell-template><tb-cell-templatecolumn-name="Phone"><tb-simple-editoris-editing="row.$isEditing"value="row.Phone"></tb-simple-editor></tb-cell-template><tb-cell-templatecolumn-name="Birthday"><tb-date-time-editoris-editing="row.$isEditing"value="row.Birthday"></tb-date-time-editor></tb-cell-template><tb-cell-templatecolumn-name="IsOwner"><tb-checkbox-fieldis-editing="row.$isEditing"value="row.IsOwner"></tb-checkbox-field></tb-cell-template>';
    var genColumns = '<tb-columnname="Id"label="Id"column-type="numeric"sortable="true"is-key="true"searchable="false"sort-direction="Ascending"sort-order="1"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Name"label="Name"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Company"label="Company"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Email"label="Email"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Phone"label="Phone"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Birthday"label="Birthday"column-type="date"sortable="true"is-key="false"searchable="false"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="IsOwner"label="IsOwner"column-type="boolean"sortable="true"is-key="false"searchable="false"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column>';

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

    var extendedModel = {
        'Id': 8,
        'Name': 'Guzman Webster',
        'Company': 'IDEGO',
        'Email': 'guzmanwebster@idego.com',
        'Phone': '+1 (869) 428-2675',
        'Birthday': 'Fri Mar 01 1996 00:57:47 GMT-0600 (Central Standard Time (Mexico))',
        'IsOwner': 'false',
        '$Ignore': 'true',
        'InvalidFunc': function () { }
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

    describe('Service: templateService', () => {
        var columns, tubularTemplateService;

        beforeEach(() => {
            module('tubular.services');
            module($filterProvider => {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', () => filter);
            });

            inject(_tubularTemplateService_ => {
                tubularTemplateService = _tubularTemplateService_;
                columns = tubularTemplateService.createColumns(models);
            });
        });

        describe('Method: createColumns', () => {
            it('should match columns with model with funcitons', () => {
                expect(tubularTemplateService.createColumns(models))
                    .toEqual(tubularTemplateService.createColumns(extendedModel));
            });

            it('should return an array with 7 columns', () => {
                expect(columns).not.toBe([]);
                expect(columns.length).toBe(7);
            });

            it('first element should match', () => {
                expect(JSON.stringify(columns[0])).toEqual(JSON.stringify(firstColumn));
            });
        });


        describe('Method: generateColumnsDefinitions', () => {
            it('should html match', () => {
                var htmlOutput = tubularTemplateService.generateColumnsDefinitions(columns);
                var result = htmlOutput.replace(/\s/g, '');

                expect(genColumns).toEqual(result);
            });
        });

        describe('Method: generateFieldsArray', () => {
            var fields;

            beforeEach(function () {
                fields = tubularTemplateService.generateFieldsArray(columns);
            });

            it('should return an array with 7 fields', () => {
                expect(fields).not.toBe([]);
                expect(fields.length).toBe(7);
            });

            it('first element should match', () => {
                var expectedString =
                    '\r\n\t<tb-numeric-editor name="Id"\r\n\t\tlabel="Id" show-label="true"\r\n\t\tplaceholder=""\r\n\t\trequired="true"\r\n\t\tread-only="false"\r\n\t\tformat=""\r\n\t\thelp="">\r\n\t</tb-numeric-editor>';
                expect(fields[0]).toMatch(expectedString);
            });
        });

        describe('Method: generatePopup', () => {
            it('should html match', () => {
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

        describe('Method: getEditorTypeByDateType', () => {
            it('should be tbDateTimeEditor', () => {
                expect('tbDateTimeEditor')
                    .toMatch(tubularTemplateService.getEditorTypeByDateType('date'));
            });

            it('should be tbNumericEditor', () => {
                expect('tbNumericEditor')
                    .toMatch(tubularTemplateService.getEditorTypeByDateType('numeric'));
            });

            it('should be tbCheckboxField', () => {
                expect('tbCheckboxField')
                    .toMatch(tubularTemplateService.getEditorTypeByDateType('boolean'));
            });

            it('should be tbSimpleEditor', () => {
                expect('tbSimpleEditor').toMatch(tubularTemplateService.getEditorTypeByDateType(''));
            });
        });

        describe('Method: generateForm', () => {
            it('should single layout html match', () => {
                var htmlOutput = tubularTemplateService.generateForm(columns, tubularTemplateService.defaults.formOptions);

                var expectedString =
                    '<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t' + genFields + '\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>';

                expectedString = expectedString.replace(/\s/g, '');
                var result = htmlOutput.replace(/\s/g, '');

                expect(expectedString).toEqual(result);
            });

            it('should two columns layout html match', () => {
                var options = tubularTemplateService.defaults.formOptions;
                options.Layout = 'Two-columns';
                var htmlOutputTwoCol = tubularTemplateService.generateForm(columns, options);

                var expectedString =
                    '<tb-form server-save-method=\"POST\" model-key=\"\" require-authentication=\"false\" server-url=\"\" server-save-url=\"\">\r\n\t\r\n\t<div class=\"row\">\r\n\t<div class=\"col-md-6\">\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-numeric-editor>\r\n\t<tb-simple-editor name=\"Company\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Company\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Phone\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Phone\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-checkbox-field name=\"IsOwner\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-checkbox-field>\r\n\t</div>\r\n\t<div class=\"col-md-6\">\r\n\t<tb-simple-editor name=\"Name\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Name\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-simple-editor name=\"Email\"\r\n\t\teditor-type=\"string\" \r\n\t\tlabel=\"Email\" show-label=\"true\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\thelp=\"\">\r\n\t</tb-simple-editor>\r\n\t<tb-date-time-editor name=\"Birthday\"\r\n\t\tlabel=\"Birthday\" show-label=\"true\"\r\n\t\trequired=\"true\"\r\n\t\tread-only=\"false\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-date-time-editor></div>\r\n\t</div>\r\n\t<div>\r\n\t\t<button class=\"btn btn-primary\" ng-click=\"$parent.save()\" ng-disabled=\"!$parent.model.$valid()\">Save</button>\r\n\t\t<button class=\"btn btn-danger\" ng-click=\"$parent.cancel()\" formnovalidate>Cancel</button>\r\n\t</div>\r\n</tb-form>';

                expectedString = expectedString.replace(/\s/g, '');
                var result = htmlOutputTwoCol.replace(/\s/g, '');

                expect(expectedString).toEqual(result);
            });

            it('should three columns layout html match', () => {
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

        describe('Method: generateCells', () => {
            it('should cells html match', () => {
                var htmlOutput = tubularTemplateService.generateCells(columns, 'Inline').replace(/\s/g, '');

                expect(htmlOutput).toEqual(genCells.replace(/\s/g, ''));
            });
        });

        describe('Method: generateCells', () => {
            it('should cells html match', () => {
                var htmlOutput = tubularTemplateService.generateCellsToExport(columns, 'Inline').replace(/\s/g, '');
                expect(htmlOutput).toEqual(genCellsToExport.replace(/\s/g, ''));
            });
        });

        describe('Method: generateGrid', () => {
            it('should grid html match', () => {
                var htmlOutput = tubularTemplateService
                    .generateGrid(columns, tubularTemplateService.defaults.gridOptions);

                var expectedString =
                    '<divclass="container"><tb-gridserver-url="undefined"request-method="GET"class="row"page-size="10"require-authentication="false"><divclass="row"><tb-grid-pagerclass="col-md-6"></tb-grid-pager><divclass="col-md-3"><divclass="btn-group"><tb-print-buttontitle="Tubular"></tb-print-button><tb-export-buttonfilename="tubular.csv"css="btn-sm"></tb-export-button></div></div><tb-text-searchclass="col-md-3"css="input-sm"></tb-text-search></div><divclass="row"><divclass="col-md-12"><divclass="panelpanel-defaultpanel-rounded"><tb-grid-tableclass="table-bordered"columns="columns"></tb-grid-table></div></div></div><divclass="row"><tb-grid-pagerclass="col-md-6"></tb-grid-pager><tb-page-size-selectorclass="col-md-3"selectorcss="input-sm"></tb-page-size-selector><tb-grid-pager-infoclass="col-md-3"></tb-grid-pager-info></div></tb-grid></div>';

                expect(expectedString).toEqual(htmlOutput.replace(/\s/g, ''));
            });
        });

        describe('Method: generateGridToExport', () => {
            it('should grid html match', () => {
                var htmlOutput = tubularTemplateService
                    .generateGridToExport(columns, tubularTemplateService.defaults.gridOptions);

                var expectedString =
                    '<divclass="container"><tb-gridserver-url="undefined"request-method="GET"class="row"page-size="10"require-authentication="false"><divclass="row"><tb-grid-pagerclass="col-md-6"></tb-grid-pager><divclass="col-md-3"><divclass="btn-group"><tb-print-buttontitle="Tubular"></tb-print-button><tb-export-buttonfilename="tubular.csv"css="btn-sm"></tb-export-button></div></div><tb-text-searchclass="col-md-3"css="input-sm"></tb-text-search></div><divclass="row"><divclass="col-md-12"><divclass="panelpanel-defaultpanel-rounded"><tb-grid-tableclass="table-bordered"><tb-column-definitions><tb-columnname="Id"label="Id"column-type="numeric"sortable="true"is-key="true"searchable="false"sort-direction="Ascending"sort-order="1"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Name"label="Name"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Company"label="Company"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Email"label="Email"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Phone"label="Phone"column-type="string"sortable="true"is-key="false"searchable="true"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="Birthday"label="Birthday"column-type="date"sortable="true"is-key="false"searchable="false"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column><tb-columnname="IsOwner"label="IsOwner"column-type="boolean"sortable="true"is-key="false"searchable="false"sort-direction=""sort-order="0"visible="true"><tb-column-filter></tb-column-filter><tb-column-header><span>{{label}}</span></tb-column-header></tb-column></tb-column-definitions><tb-row-set><tb-row-templateng-repeat="rowin$component.rows"row-model="row"><tdtb-cellng-transcludecolumn-name="Id">{{row.Id|number}}</td><tdtb-cellng-transcludecolumn-name="Name">{{row.Name}}</td><tdtb-cellng-transcludecolumn-name="Company">{{row.Company}}</td><tdtb-cellng-transcludecolumn-name="Email"><ahref="mailto:{{row.Email}}">{{row.Email}}</a></td><tdtb-cellng-transcludecolumn-name="Phone">{{row.Phone}}</td><tdtb-cellng-transcludecolumn-name="Birthday">{{row.Birthday|moment}}</td><tdtb-cellng-transcludecolumn-name="IsOwner">{{row.IsOwner?"TRUE":"FALSE"}}</td></tb-row-template></tb-row-set></tb-grid-table></div></div></div><divclass="row"><tb-grid-pagerclass="col-md-6"></tb-grid-pager><tb-page-size-selectorclass="col-md-3"selectorcss="input-sm"></tb-page-size-selector><tb-grid-pager-infoclass="col-md-3"></tb-grid-pager-info></div></tb-grid></div>';

                expect(expectedString).toEqual(htmlOutput.replace(/\s/g, ''));
            });
        });
    });
});