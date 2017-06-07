'use strict';

describe('Component: Grid', () => {

  let scope, compile, templateCache, template, element;

  const dataSource = [
    [1, 'Alexei'],
    [2, 'Alejandro'],
    [3, 'Geovanni']
  ];

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    scope.dataSource = dataSource;
  }));

  function generate() {
    var tpl = templateCache.get('local-data-array.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    scope.$digest();
  }

  it('should render rows correctly', () => {
    generate();

    const headers = element.find("th");
    expect(headers.length).toBe(2, 'should have 2 columns');
    const dataRow = element.find("tbody tr");
    expect(dataRow.length).toBe(3, 'should have 3 data rows');
  });
});
