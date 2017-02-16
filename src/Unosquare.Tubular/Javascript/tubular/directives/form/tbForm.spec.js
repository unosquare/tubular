'use strict';
describe('Module: tubular.directives', function () {
    describe('Directive: tb-form', function () {
        var sut, ctrl, scope, isolated, $routeParams, template, element, tubularHttp, tubularModel, tubularEditorService;

        beforeEach(function () {
            module('tubular.directives');
            module(function ($controllerProvider) {
                ctrl = jasmine.createSpyObj('ctrl', ['finishDefinition']);
               
                $controllerProvider.register('tbFormController', function ($scope) {
                    $scope.finishDefinition = ctrl.finishDefinition;
                    
                });
            })
           

        });

        beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_) {
            scope = _$rootScope_.$new();
            scope.modelProp = 'x';
            
            template = angular.element("<tb-form form-name='nombre_de_forma' server-url='http://tubular.azurewebsites.net/api/orders/' require-authentication='false' model='modelProp' model-key='1' service-name='local' server-save-url='http://tubular.azurewebsites.net/api/orders/save'><div id='inner'></div></tb-form>");
            element = _$compile_(template)(scope)
            
            
            scope.$digest();
            isolated = element.isolateScope()
            
        }));

        
        it('should call finishDefinition after compile', function () {
            expect(ctrl.finishDefinition).toHaveBeenCalled();
        })

        it('should set serverSaveUrl', function () {
            expect(isolated.serverSaveUrl).toBe('http://tubular.azurewebsites.net/api/orders/save');
        })

        it('should set serverUrl', function () {
            expect(isolated.serverUrl).toBe('http://tubular.azurewebsites.net/api/orders/');
        })

        it('should set requireAuthentication', function () {
            expect(isolated.requireAuthentication).toBe(false);
        })

        it('should set name', function () {
            expect(isolated.name).toBe('nombre_de_forma');
        })

        it('should set data service name', function () {
            expect(isolated.dataServiceName).toBe('local');
        })
        it('should set model key', function () {
            expect(isolated.modelKey).toBe('1');
        })

        it('should set model', function () {
            expect(isolated.model).toBe('x');
        })

        it('should replace', function () {
            expect(element.find("tb-form").length).toBe(0, 'should remove tbForm element');
            expect(element.attr("name")).toBe('nombre_de_forma', 'should place form element');
        })

        it('should transclude', function () {
            
            expect(element.find("div").length).toBe(1);
        })
        


       

    })
})
