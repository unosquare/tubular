'use strict';

describe('Component: Grid.Pager-Info', () => {

  let scope, compile, templateCache, template, element, $httpBackend;

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
    var tpl = templateCache.get('tbGridPagerInfo.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    if (flush) $httpBackend.flush();
    scope.$digest();
  }

  it('should render pager-info', () => {
    generate();

    const pagerInfo = element.find('tb-grid-pager-info');
    expect(pagerInfo).toBeDefined();
  });

  all('should show correct message',[100, 200, 500], range => {
    var payload = [];
    for (var index = 0; index < range; index++) {
      payload.push([index, 'Name' + index]);
    }
    $httpBackend.expectPOST(serverUrl)
      .respond(200, {"Counter": 0, "Payload": payload, "TotalRecordCount": range, "FilteredRecordCount": range, "TotalPages": 10, "CurrentPage": 1, "AggregationPayload": {}});

    generate(true);

    const pagerInfo = element.find('tb-grid-pager-info div');
    expect(pagerInfo.text().trim()).toBe('Showing 1 to 10 of '+range+' records (Filtered from '+range+' total records)');
  });  
});