'use strict';

describe('e2e - Module: tubular.directives', function () {
    describe('tbTextSearch', function () {
        var sut, ctrl, scope, gridCtrl, $compile, element, timeout, filter;

        beforeEach(function () {
            module('tubular.directives');

            // registering only external dependencies (grid and filter)
            module(function ($filterProvider) {

                filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter; });
                gridCtrl = jasmine.createSpyObj('grid', ['search']);
            });
            
        });

        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
            scope = _$rootScope_.$new();
            $compile = _$compile_;
            timeout = _$timeout_;
            
        }));

        function generate(tpl) {
            element = angular.element(tpl);
            element.data('$tbGridController', gridCtrl);
            element = $compile(element)(scope);
            scope.$digest();
            
        }

        it('empty input and placeholder is set', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');

            expect(element.find('input').attr('placeholder')).toBe('search me');
            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');
            expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');
            var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
            expect(panel.hasClass('ng-hide')).toBe(true);

        });

        it('input and placeholder is set', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');

            expect(element.find('input').attr('placeholder')).toBe('search me');
            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');
            expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');
            var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
            expect(panel.hasClass('ng-hide')).toBe(true);

        });
       
    });
});