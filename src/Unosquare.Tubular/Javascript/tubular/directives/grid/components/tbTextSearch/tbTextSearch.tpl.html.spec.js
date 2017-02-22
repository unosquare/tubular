'use strict';

describe('Module: tubular.directives', function () {
    describe('template: tbTextSearch', function () {
        var scope, template, element, timeout, filter, $compile;
        
        beforeEach(function () {
            module('tubular.directives');


            module(function ($controllerProvider, $filterProvider) {

                filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter; });
            });
        });

        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _$templateCache_) {
            scope = _$rootScope_.$new();
            scope.$ctrl = {
                placeholder: '',
                search: {
                    Text: ''
                }
            }
            $compile = _$compile_;
            timeout = _$timeout_;
            template = _$templateCache_.get('tbTextSearch.tpl.html');
           
        }));

        function generate() {
            element = angular.element('<form name="form1">' + template + '</form>');
            element = $compile(element)(scope);
            scope.$digest();
        }

        it('should exist', function () {
            generate();

            expect(element).toBeDefined();
        });

        it('should set placeholder correctly', function () {
            scope.$ctrl.placeholder = 'search me'

            generate();

            expect(filter).not.toHaveBeenCalledWith('UI_SEARCH');

        });

        it('should fallback placeholder to UI_SEARCH', function () {
            scope.$ctrl.placeholder = ''

            generate();

            expect(filter).toHaveBeenCalledWith('UI_SEARCH');

        });


        
       
       
        it('should translate the input placeholder', function () {
            generate();
            expect(filter).toHaveBeenCalledWith('CAPTION_CLEAR');

        });

        it('input should debounce (before)', function () {
            generate();

            scope.form1.tbTextSearchInput.$setViewValue('google');
            timeout.flush(299);
            scope.$apply();
            expect(scope.form1.tbTextSearchInput.$modelValue).not.toBeDefined();
        });
        it('input should debounce (after)', function () {
            generate();
            scope.form1.tbTextSearchInput.$setViewValue('google');
            timeout.flush(300);
            scope.$apply();
            expect(scope.form1.tbTextSearchInput.$modelValue).toBe('google');

        });
        it('reset button should be visible only when the input has text', function () {
            generate();
            scope.form1.tbTextSearchInput.$setViewValue('google');
            timeout.flush(300);
            scope.$apply();
            var panel = angular.element(element[0].querySelector('#tb-text-search-reset-panel'));
            expect(panel.hasClass('ng-hide')).toBe(false);
            scope.form1.tbTextSearchInput.$setViewValue('');
            timeout.flush(300);
            scope.$apply();
            expect(panel.hasClass('ng-hide')).toBe(true);
            
            

        });
        it('reset button should reset the search input', function () {
            generate();
            scope.form1.tbTextSearchInput.$setViewValue('google');
            element.find('button')[0].click();
            scope.$apply();
            expect(scope.form1.tbTextSearchInput.$viewValue).toBe('');



        });
    });
});