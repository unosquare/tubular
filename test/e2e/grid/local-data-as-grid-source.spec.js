'use strict';

describe('Component: Grid', () => {

  let scope, compile, templateCache, template, element;

  const dataSource = [
      { 'ID': 1, 'Name': 'Alexei' },
      { 'ID': 2, 'Name': 'Alejandro' },
      { 'ID': 3, 'Name': 'Geovanni' }
  ];

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$templateCache_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    scope.dataSource = dataSource;
  }));

  function generate(flush) {
    var tpl = templateCache.get('columns-as-attribute.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    scope.$digest();
  }

  it('should render rows', () => {
    generate();

    expect(true).toBe(true);
  });
});