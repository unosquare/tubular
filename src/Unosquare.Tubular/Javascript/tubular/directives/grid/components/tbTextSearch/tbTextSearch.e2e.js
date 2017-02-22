'use strict';

describe('e2e - Module: tubular.directives', function () {
    describe('tbTextSearch', function () {
        var sut, ctrl, scope, gridCtrl, $compile, element, timeout, filter;

        beforeEach(function () {
            module('tubular.directives');

            // registering only external dependencies
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

        it('should set placeholder correctly', function () {
            generate('<tb-text-search placeholder="search me" ></tb-text-search>');
            element.find('')
            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');

        });
        //it('should set default minChars correctly', function () {
        //    generate('<tb-text-search placeholder="search me"></tb-text-search>');
        //    expect(ctrl.minChars).toBeUndefined();

        //});
        //it('should set minChars correctly', function () {
        //    generate('<tb-text-search min-chars="6" placeholder="search me"></tb-text-search>');
        //    expect(ctrl.minChars).toBe('6');

        //});
        //it('should translate the input placeholder', function () {
        //    generate('<tb-text-search ></tb-text-search>');
        //    expect(filter).toHaveBeenCalledWith('UI_SEARCH');

        //});
        //it('should translate the input placeholder', function () {
        //    generate('<tb-text-search ></tb-text-search>');
        //    expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');

        //});

        //it('input should debounce (before)', function () {
        //    generate('<form name="form1"><tb-text-search ></tb-text-search></form>');
        //    gridCtrl.search.Text = '';
        //    scope.form1.tbTextSearchInput.$setViewValue('google');
        //    timeout.flush(299);
        //    scope.$apply();
        //    expect(gridCtrl.search.Text).toBe('');
        //});
        //it('input should debounce (after)', function () {
        //    generate('<form name="form1"><tb-text-search ></tb-text-search></form>');
        //    gridCtrl.search.Text = '';
        //    scope.form1.tbTextSearchInput.$setViewValue('google');
        //    timeout.flush(300);
        //    scope.$apply();
        //    expect(gridCtrl.search.Text).toBe('google');

        //});
        //it('reset button should be visible only when the input has text', function () {
        //    generate('<tb-text-search ></tb-text-search>');
        //    gridCtrl.search.Text = "search me";
        //    scope.$apply();
        //    var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
        //    expect(panel.hasClass('ng-hide')).toBe(false);
        //    gridCtrl.search.Text = "";
        //    scope.$apply();
        //    expect(panel.hasClass('ng-hide')).toBe(true);
            
            

        //});
        //it('reset button should reset the search input', function () {
        //    generate('<tb-text-search ></tb-text-search>');
        //    gridCtrl.search.Text = "search me";
        //    element.find('button')[0].click();
        //    scope.$apply();
        //    expect(gridCtrl.search.Text).toBe('');



        //});
    });
});