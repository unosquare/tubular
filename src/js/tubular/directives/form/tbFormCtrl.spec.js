'use strict';

describe('Module: tubular.directives', () => {
    describe('Controller: tbFormController', () => {
        var sut, scope, $element, $routeParams, tubularHttp, tubularModel, tubularEditorService;
        var $controller;

        beforeEach(() => {
            module('tubular.directives');
            module(function ($provide) {
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['isAuthenticated']);
                tubularModel = jasmine.createSpyObj('tubularModel', ['get', 'getByKey', 'retrieveDataAsync']);
                tubularEditorService = jasmine.createSpyObj('tubularEditorService', ['getUniqueTbFormName']);
                $routeParams = jasmine.createSpyObj('$routeParams', ['name']);
                $element = jasmine.createSpyObj('$element', ['name', 'find']);

                $provide.value('tubularHttp', tubularHttp);
                $provide.value('tubularModel', tubularModel);
                $provide.value('tubularEditorService', tubularEditorService);
                $provide.value('$routeParams', $routeParams);
                $provide.value('$element', $element);
            });
        });

        beforeEach(inject(function (_$controller_, $rootScope) {
            scope = $rootScope.$new();
            $controller = _$controller_;
        }));

        describe('constructor', () => {
            beforeEach(() => sut = $controller('tbFormController', { '$scope': scope }));

            it('should set tubularDirective properly', () => {
                expect(scope.tubularDirective).toBe('tubular-form');
            });
            it('should set default request method', () => {
                expect(sut.serverSaveMethod).toBe('POST');
            });
        });
    });
});
