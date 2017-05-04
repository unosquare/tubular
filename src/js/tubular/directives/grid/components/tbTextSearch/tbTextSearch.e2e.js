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
                gridCtrl = {
                    search: {
                        Text : ''
                    },
                    saveSearch: jasmine.createSpy(),
                    retrieveData: jasmine.createSpy()
                };
            });
            
        });

        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
            scope = _$rootScope_.$new();
            $compile = _$compile_;
            timeout = _$timeout_;
            
        }));

        function generate(options) {
            options = options || { placeholder: 'search me', minChars: 6}
            element = angular.element('<tb-text-search></tb-text-search>');
            if (options.placeholder) element.attr('placeholder', options.placeholder);
            if (options.minChars) element.attr('min-chars', options.minChars);

            element.data('$tbGridController', gridCtrl);
            element = $compile(element)(scope);
            scope.$digest();
        }

        it('default state', function () {
            gridCtrl.search.Text = '';

            generate();

            expect(element.find('input').attr('placeholder')).toBe('search me');
            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');
            expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');
            var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
            expect(panel.hasClass('ng-hide')).toBe(true);

        });

        it('searching for a phrase (visual)', function () {
            gridCtrl.search.Text = '';
                
            generate();
            gridCtrl.search.Text = 'google';
            scope.$apply();
            timeout.flush(300);

            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');
            expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');
            var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
            expect(panel.hasClass('ng-hide')).toBe(false);

        });

        it('searching for a phrase (backend)', function () {
            generate();

            gridCtrl.search.Text = 'google sometimes';
            scope.$apply();
            timeout.flush(300);

            expect(gridCtrl.saveSearch).toHaveBeenCalled();
            expect(gridCtrl.search.Operator).toBe('Auto');
            expect(gridCtrl.retrieveData).toHaveBeenCalled();
        });
    });
});