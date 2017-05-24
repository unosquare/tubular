
'use strict';

describe('Component: Grid', () => {

  let scope, compile, templateCache, template, element, tubularColumn, $httpBackend;

  const serverUrl = 'api/data';

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_, _tubularColumn_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    $httpBackend = _$httpBackend_;
    tubularColumn = _tubularColumn_;
    scope.serverUrl = serverUrl;
    scope.columns = [
      new tubularColumn("id", {
        "Label": "ID",
        "DataType": "numeric"
      }),
      new tubularColumn("name", {
        "Label": "Nombre",
        "DataType": "string",
        "Sortable": true
      })
    ]
  }));

  function generate(flush) {
    var tpl = templateCache.get('columns-as-attribute.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    if (flush) $httpBackend.flush();
    scope.$digest();
  }

  it('should render specified columns', () => {
    generate();

    const headers = element.find("th");
    expect(headers.length).toBe(2, 'should have 2 columns');
    expect($j(headers[0]).text().trim()).toBe('ID');
    expect($j(headers[1]).text().trim()).toBe('Nombre');
  });

  xit('should rerender columns if changed', () => {
    generate();

    scope.columns.push(new tubularColumn("value", {
      "Label": "Valor",
      "DataType": "string",
      "Sortable": false
    }));
    scope.$digest()

    const headers = element.find("th");

    expect(headers.length).toBe(3, 'should have 3 columns');
    expect($j(headers[0]).text().trim()).toBe('ID');
    expect($j(headers[1]).text().trim()).toBe('Nombre');
    expect($j(headers[2]).text().trim()).toBe('Valor');
  }).pend('El simio dijo que no va a jalar');

  it('should bind columns correctly', () => {
    scope.columns.push(new tubularColumn("value", {
      "Label": "Valor",
      "DataType": "string",
      "Sortable": false
    }));
    $httpBackend.expectPOST(serverUrl)
    .respond(200, {"Counter":0,"Payload":[[1,"Geo","Tubular"]],"TotalRecordCount":1,"FilteredRecordCount":1,"TotalPages":1,"CurrentPage":1,"AggregationPayload":{}});

    generate(true);

    const dataRow = element.find("tbody tr");
    expect(dataRow.length).toBe(1, 'should have 1 data row');
    const data = $j(dataRow).find("td");
    expect(data.length).toBe(3, 'should have 3 columns');
    expect($j(data[0]).text().trim()).toBe('1', 'column 1 should have correct data');
    expect($j(data[1]).text().trim()).toBe('Geo', 'column 2 should have correct data');
    expect($j(data[2]).text().trim()).toBe('Tubular', 'column 3 should have correct data');
  });
});
