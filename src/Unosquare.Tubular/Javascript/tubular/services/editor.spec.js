'use strict';

describe('Module: tubular.services', function() {

    describe('Service: editor', function() {
        var filter, editor, scope;

        beforeEach(function() {
            module('tubular.services');
            module(function($filterProvider) {

                filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function() {
                    return filter;
                });
            });

            inject(function(_tubularEditorService_) {
                editor = _tubularEditorService_;
            });
        });

        beforeEach(inject(function(_$rootScope_) {
            scope = _$rootScope_.$new();
        }));

        beforeEach(function() {
            scope.label = 'Testcomponent';
            editor.setupScope(scope);
            editor.value = null;
        });

        it('should be defined', function() {
            expect(editor).toBeDefined();
        });

        it('should have form name', function() {
            expect(editor.getUniqueTbFormName()).toBe('tbForm0');
        });

        it('should show isvalid info with required = false', function() {
            expect(scope.state.$valid()).toBe(true), 'should be false without value';
            expect(scope.state.$errors.length).toBe(0), 'should not have error message';

            scope.value = 'My component have a value';
            expect(scope.state.$valid()).toBe(true), 'should be false with value';
            expect(scope.state.$errors.length).toBe(0), 'should not have error message';
        });

        it('should show isvalid info', function() {
            scope.required = true;
            expect(scope.state.$valid()).toBe(false), 'should be false without value and required = true';
            expect(scope.state.$errors.length).not.toBeLessThan(0), 'should have error message';
            
            scope.value = 'My component have a value';
            expect(scope.state.$valid()).toBe(true), 'should be false with value';
            expect(scope.state.$errors.length).toBe(0), 'should not have error message';
        });

        it('should have getFormField defined', function() {
           expect(scope.getFormField).toBeDefined();
        });

        it('should have $dirty value', function() {
           expect(scope.$dirty).toBeDefined();
        });
    });
});