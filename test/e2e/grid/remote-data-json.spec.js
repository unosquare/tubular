'use strict';

describe('Component: Grid', () => {

  let scope, compile, templateCache, template, element, $httpBackend;
  const serverUrl = 'sample.json';

  const dataSource = [
    [1, 'Alexei'],
    [2, 'Alejandro'],
    [3, 'Geovanni']
  ];

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    scope.serverUrl = serverUrl;
    $httpBackend = _$httpBackend_;
  }));

  function generate() {
    var tpl = templateCache.get('remote-data-json.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    scope.$digest();
  }

  it('remote data (json): should render rows correctly', () => {

    $httpBackend.expectPOST(serverUrl)
      .respond(200, dataSource);

    generate();

    $httpBackend.flush();

    const headers = element.find("th");
    expect(headers.length).toBe(2, 'should have 2 columns');
    const dataRow = element.find("tbody tr");
    expect(dataRow.length).toBe(3, 'should have 3 data rows');
  });
});
