'use strict';

describe('Component: Grid.Pager', () => {

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
    var tpl = templateCache.get('tbGridPager.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    if (flush) $httpBackend.flush();
    scope.$digest();
  }

  it('should render pager', () => {
    generate();

    const buttons = element.find("li");
    expect(buttons.length).toBe(5, 'should have 5 buttons');
  });

  it('should have more pages', () => {
    var payload = [];
    for (var index = 0; index < 100; index++) {
      payload.push([index, 'Name' + index]);
    }
    $httpBackend.expectPOST(serverUrl)
      .respond(200, {"Counter": 0, "Payload": payload, "TotalRecordCount": 100, "FilteredRecordCount": 100, "TotalPages": 10, "CurrentPage": 1, "AggregationPayload": {}});

    generate(true);

    const buttons = element.find("li");
    expect(buttons.length).toBe(9, 'should have 9 buttons');
  });

  it('state of the buttons',() => {
    const buttons = element.find('a').toArray();

    expect(buttons[0].hasAttribute('disabled')).toBe(true);
    expect(buttons[1].hasAttribute('disabled')).toBe(true);
    expect(buttons[2].hasAttribute('disabled')).toBe(false);
    expect(buttons[3].hasAttribute('disabled')).toBe(false);
    expect(buttons[4].hasAttribute('disabled')).toBe(false);
    expect(buttons[5].hasAttribute('disabled')).toBe(false);
    expect(buttons[6].hasAttribute('disabled')).toBe(false);
    expect(buttons[7].hasAttribute('disabled')).toBe(false);
    expect(buttons[8].hasAttribute('disabled')).toBe(false);
  })

  it('click 2 page', () => {
    const buttons = element.find('li a');
    const data = element.find('td');
    buttons[3].click();
  });

});