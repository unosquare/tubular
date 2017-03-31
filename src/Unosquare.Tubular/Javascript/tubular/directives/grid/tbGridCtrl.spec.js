'use strict';

describe('Module: tubular.directives', function () {
    describe('Controller: tbGridController', function () {
        var sut, scope, window, tubularPopupService, tubularModel, tubularHttp, $routeParams;
        var $controller;

        beforeEach(function () {
            module('tubular.directives');
           
            module(function ($provide) {
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

        beforeEach(inject(function (_$controller_, $rootScope, $window) {
            scope = $rootScope.$new();
            $controller = _$controller_;
            window = $window;
            
        }));

        function create() {
            sut = $controller('tbGridController', { '$scope': scope });
            sut.$component = {
                
            }
        }

        describe('Method: $onInit', function () {

            beforeEach(create);

            it('should set default minChars properly', function () {
                sut.$onInit();

                expect(tubularModel).toHaveBeenCalledWith(scope, sut, {}, sut.dataService);
               
            })

         


        });








    });
});
