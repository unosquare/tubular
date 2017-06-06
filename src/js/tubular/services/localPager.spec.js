'use strict';

describe('Module: tubular.services', () => {

    describe('Service: localPager', () => {
        var localPager;
        const emptyResponse = {
            Counter: 0,
            CurrentPage: 1,
            FilteredRecordCount: 0,
            TotalRecordCount: 0,
            Payload: [],
            TotalPages: 0
        };

        const dataSource = [
            [1, 'Alexei'],
            [2, 'Alejandro'],
            [3, 'Geovanni']
        ];

        const emptyRequest = {
            requireAuthentication: false,
            data: {
                Count: 1,
                Columns: [
                    { "Name": "Id", "Sortable": true, "SortOrder": -1, "SortDirection": "None", "IsKey": false, "Searchable": false, "Visible": true, "Filter": { "Text": null, "Argument": null, "Operator": "Contains", "OptionsUrl": null, "HasFilter": false, "Name": "Id" }, "DataType": "number", "Aggregate": "none" },
                    { "Name": "Name", "Sortable": true, "SortOrder": -1, "SortDirection": "None", "IsKey": false, "Searchable": true, "Visible": true, "Filter": { "Text": null, "Argument": null, "Operator": "Contains", "OptionsUrl": null, "HasFilter": false, "Name": "Name" }, "DataType": "string", "Aggregate": "none" },
                ],
                Skip: 0,
                Take: 10,
                Search: {},
                TimezoneOffset: new Date().getTimezoneOffset()
            }
        };

        beforeEach(() => {
            module('tubular.services');

            inject((_localPager_) => {
                localPager = _localPager_;
            });
        });

        it('should be defined', () => expect(localPager).toBeDefined());

        it('should return a promise', () => {
            expect(localPager.process(null, null)).toBeDefined();
        });

        it('should return empty response with null data', done => {
            localPager.process(null, null).then(data => {
                expect(data).toBe(emptyResponse);
                done();
            });
        });

        it('should return the data in the format', done => {
            localPager.process(emptyRequest, dataSource).then(data => {
                expect(data).toBe(emptyResponse);
                done();
            });
        });
    });
});
