'use strict';

describe('Module: tubular.directives', () => {
    describe('Directive: tb-form', () => {
        var ctrl, scope, compile, isolated, template, element;

        beforeEach(() => {
            module('tubular.directives');
            module(function ($controllerProvider) {
                ctrl = jasmine.createSpyObj('ctrl', ['finishDefinition']);

                $controllerProvider.register('tbFormController', $scope => $scope.finishDefinition = ctrl.finishDefinition);
            });
        });

        beforeEach(inject(function (_$compile_, _$rootScope_) {
            scope = _$rootScope_.$new();
            scope.modelProp = 'x';
            compile = _$compile_;

        }));

        function generate(tpl) {
            template = angular.element(tpl);
            element = compile(template)(scope);
            scope.$digest();
            isolated = element.isolateScope();
        }

        beforeEach(() =>
            generate("<tb-form form-name='nombre_de_forma' server-url='http://tubular.azurewebsites.net/api/orders/' require-authentication='false' model='modelProp' model-key='1' server-save-url='http://tubular.azurewebsites.net/api/orders/save'><div id='inner'></div></tb-form>")
        );

        it('should call finishDefinition after compile', () => {
            expect(ctrl.finishDefinition).toHaveBeenCalled();
        });
        it('should set serverSaveUrl', () => {
            expect(isolated.serverSaveUrl).toBe('http://tubular.azurewebsites.net/api/orders/save');
        });
        it('should set serverUrl', () => {
            expect(isolated.serverUrl).toBe('http://tubular.azurewebsites.net/api/orders/');
        });
        it('should set requireAuthentication', () => {
            expect(isolated.requireAuthentication).toBe(false);
        });
        it('should set name', () => {
            expect(isolated.name).toBe('nombre_de_forma');
        });
        it('should set model key', () => {
            expect(isolated.modelKey).toBe('1');
        });
        it('should set model', () => {
            expect(isolated.model).toBe('x');
        });
        it('should replace', () => {
            expect(element.find("tb-form").length).toBe(0, 'should remove tbForm element');
            expect(element.attr("name")).toBe('nombre_de_forma', 'should place form element');
        });
        it('should transclude', () => {
            var divs = element.find("div");
            expect(divs.length).toBe(1);
            expect(divs[0].id).toBe('inner');
        });
    });
});
