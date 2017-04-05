'use strict';

describe('Module: tubular.directives', () => {
    describe('Directive: tb-simple-editor', () => {
        var ctrl, scope, compile, isolated, template, element;

        beforeEach(() => {
            module('tubular.directives');

            inject((_$compile_, _$rootScope_) => {
                scope = _$rootScope_.$new();
                scope.modelProp = 'x';
                compile = _$compile_;
            })
        });

        var generate = (tpl) => {
            template = angular.element(tpl);
            element = compile(template)(scope);
            scope.$digest();
            isolated = element.isolateScope();
            ctrl = element.controller('tbSimpleEditor');
        }

        beforeEach(() =>
            generate("<tb-simple-editor name='LastName' is-editing='false' editor-type='text'> </tb-simple-editor>")
        );

        it('should replace', () => {
            expect(element.find("tb-simple-editor").length).toBe(0);
        });

        it('should "name" have info', () => {
            expect(element.attr("name")).toBe('LastName');
        });

        it('should "is-editing" have info', () => {
            expect(element.attr("is-editing")).toBe('false');
        });

        it('should "editor-type" have info', () => {
            expect(element.attr("editor-type")).toBe('text');
        });

        it('should validate defined', () => {
            expect(ctrl.validate).toBeDefined();
        });

        it('should call $onInit', () => {
            expect(ctrl.$onInit).toBeDefined();
        });

        it('should validate regex', () => {
            ctrl.value = 'Gutierrez';
            ctrl.regex = '[\d]';
            ctrl.validate();
            expect(ctrl.state.$errors[0]).toBe("The field doesn't match the regular expression.");
        });

        it('should validate min', () => {
            ctrl.value = 'Suarez';
            ctrl.min = 10;
            ctrl.validate();
            expect(ctrl.state.$errors[0]).toBe("The field needs to be minimum 10 chars.");
        });

        it('should validate mac', () => {
            ctrl.value = 'Casillas';
            ctrl.max = 4;
            ctrl.validate();
            expect(ctrl.state.$errors[0]).toBe("The field needs to be maximum 4 chars.");
        });
    });
});