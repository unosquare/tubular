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
            
            
            template = angular.element("<tb-form server-url='http://tubular.azurewebsites.net/api/orders/' require-authentication='false' model-key='1' server-save-url='http://tubular.azurewebsites.net/api/orders/save'></tb-form>");
            element = _$compile_(template)(scope)
            
            
            scope.$digest();
            isolated = element.isolateScope()
            
        }));

        
        it('should call finishDefinition after compile', function () {
            expect(ctrl.finishDefinition).toHaveBeenCalled();
        })
        


       

    })
})
