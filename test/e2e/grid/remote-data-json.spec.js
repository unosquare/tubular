'use strict';

describe('Component: Grid', () => {

  let scope, compile, templateCache, template, element, $httpBackend;
  const serverUrl = 'sample.json';

  const dataSourceWithArrays = [
    [1, 'Alexei'],
    [2, 'Alejandro'],
    [3, 'Geovanni']
  ];

  const dataSourceWithObjects = [
    { ID: 1, Name: 'Alexei'},
    { ID: 2, Name: 'Alejandro'},
    { ID: 3, Name: 'Geovanni'}
  ];

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    scope.serverUrl = serverUrl;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenPOST(serverUrl)
    .respond({});
  }));

  function generate() {
    var tpl = templateCache.get('remote-data-json.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    scope.$digest();
  }

  it('remote data (json): should render rows correctly', () => {
    $httpBackend.expectPOST(serverUrl)
      .respond(200, dataSourceWithArrays);

    generate();
    $httpBackend.flush();

    const headers = element.find("th");
    expect(headers.length).toBe(2, 'should have 2 columns');
    const dataRow = element.find("tbody tr");
    expect(dataRow.length).toBe(3, 'should have 3 data rows');
  });

  it('remote data (array of arrays json): should render cells correctly', () => {
    $httpBackend.expectPOST(serverUrl)
      .respond(200, dataSourceWithArrays);

    generate();
    $httpBackend.flush();

    const dataCells = element.find("tbody tr td");
    expect($j(dataCells[0]).text().trim()).toBe('1');
    expect($j(dataCells[1]).text().trim()).toBe('Alexei');
  });
  
  it('remote data (array of objects json): should render cells correctly', () => {
    $httpBackend.expectPOST(serverUrl)
      .respond(200, dataSourceWithObjects);

    generate();
    $httpBackend.flush();

    const dataCells = element.find("tbody tr td");
    expect($j(dataCells[0]).text().trim()).toBe('1');
    expect($j(dataCells[1]).text().trim()).toBe('Alexei');
  });
});
