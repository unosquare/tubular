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

describe('Module: tubular.directives', () => {
    describe('Controller: tbGridController', () => {
        var sut, scope, tubularPopupService, tubularModel, tubularHttp, $routeParams, storage, window;
        var $controller, storageMock;
        var storage;

        beforeEach(() => {
            module('tubular.directives');
            module(($provide) => {
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['getDataService', 'setRequireAuthentication']);
                tubularModel = jasmine.createSpy();
                $routeParams = jasmine.createSpyObj('$routeParams', ['name']);
                
                $provide.value('tubularHttp', tubularHttp);
                $provide.value('tubularModel', tubularModel);
                $provide.value('$routeParams', $routeParams);
                
            })

        })

        beforeEach(inject((_$controller_, $rootScope, _tubularPopupService_) => {
            scope = $rootScope.$new();
            $controller = _$controller_;
            tubularPopupService = _tubularPopupService_;
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
            sut = $controller('tbGridController', { '$scope': scope, '$window': window });
        }

            beforeEach(() => {
                create();
                spyOn(sut, 'retrieveData');
                sut.$onInit();
            });

            it('should call tubularModel', () => {
                expect(tubularModel).toHaveBeenCalledWith(scope, sut, {}, sut.dataService);               
            })

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
                expect(sut.dataService).not.toBeDefined();
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

            describe('Watching pageSize', () => {
                beforeEach(() => {
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

            it('should watch requestedPage', () => {
                sut.hasColumnsDefinitions = true;
                sut.requestCounter = 1;
                scope.requestedPageWatcher();
                expect(sut.retrieveData).toHaveBeenCalled();
            })

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
                sut.dataService = {};
                sut.dataService.retrieveDataAsync = (request) => {
                    return new Promise((resolve, reject) => { });
                };

                var row = { $key: "76", Id: 76, Name: 'Gdl'};
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
                        { 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible' : true }
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

            

    });
});
