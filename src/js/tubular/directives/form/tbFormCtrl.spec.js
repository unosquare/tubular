'use strict';

describe('Module: tubular.directives', () => {
    describe('Controller: tbFormController', () => {
        var sut, scope, $element, tubularModel, tubularEditorService;
        var $controller;

        beforeEach(() => {
            module('tubular.directives');
            module($provide => {
                tubularModel = jasmine.createSpyObj('tubularModel', ['get', 'getByKey']);
                tubularEditorService = jasmine.createSpyObj('tubularEditorService', ['getUniqueTbFormName']);
                $element = jasmine.createSpyObj('$element', ['name', 'find']);

                $provide.value('tubularModel', tubularModel);
                $provide.value('tubularEditorService', tubularEditorService);
                $provide.value('$element', $element);
            });
        });

        beforeEach(inject((_$controller_, $rootScope) => {
            scope = $rootScope.$new();
            $controller = _$controller_;
        }));

        describe('constructor', () => {
            beforeEach(() => sut = $controller('tbFormController', { '$scope': scope }));

            it('should set tubularDirective properly', () => expect(scope.tubularDirective).toBe('tubular-form'));

            it('should set default request method', () => expect(sut.serverSaveMethod).toBe('POST'));
        });
    });
});
