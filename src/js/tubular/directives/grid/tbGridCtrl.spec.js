'use strict';

var models = [{
    'Id': 8,
    'Name': 'Guzman Webster',
    'Company': 'IDEGO',
    'Email': 'guzmanwebster@idego.com',
    'Phone': '+1 (869) 428-2675',
    'Birthday': 'Fri Mar 01 1996 00:57:47 GMT-0600 (Central Standard Time (Mexico))',
    'IsOwner': 'false'
}];

var payload = [[8, 'Guzman Webster', 'IDEGO', 'guzmanwebster@idego.com']];

describe('Module: tubular.directives', () => {
    describe('Controller: tbGridController', () => {
        var sut, scope, tubularPopupService, tubularModel, tubularHttp, $routeParams, storage, window;
        var $controller, storageMock, storage, data, tubularHttp;

        beforeEach(() => {
            module('tubular.directives');
            module(($provide) => {
                tubularModel = jasmine.createSpy();
                $routeParams = jasmine.createSpyObj('$routeParams', ['name']);

                $provide.value('tubularModel', tubularModel);
                $provide.value('$routeParams', $routeParams);

            })

        })

        beforeEach(inject((_$controller_, $rootScope, _tubularPopupService_, _tubularHttp_) => {
            scope = $rootScope.$new();
            $controller = _$controller_;
            tubularPopupService = _tubularPopupService_;
            tubularHttp = _tubularHttp_;
        }));

        var create = () => {
            storage = {};
            window = {};
            window.localStorage = {
                setItem: function (key, value) {
                    storage[key] = value || '';
                },
                removeItem: function (key) {
                    delete storage[key];
                },
                key: function (i) {
                    var keys = Object.keys(storage);
                    return keys[i] || null;
                },
                getItem: function (key) {
                    return key in storage ? storage[key] : null;
                },
                length: 0
            };
            sut = $controller('tbGridController', { '$scope': scope, '$window': window, 'tubularHttp': tubularHttp });
        }

        beforeEach(() => {
            create();
            sut.$onInit();
        });

        describe('onInit function, watchers', () => {
            beforeEach(() => {
                spyOn(sut, 'retrieveData');
            });

            it('should have name', () => {
                expect(sut.name).toBe('tbgrid');
            })

            it('should have empty columns', () => {
                expect(sut.columns.length).toBe(0);
            })

            it('should have empty rows', () => {
                expect(sut.rows.length).toBe(0);
            })

            it('should have savePage', () => {
                expect(sut.savePage).toBe(true);
            })

            it('should have currentPage', () => {
                expect(sut.currentPage).toBe(1);
            })

            it('should have savePageSize', () => {
                expect(sut.savePageSize).toBe(true);
            })

            it('should have pageSize', () => {
                expect(sut.pageSize).toBe(20);
            })

            it('should have saveSearchText', () => {
                expect(sut.saveSearchText).toBe(true);
            })

            it('should have totalPages', () => {
                expect(sut.totalPages).toBe(0);
            })

            it('should have totalRecordCount', () => {
                expect(sut.totalRecordCount).toBe(0);
            })

            it('should have filteredRecordCount', () => {
                expect(sut.filteredRecordCount).toBe(0);
            })

            it('should have requestedPage', () => {
                expect(sut.requestedPage).toBe(1);
            })

            it('should have hasColumnsDefinitions', () => {
                expect(sut.hasColumnsDefinitions).toBe(false);
            })

            it('should have requestCounter', () => {
                expect(sut.requestCounter).toBe(0);
            })

            it('should have requestMethod', () => {
                expect(sut.requestMethod).toBe('POST');
            })

            it('should have serverSaveMethod', () => {
                expect(sut.serverSaveMethod).toBe('POST');
            })

            it('should have requestTimeout', () => {
                expect(sut.requestTimeout).toBe(20000);
            })

            it('should have currentRequest', () => {
                expect(sut.currentRequest).toBe(null);
            })

            it('should have autoSearch', () => {
                expect(sut.autoSearch).toBe('');
            })

            it('should have search', () => {
                expect(sut.search.Text).toBe('');
                expect(sut.search.Operator).toBe('None');
            })

            it('should have isEmpty', () => {
                expect(sut.isEmpty).toBe(false);
            })

            it('should have dataService', () => {
                expect(sut.dataService).toBeDefined();
            })

            it('should have tempRow', () => {
                expect(sut.tempRow).toBeDefined();
            })

            it('should have requireAuthentication', () => {
                expect(sut.requireAuthentication).toBe(true);
            })

            it('should have editorMode', () => {
                expect(sut.editorMode).toBe('none');
            })

            it('should have canSaveState', () => {
                expect(sut.canSaveState).toBe(false);
            })

            it('should have showLoading', () => {
                expect(sut.canSaveState).toBe(false);
            })

            it('should have autoRefresh', () => {
                expect(sut.autoRefresh).toBe(true);
            })

            it('should have serverDeleteUrl', () => {
                expect(sut.serverDeleteUrl).not.toBeDefined();
            })

            it('should watch columns', () => {
                sut.columns = [{ 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true }];
                sut.hasColumnsDefinitions = true;
                sut.canSaveState = true;
                scope.columnWatcher();
                var keys = Object.keys(storage);
                expect(keys[0]).toBe('tubular.tbgrid_columns');
            })

            it('should watch serverUrl', () => {
                sut.serverUrl = 'api/order';
                sut.hasColumnsDefinitions = true;
                sut.currentRequest = '';
                scope.serverUrlWatcher(sut.serverUrl, '');
                expect(sut.retrieveData).toHaveBeenCalled();
            })

            it('should watch hasColumnsDefinitions', () => {
                sut.hasColumnsDefinitions = true;
                scope.serverUrlWatcher(sut.hasColumnsDefinitions);
                expect(sut.retrieveData).toHaveBeenCalled();
            })

            it('should watch requestedPage', () => {
                sut.hasColumnsDefinitions = true;
                sut.requestCounter = 1;
                scope.requestedPageWatcher();
                expect(sut.retrieveData).toHaveBeenCalled();
            })
        });        

        describe('Watching pageSize', () => {
            beforeEach(() => {
                spyOn(sut, 'retrieveData');
                sut.hasColumnsDefinitions = true;
                sut.requestCounter = 1;
            });

            it('should not storage pageSize', () => {
                sut.savePageSize = false;
                scope.pageSizeWatcher();

                var keys = Object.keys(storage);
                expect(keys.length).toBe(0);

                expect(sut.retrieveData).toHaveBeenCalled();
            })

            it('should storage pageSize', () => {
                sut.savePageSize = true;
                scope.pageSizeWatcher();

                var keys = Object.keys(storage);
                expect(keys[0]).toBe('tubular.tbgrid_pageSize');

                expect(sut.retrieveData).toHaveBeenCalled();
            })
        });

        describe('saveSearch function', () => {
            beforeEach(() => {
                sut.search.Text = 'test';
                sut.saveSearch();
            });

            it('should set storage', () => {
                expect(storage['tubular.tbgrid_search']).toBe('test');
            })

            it('should remove storage', () => {
                sut.search.Text = '';
                sut.saveSearch();
                expect(storage['tubular.tbgrid_search']).not.toBeDefined();
            })
        });

        it('should add columns', () => {
            expect(sut.columns.length).toBe(0);

            sut.addColumn({ 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true });

            expect(sut.columns.length).toBe(1);
        })

        describe('newRow function', () => {
            beforeEach(() => {
                spyOn(tubularPopupService, 'openDialog');
            });

            it('should not have properties', () => {
                var keys = Object.keys(sut.tempRow);
                expect(keys.length).toBe(0);
            })

            it('should have properties', () => {
                sut.newRow(models);

                var keys = Object.keys(sut.tempRow);
                expect(keys.length).not.toBeLessThan(3);
            })

            it('should not call tubularPopupService.openDialog', () => {
                sut.newRow(models);
                expect(tubularPopupService.openDialog).not.toHaveBeenCalled();
            })

            it('should call tubularPopupService.openDialog', () => {
                sut.newRow({}, {}, 'lg', models);
                expect(tubularPopupService.openDialog).toHaveBeenCalled();
            })

        });

        it('should delete row', () => {
            spyOn(sut, 'retrieveData');
            var row = { $key: "76", Id: 76, Name: 'Gdl' };
            sut.serverDeleteUrl = 'api/order';
            sut.deleteRow(row);
            var promise = sut.currentRequest;
            promise.then().then(() => {
                expect(sut.retrieveData).toHaveBeenCalled();
            });
        })

        describe('verifyColumns function', () => {
            beforeEach(() => {
                sut.columns = [
                    { 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true }
                ];
                sut.hasColumnsDefinitions = true;
                sut.canSaveState = true;
            });

            it('should storage columns', () => {
                sut.verifyColumns();
                var keys = Object.keys(storage);
                expect(keys[0]).toBe('tubular.tbgrid_columns');
            })

            it('should storage columns', () => {
                scope.columnWatcher();
                sut.columns = [
                    { 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': false }
                ];
                sut.verifyColumns();
                expect(sut.columns[0].Visible).toBe(true);
            })
        });

        describe('getRequestObject function', () => {
            beforeEach(() => {
                sut.columns = [
                    { 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true }
                ];
                sut.hasColumnsDefinitions = true;
                sut.canSaveState = true;
            });

            it('with skip = -1', () => {
                var request = sut.getRequestObject(-1);
                expect(request.data.Skip).toBe(0);
            })

            it('with skip > -1', () => {
                var request = sut.getRequestObject(10);
                expect(request.data.Skip).toBe(10);
            })
        });

        describe('processPayload function', () => {
            beforeEach(() => {
                spyOn(scope, '$emit');
                data = {
                    Payload: payload,
                    AggregationPayload: { Amount: 0 },
                    CurrentPage: 5,
                    TotalPages: 7,
                    TotalRecordCount: 50,
                    FilteredRecordCount: 35
                };
            });

            it('should emit tbGrid_OnConnectionError on null data', () => {
                sut.processPayload();
                expect(scope.$emit).toHaveBeenCalledWith('tbGrid_OnConnectionError', { statusText: 'Data is empty', status: 0 });
            })

            it('should emit tbGrid_OnConnectionError on false data.Payload ', () => {
                data.Payload = false;
                sut.$id = 12;
                sut.processPayload(data);
                expect(scope.$emit).toHaveBeenCalledWith('tbGrid_OnConnectionError', 'tubularGrid(12): response is invalid.');
            })

            it('should create ctrl.rows', () => {
                sut.processPayload(data);
                expect(sut.rows[0].$component).toBeDefined();
                expect(sut.rows[0].editPopup).toBeDefined();
            })

            it('should emit tbGrid_OnDataLoaded', () => {
                sut.processPayload(data);
                expect(scope.$emit).toHaveBeenCalledWith('tbGrid_OnDataLoaded', sut);
            })

            it('should change ctrl.aggregationFunctions', () => {
                expect(sut.aggregationFunctions).not.toBeDefined();
                sut.processPayload(data);
                expect(sut.aggregationFunctions).toBeDefined();
                expect(sut.aggregationFunctions.Amount).toBe(0);
            })

            it('should change ctrl.currentPage', () => {
                expect(sut.currentPage).toBe(1);
                sut.processPayload(data);
                expect(sut.currentPage).toBe(5);
            })

            it('should change ctrl.totalPages', () => {
                expect(sut.totalPages).toBe(0);
                sut.processPayload(data);
                expect(sut.totalPages).toBe(7);
            })

            it('should change ctrl.totalRecordCount', () => {
                expect(sut.totalRecordCount).toBe(0);
                sut.processPayload(data);
                expect(sut.totalRecordCount).toBe(50);
            })

            it('should change ctrl.filteredRecordCount', () => {
                expect(sut.filteredRecordCount).toBe(0);
                sut.processPayload(data);
                expect(sut.filteredRecordCount).toBe(35);
            })

            it('should change ctrl.isEmpty', () => {
                sut.processPayload(data);
                expect(sut.isEmpty).toBe(false);

                data.FilteredRecordCount = 0;
                sut.processPayload(data);
                expect(sut.isEmpty).toBe(true);
            })

            it('should not storage currentPage', () => {
                sut.savePage = false;
                sut.processPayload(data);
                expect(storage['tubular.tbgrid_page']).not.toBeDefined();
            })

            it('should storage currentPage', () => {
                sut.processPayload(data);
                expect(storage['tubular.tbgrid_page']).toBe(5);
            })
        });

        describe('sortColumn function', () => {
            beforeEach(() => {
                spyOn(sut, 'retrieveData');
                spyOn(scope, '$broadcast');
                sut.columns = [
                    { 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true, 'SortDirection': 'None', 'SortOrder': -1 },
                    { 'DataType': 'string', 'IsKey': false, 'Name': 'Date', 'Visible': true, 'SortDirection': 'Ascending', 'SortOrder': 1 }
                ];
            });

            it('should not change wrong column', () => {
                sut.sortColumn('Name', false);
                expect(sut.columns[0].SortOrder).toBe(-1);
                expect(sut.columns[0].SortDirection).toBe('None');
            })

            it('should change column SortOrder and SortDirection', () => {
                sut.sortColumn('Id', false);
                expect(sut.columns[0].SortOrder).toBe(1);
                expect(sut.columns[0].SortDirection).toBe('Ascending');

                sut.sortColumn('Id', false);
                expect(sut.columns[0].SortDirection).toBe('Descending');
            })

            it('should remove sorting from other columns', () => {
                sut.sortColumn('Id', false);
                expect(sut.columns[1].SortOrder).toBe(-1);
                expect(sut.columns[1].SortDirection).toBe('None');
            })

            it('should not remove sorting from other columns', () => {
                sut.sortColumn('Id', true);
                expect(sut.columns[1].SortOrder).toBe(1);
                expect(sut.columns[1].SortDirection).toBe('Ascending');
            })

            it('should broadcast', () => {
                sut.sortColumn('Id', true);
                expect(scope.$broadcast).toHaveBeenCalledWith('tbGrid_OnColumnSorted');
            })

            it('should broadcast', () => {
                sut.sortColumn('Id', true);
                expect(sut.retrieveData).toHaveBeenCalled();
            })

        });

        describe('getFullDataSource function', () => {
            var valid = true;

            beforeEach(() => {
                spyOn(scope, '$emit');
                sut.dataService.retrieveDataAsync = (request) => {
                    return new Promise((resolve, reject) => {
                        if (valid) resolve({ Payload: payload });
                        else reject('Error');
                    });
                };
            });

            it('should getFullDataSource', () => {
               sut.getFullDataSource().then((data) => {
                    expect(data).toBe(payload);
                });                
            })

            it('should emit error', () => {
                valid = false;
                sut.getFullDataSource().then().then(() => {
                    expect(scope.$emit).toHaveBeenCalledWith('tbGrid_OnConnectionError', 'Error');
                });
            })

            it('should nullify currentRequest', () => {
                expect(sut.currentRequest).toBe(null);
            })
        });

        describe('visibleColumns function', () => {
            beforeEach(() => {
                sut.columns = [{ 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true }];
            });

            it('should get visibleColumns', () => {
                expect(sut.visibleColumns()).toBe(1);
            })

            it('should not get visibleColumns', () => {
                sut.columns[0].Visible = false;
                expect(sut.visibleColumns()).toBe(0);
            })
        });

        describe('retrieveData function', () => {
            beforeEach(() => {
                spyOn(sut, 'verifyColumns');
                sut.serverUrl = 'api/order';
                sut.currentRequest = null;
                sut.columns = [{ 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true }];
            });

            it('should change canSaveState', () => {
                sut.canSaveState = false;
                sut.retrieveData();
                expect(sut.canSaveState).toBe(true);
            })

            it('should call verifyColumns', () => {
                sut.retrieveData();
                expect(sut.verifyColumns).toHaveBeenCalled();
            })

            it('should update pageSize', () => {
                sut.pageSize = 0;
                window.localStorage.setItem('tubular.tbgrid_pageSize', 30);
                sut.retrieveData();
                expect(sut.pageSize).toBe(30);
            })

            it('should update pageSize on pageSize < 10', () => {
                sut.pageSize = 5;
                sut.retrieveData();
                expect(sut.pageSize).toBe(20);
            })

            it('should update pageSize on pageSize < 10', () => {
                sut.pageSize = 5;
                sut.retrieveData();
                expect(sut.pageSize).toBe(20);
            })

            it('should update requestedPage', () => {
                sut.totalRecordCount = 250;
                sut.pageSize = 50;
                sut.requestedPage = 10;
                sut.retrieveData();
                expect(sut.requestedPage).toBe(5);
            })

            it('should call onBeforeGetData', () => {
                sut.onBeforeGetData = () => { return true; };
                spyOn(sut, 'onBeforeGetData');
                sut.retrieveData();
                expect(sut.onBeforeGetData).toHaveBeenCalled();
            })

            it('should emit tbGrid_OnBeforeRequest', () => {
                var request = sut.getRequestObject(-1);
                spyOn(scope, '$emit');
                sut.retrieveData();
                expect(scope.$emit).toHaveBeenCalledWith('tbGrid_OnBeforeRequest', request, sut);
            })

            it('should process currentRequest', () => {
                sut.retrieveData();
                expect(sut.currentRequest).toBeDefined();
            })
        });
    });
});
