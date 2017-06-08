'use strict';

describe('Component: Grid.Pager', () => {

  let scope, compile, templateCache, template, element, $httpBackend;
  let pageSelector, select, option;

  const serverUrl = 'api/data';

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    $httpBackend = _$httpBackend_;
    scope.serverUrl = serverUrl;
  }));

  function generate(flush) {
    var tpl = templateCache.get('tbPageSizeSelector.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    if (flush) $httpBackend.flush();
    scope.$digest();
  }

  beforeEach(() => {
    generate();

    pageSelector = element.find('tb-page-size-selector');
    select = element.find('select');
    option = element.find('option');
  });

  it('should render page size selector', () => {  
    expect(pageSelector).toBeDefined();   
  });

  it('should have correct data', () => {  
    var label = pageSelector.find('label');

    expect($j(label).text().trim()).toBe('Page size:');
    expect($j(option[0]).is(':selected')).toBeTruthy();
    expect($j(option[0]).text().trim()).toBe('10');
    expect($j(option[1]).text().trim()).toBe('20');
    expect($j(option[2]).text().trim()).toBe('50');
    expect($j(option[3]).text().trim()).toBe('100');
  });

  all('should have selected records correctly', [20, 50, 100], range => {
    var payload = [];
    for (var index = 1; index <= range; index++) {
      payload.push([index, 'Name' + index]);
      
    }  
     $httpBackend.expectPOST(serverUrl)
      .respond(200, {"Counter": 0, "Payload": payload, "TotalRecordCount": 100, "FilteredRecordCount": 100, "TotalPages": 5, "CurrentPage": 1, "AggregationPayload": {}});

    generate(true);

    var dataRows = element.find('tr');
    $j(select).val('number:' + range);

    const idx = (range == 20) ? 1 : (range == 50 ? 2 : 3);

    expect($j(dataRows).length).toBe(range + 1);
    expect($j(option[0]).is(':selected')).toBeFalsy();
    expect($j(option[idx]).is(':selected')).toBeTruthy();
  });
});