'use strict';

describe('Module: tubular.directives', function () {
    describe('Controller: tbTextSearchController', function () {
        var sut, scope, $element, $routeParams, tubularHttp, tubularModel, tubularEditorService;
        var $controller;

        beforeEach(function () {
            module('tubular.directives');
        });

        beforeEach(inject(function (_$controller_, $rootScope) {
            scope = $rootScope.$new();
            $controller = _$controller_;
            
        }));

        function create() {
            sut = $controller('tbTextSearchController', { '$scope': scope });
            sut.$component = {
                search: {}
            };
        }

        describe('Method: $onInit', function () {

            beforeEach(create);

            it('should set default minChars properly', function () {
                sut.$onInit();

                expect(sut.minChars).toBe(3);
            });
            it('should not modify minChars if specified', function () {
                sut.minChars = 5;

                sut.$onInit();

                expect(sut.minChars).toBe(5);
            });
            it('should set lastSearch properly', function () {
                sut.$component.search.Text = "sometext";

                sut.$onInit();

                expect(sut.lastSearch).toBe("sometext");
            });
        });


        describe('Watch: search.Text', function () {

            beforeEach(create);

           


        });
    });
});
