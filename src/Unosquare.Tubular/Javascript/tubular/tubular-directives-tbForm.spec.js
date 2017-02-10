'use strict';
describe('module: tubular.directives', function () {
    describe('directive: tubularLocalData', function () {
        var sut, scope, isolated, $routeParams, template, element, tubularHttp, tubularModel, tubularEditorService;

        beforeEach(function () {
            angular.module('tubular.services', []);
            angular.module('tubular.models', []);
            module('tubular.directives');
            module(function ($provide) {
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['getDataService', 'setRequireAuthentication']);
                tubularModel = jasmine.createSpyObj('tubularModel', ['get', 'getByKey', 'registerService', 'retrieveDataAsync']);
                tubularEditorService = jasmine.createSpyObj('tubularEditorService', ['getUniqueTbFormName']);
                $routeParams = jasmine.createSpyObj('$routeParams', ["name"]);
                $provide.value('tubularHttp', tubularHttp)
                $provide.value('tubularModel', tubularModel)
                $provide.value('tubularEditorService', tubularEditorService)
                $provide.value('$routeParams', $routeParams)
            })
           

        });

        beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_) {
            scope = _$rootScope_.$new();
            spyOn(scope, '$emit');
            
            template = angular.element("<tb-form server-url='http://tubular.azurewebsites.net/api/orders/' require-authentication='false' model-key='1' server-save-url='http://tubular.azurewebsites.net/api/orders/save'></tb-form>");
            element = _$compile_(template)(scope)
            
            
            scope.$digest();
            isolated = element.isolateScope()
            
        }));

        it('should set tubularDirective properly', function () {
            
            expect(isolated.tubularDirective).toBe('tubular-form');

        })


       

    })
})
