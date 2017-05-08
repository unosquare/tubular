'use strict';

describe('Module: tubular.directives', () => {
    describe('Controller: tbTextSearchController', () => {
        var sut, scope, $element, $routeParams, tubularEditorService;
        var $controller;

        beforeEach(() => {
            module('tubular.directives');
            
            inject(function (_$controller_, $rootScope) {
                scope = $rootScope.$new();
                $controller = _$controller_;
            });
        });

        function create() {
            sut = $controller('tbTextSearchController', { '$scope': scope });
            sut.$component = {
                search: {}
            };
        }

        describe('Method: $onInit', () => {
            beforeEach(create);

            it('should set default minChars properly', () => {
                sut.$onInit();

                expect(sut.minChars).toBe(3);
            });
            
            it('should not modify minChars if specified', () => {
                sut.minChars = 5;

                sut.$onInit();

                expect(sut.minChars).toBe(5);
            });

            it('should set lastSearch properly', () => {
                sut.$component.search.Text = "sometext";

                sut.$onInit();

                expect(sut.lastSearch).toBe("sometext");
            });
        });

        describe('Watch: search.Text', () => {
            beforeEach(create);
        });
    });
});
