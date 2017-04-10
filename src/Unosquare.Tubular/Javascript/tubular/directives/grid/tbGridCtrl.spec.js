'use strict';

describe('Module: tubular.directives', () => {
    describe('Controller: tbGridController', () => {
        var sut, scope, tubularPopupService, tubularModel, tubularHttp, $routeParams, storage, window;
        var $controller, storageMock;
        var storage = {};

        beforeEach(() => {
            module('tubular.directives');
           
            module(($provide) => {
                tubularPopupService = jasmine.createSpyObj('tubularPopupService', ['m']);
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['getDataService', 'setRequireAuthentication']);
                tubularModel = jasmine.createSpy();
                $routeParams = jasmine.createSpyObj('$routeParams', ['name']);
                
                $provide.value('tubularHttp', tubularHttp);
                $provide.value('tubularModel', tubularModel);
                $provide.value('tubularPopupService', tubularPopupService);
                $provide.value('$routeParams', $routeParams);
                
            })

        })

        beforeEach(inject((_$controller_, $rootScope) => {
            scope = $rootScope.$new();
            $controller = _$controller_;
        }));

        var create = () => {
            window = {};
            window.localStorage = {
                setItem: function (key, value) {
                    storage[key] = value || '';
                },
                removeItem: function (key) {
                    //delete storage[key];
                    return 0;
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
            sut = $controller('tbGridController', { '$scope': scope, '$window' : window});
            scope.$ctrl = sut;
        }

            beforeEach(() => {
                create();
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

            it('should add columns', () => {
                sut.addColumn({ 'DataType': 'string', 'IsKey': true, 'Name': 'Id', 'Visible': true });
                //scope.$apply("$ctrl.columns[0].Visible = false");
                sut.columns[0].Visible = false
                scope.$digest();
             expect(sut.columns.length).toBe(1);
             expect(storage).toBe('');
            })

    });
});
