'use strict';

describe('Module: tubular.directives', function () {
    describe('Controller: tbTextSearchController', function () {
        var sut, scope, $element, $routeParams, tubularHttp, tubularModel, tubularEditorService;
        var $controller;

        beforeEach(function () {
            module('tubular.directives');
           


        })

        beforeEach(inject(function (_$controller_, $rootScope) {
            scope = $rootScope.$new();
            $controller = _$controller_;

        }));

        function create() {
            sut = $controller('tbTextSearchController', { '$scope': scope });
        }

        describe('constructor', function () {

            beforeEach(create);

            it('should set tubularDirective properly', function () {
                
            })

          
        })
       






    });
});
