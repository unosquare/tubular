
'use strict';

describe('Component: Grid', () => {

  var scope, compile, templateCache, template, element, tubularColumn, $httpBackend;


  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));



  beforeEach(inject(function(_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_, _tubularColumn_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    $httpBackend = _$httpBackend_;
    tubularColumn = _tubularColumn_;
    generate('columns-as-attribute');
  }));

  function generate(caseName) {
    var tpl = templateCache.get(caseName + '.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    scope.columns = [
      new tubularColumn("id", {
        "Label": "ID", "DataType" : "numeric"
      }),
      new tubularColumn("name", {
        "Label": "Nombre", "DataType" : "string", "Sortable": true
      })
    ]
    scope.$digest();
  }



  it('should render specified columns', () => {
    const headers = element.find("th");


    expect(headers.length).toBe(2, 'should have 2 columns');
    expect($j(headers[0]).text().trim()).toBe('ID');
    expect($j(headers[1]).text().trim()).toBe('Nombre');
  });


});
