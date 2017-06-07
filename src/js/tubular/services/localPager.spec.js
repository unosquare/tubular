'use strict';

describe('Module: tubular.services', () => {

    describe('Service: localPager', () => {
        var localPager,
            rootScope;

        const emptyResponse = {
            data: {
                Counter: 0,
                CurrentPage: 1,
                FilteredRecordCount: 0,
                TotalRecordCount: 0,
                Payload: [],
                TotalPages: 0
            }
        };

        const dataSource = [
            [1, 'Alexei', 'Al'],
            [2, 'Alejandro', 'Al'],
            [3, 'Geovanni', 'Al'],
            [4, 'Alexei', 'Al'],
            [5, 'Alejandro', 'Al'],
            [6, 'Geovanni', 'Al'],
            [7, 'Alexei', 'Al'],
            [8, 'Alejandro', 'Al'],
            [9, 'Geovanni', 'Al'],
            [10, 'Alexei', 'Al'],
            [11, 'Alejandro', 'Al'],
            [12, 'Geovanni', 'Al'],
        ];

        const dataSourceObjs = [
            { Id: 1, Name: 'Alexei', Target: 'Al' },
            { Id: 2, Name: 'Alejandro', Target: 'Al' },
            { Id: 3, Name: 'Geovanni', Target: 'Al' },
            { Id: 4, Name: 'Alexei', Target: 'Al' },
            { Id: 5, Name: 'Alejandro', Target: 'Al' },
            { Id: 6, Name: 'Geovanni', Target: 'Al' },
            { Id: 7, Name: 'Alexei', Target: 'Al' },
            { Id: 8, Name: 'Alejandro', Target: 'Al' },
            { Id: 9, Name: 'Geovanni', Target: 'Al' },
            { Id: 10, Name: 'Alexei', Target: 'Al' },
            { Id: 11, Name: 'Alejandro', Target: 'Al' },
            { Id: 12, Name: 'Geovanni', Target: 'Al' }
        ];

        const emptyRequest = {
            requireAuthentication: false,
            data: {
                Count: 1,
                Columns: [
                    { 'Name': 'Id', 'Sortable': true, 'SortOrder': -1, 'SortDirection': 'None', 'IsKey': false, 'Searchable': false, 'Visible': true, 'Filter': { 'Text': null, 'Argument': null, 'Operator': 'Contains', 'OptionsUrl': null, 'HasFilter': false, 'Name': 'Id' }, 'DataType': 'number', 'Aggregate': 'none' },
                    { 'Name': 'Name', 'Sortable': true, 'SortOrder': -1, 'SortDirection': 'None', 'IsKey': false, 'Searchable': true, 'Visible': true, 'Filter': { 'Text': null, 'Argument': null, 'Operator': 'Contains', 'OptionsUrl': null, 'HasFilter': false, 'Name': 'Name' }, 'DataType': 'string', 'Aggregate': 'none' },
                    { 'Name': 'Target', 'Sortable': true, 'SortOrder': -1, 'SortDirection': 'None', 'IsKey': false, 'Searchable': true, 'Visible': true, 'Filter': { 'Text': null, 'Argument': null, 'Operator': 'Contains', 'OptionsUrl': null, 'HasFilter': false, 'Name': 'Target' }, 'DataType': 'string', 'Aggregate': 'none' },
                ],
                Skip: 0,
                Take: 10,
                Search: {},
                TimezoneOffset: new Date().getTimezoneOffset()
            }
        };

        beforeEach(() => {
            module('tubular.services');

            inject((_localPager_, _$rootScope_) => {
                localPager = _localPager_;
                rootScope = _$rootScope_;
            });
        });

        it('should be defined', () => expect(localPager).toBeDefined());

        it('should return a promise', () => {
            expect(localPager.process(null, null)).toBeDefined();
            rootScope.$digest();
        });

        it('should return empty response with null data', done => {
            localPager.process(null, null).then(data => {
                expect(data).toEqual(emptyResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return the data in the format using array of arrays', done => {
            localPager.process(emptyRequest, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 12,
                        TotalRecordCount: 12,
                        Payload: [
                            [1, 'Alexei', 'Al'], [2, 'Alejandro', 'Al'], [3, 'Geovanni', 'Al'], [4, 'Alexei', 'Al'],
                            [5, 'Alejandro', 'Al'], [6, 'Geovanni', 'Al'], [7, 'Alexei', 'Al'], [8, 'Alejandro', 'Al'],
                            [9, 'Geovanni', 'Al'], [10, 'Alexei', 'Al']
                        ],
                        TotalPages: 2
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return the data in the format using array of objects', done => {
            localPager.process(emptyRequest, dataSourceObjs).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 12,
                        TotalRecordCount: 12,
                        Payload: [
                            [1, 'Alexei', 'Al'], [2, 'Alejandro', 'Al'], [3, 'Geovanni', 'Al'], [4, 'Alexei', 'Al'],
                            [5, 'Alejandro', 'Al'], [6, 'Geovanni', 'Al'], [7, 'Alexei', 'Al'], [8, 'Alejandro', 'Al'],
                            [9, 'Geovanni', 'Al'], [10, 'Alexei', 'Al']
                        ],
                        TotalPages: 2
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return some rows with the free text search', done => {
            const request = angular.copy(emptyRequest);
            request.data.Search = { Text: 'Alexei', Operator: 'Auto' };

            localPager.process(request, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 4,
                        TotalRecordCount: 12,
                        Payload: [
                            [1, 'Alexei', 'Al'], [4, 'Alexei', 'Al'], [7, 'Alexei', 'Al'], [10, 'Alexei', 'Al']
                        ],
                        TotalPages: 1
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return all rows with the free text search', done => {
            const request = angular.copy(emptyRequest);
            request.data.Search = { Text: 'Al', Operator: 'Auto' };

            localPager.process(request, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 12,
                        TotalRecordCount: 12,
                        Payload: [
                            [1, 'Alexei', 'Al'], [2, 'Alejandro', 'Al'], [3, 'Geovanni', 'Al'], [4, 'Alexei', 'Al'],
                            [5, 'Alejandro', 'Al'], [6, 'Geovanni', 'Al'], [7, 'Alexei', 'Al'], [8, 'Alejandro', 'Al'],
                            [9, 'Geovanni', 'Al'], [10, 'Alexei', 'Al']
                        ],
                        TotalPages: 2
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return some rows with the string filter', done => {
            const request = angular.copy(emptyRequest);
            request.data.Columns[1].Filter.Text = 'Al';
            request.data.Columns[1].Filter.Operator = 'Contains';

            localPager.process(request, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 8,
                        TotalRecordCount: 12,
                        Payload: [
                            [1, 'Alexei', 'Al'], [2, 'Alejandro', 'Al'], [4, 'Alexei', 'Al'], [5, 'Alejandro', 'Al'],
                            [7, 'Alexei', 'Al'], [8, 'Alejandro', 'Al'], [10, 'Alexei', 'Al'], [11, 'Alejandro', 'Al']
                        ],
                        TotalPages: 1
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return some rows with the int filter', done => {
            const request = angular.copy(emptyRequest);
            request.data.Columns[0].Filter.Text = '1';
            request.data.Columns[0].Filter.Operator = 'Equals';

            localPager.process(request, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 1,
                        TotalRecordCount: 12,
                        Payload: [
                            [1, 'Alexei', 'Al']
                        ],
                        TotalPages: 1
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return sorted rows by id descending', done => {
            const request = angular.copy(emptyRequest);
            request.data.Columns[0].SortOrder = 1;
            request.data.Columns[0].SortDirection = 'Descending';

            localPager.process(request, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 12,
                        TotalRecordCount: 12,
                        Payload: [
                           [ 12, 'Geovanni', 'Al' ], [ 11, 'Alejandro', 'Al' ], [ 10, 'Alexei', 'Al' ], [ 9, 'Geovanni', 'Al' ], [ 8, 'Alejandro', 'Al' ],
                           [ 7, 'Alexei', 'Al' ], [ 6, 'Geovanni', 'Al' ], [ 5, 'Alejandro', 'Al' ], [ 4, 'Alexei', 'Al' ], [ 3, 'Geovanni', 'Al' ]
                        ],
                        TotalPages: 2
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });

        it('should return sorted rows by name ascending', done => {
            const request = angular.copy(emptyRequest);
            request.data.Columns[1].SortOrder = 1;
            request.data.Columns[1].SortDirection = 'Ascending';

            localPager.process(request, dataSource).then(data => {
                const expectedResponse = {
                    data: {
                        Counter: 0,
                        CurrentPage: 1,
                        FilteredRecordCount: 12,
                        TotalRecordCount: 12,
                        Payload: [
                           [ 2, 'Alejandro', 'Al' ], [ 5, 'Alejandro', 'Al' ], [ 8, 'Alejandro', 'Al' ], [ 11, 'Alejandro', 'Al' ], [ 1, 'Alexei', 'Al' ], 
                           [ 4, 'Alexei', 'Al' ], [ 7, 'Alexei', 'Al' ], [ 10, 'Alexei', 'Al' ], [ 3, 'Geovanni', 'Al' ], [ 6, 'Geovanni', 'Al' ]
                        ],
                        TotalPages: 2
                    }
                };

                expect(data).toEqual(expectedResponse);
                done();
            });

            rootScope.$digest();
        });
    });
});