'use strict';

describe('Module: tubular.directives', function () {
    describe('component: tbTextSearch', function () {
        var sut, ctrl, scope, $compile, isolated, element, gridCtrl, filter, timeout;

        beforeEach(function () {
            module('tubular.directives');

            
            module(function ($controllerProvider, $filterProvider) {
                
                filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter;});
                gridCtrl = jasmine.createSpyObj('grid', ['search']);

                $controllerProvider.register('tbTextSearchController', function ($scope) { });
                
            });
        });

        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _$templateCache_) {
            scope = _$rootScope_.$new();
            $compile = _$compile_;
            timeout = _$timeout_;
            _$templateCache_.put('tbTextSearch.tpl.html', '<div id="textsearch"></div>')
        }));

        function generate(tpl) {
            element = angular.element(tpl);
            element.data('$tbGridController', gridCtrl);
            element = $compile(element)(scope);
            scope.$digest();
            ctrl = element.controller('tbTextSearch');
        }


        it('should depend on tbGrid', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');
            expect(ctrl.$component).toBe(gridCtrl);
        });

        it('should load template correctly', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');
            expect(element.find('div')[0].id).toBe('textsearch');
        });

        it('should set placeholder correctly', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');
            expect(ctrl.placeholder).toBe('search me');
            

        });

        

        it('should set default minChars correctly', function () {
            generate('<tb-text-search placeholder="search me"></tb-text-search>');
            expect(ctrl.minChars).toBeUndefined();

        });
        it('should set minChars correctly', function () {
            generate('<tb-text-search min-chars="6" placeholder="search me"></tb-text-search>');
            expect(ctrl.minChars).toBe('6');

        });
        
    });
});