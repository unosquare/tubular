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
            ctrl = element.controller('tbTextSearch');
        }

        it('should set placeholder correctly', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');
            expect(ctrl.placeholder).toBe('search me');
            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');

        });
        it('should set default minChars correctly', function () {
            generate('<tb-text-search placeholder="search me"></tb-text-search>');
            expect(ctrl.minChars).toBeUndefined();

        });
        it('should set minChars correctly', function () {
            generate('<tb-text-search min-chars="6" placeholder="search me"></tb-text-search>');
            expect(ctrl.minChars).toBe('6');

        });
        it('should translate the input placeholder', function () {
            generate('<tb-text-search ></tb-text-search>');
            expect(filter).toHaveBeenCalledWith('UI_SEARCH');

        });
        it('should translate the input placeholder', function () {
            generate('<tb-text-search ></tb-text-search>');
            expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');

        });
        it('input should set the parent search text', function () {
            generate('<form name="form1"><tb-text-search ></tb-text-search></form>');
            gridCtrl.search.Text = '';
            timeout(function () {
                scope.form1.tbTextSearchInput.$setViewValue('google');
            }, 350);
            scope.$digest();
            timeout.flush();
            expect(gridCtrl.search.Text).toBe('google');
            
            

        });
        it('reset button should be visible only when the input has text', function () {
            generate('<tb-text-search ></tb-text-search>');
            gridCtrl.search.Text = "search me";
            scope.$apply();
            var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
            expect(panel.hasClass('ng-hide')).toBe(false);
            gridCtrl.search.Text = "";
            scope.$apply();
            expect(panel.hasClass('ng-hide')).toBe(true);
            
            

        });
        it('reset button should reset the search input', function () {
            generate('<tb-text-search ></tb-text-search>');
            gridCtrl.search.Text = "search me";
            element.find('button')[0].click();
            scope.$apply();
            expect(gridCtrl.search.Text).toBe('');



        });
    });
});