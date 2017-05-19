
'use strict';

describe('Component: Grid', () => {

      var scope, compile, templateCache, template, element, TbColumn, $httpBackend;


      beforeEach(module('tubular.tests'));
      beforeEach(module('tubular'));



      beforeEach(inject(function(_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_, _TbColumn_) {
        scope = _$rootScope_;
        compile = _$compile_;
        templateCache = _$templateCache_;
        $httpBackend = _$httpBackend_;
        generate('columns-as-attribute');
      }));

      function generate(caseName) {
        var tpl = templateCache.get(caseName + '.case.html');
        template = angular.element(tpl);
        element = compile(template)(scope);
        scope.columns = [
          new TbColumn("id", {
            "Label": "ID"
          }),
          new TbColumn("name", {
            "Label": "Nombre"
          })
        ]
        scope.$digest();
      }



      it('should pass', () => {
          

          const headers = element.find("th");

          expect(headers).toBeDefined('should have columns');
          expect(headers.length).toBe(2, 'should have 2 columns');
      });
