'use strict';

describe('Module: tubular.services', () => {

    describe('Service: editor', () => {
        var filter, editor, scope;

        beforeEach(() => {
            module('tubular.services');
            module(($filterProvider) => {
                filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', () => filter);
            });

            inject((_tubularEditorService_, _$rootScope_) => {
                editor = _tubularEditorService_;
                scope = _$rootScope_.$new();
            });

            scope.label = 'Testcomponent';
            editor.setupScope(scope);
            editor.value = null;
        });

        it('should be defined', () => expect(editor).toBeDefined());

        it('should show isvalid info with required = false', () => {
            expect(scope.state.$valid()).toBe(true, 'should be false without value');
            expect(scope.state.$errors.length).toBe(0, 'should not have error message');

            scope.value = 'My component have a value';
            expect(scope.state.$valid()).toBe(true, 'should be false with value');
            expect(scope.state.$errors.length).toBe(0, 'should not have error message');
        });

        it('should show isvalid info', () => {
            scope.required = true;
            expect(scope.state.$valid()).toBe(false, 'should be false without value and required = true');
            expect(scope.state.$errors.length).not.toBeLessThan(0, 'should have error message');

            scope.value = 'My component have a value';
            expect(scope.state.$valid()).toBe(true, 'should be false with value');
            expect(scope.state.$errors.length).toBe(0, 'should not have error message');
        });

        it('should have getFormField defined', () => {
            expect(scope.getFormField).toBeDefined();
        });

        it('should have $dirty value', () => expect(scope.$dirty).toBeDefined());
    });
});