'use strict';

describe('Component: Grid.Filter', () => {

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
        var tpl = templateCache.get('tbColumnFilter.case.html');
        template = angular.element(tpl);
        element = compile(template)(scope);
        if (flush) $httpBackend.flush();
        scope.$digest();
    }

    it('should render filter', () => {
        generate();

        var filter = element.find('tb-column-filter');
        expect(filter).toBeDefined();
    });

    describe('Popover', () => {

    let filter, form, options, idx = 0;;

        beforeEach(() => {
            generate();

            filter = element.find('tb-column-filter');
            var buttonFilter = $j(filter).find('button')[0];

            $j(buttonFilter).click();

            scope.$digest();

            form = $j(filter).find('form')[0];
            options = $j(form).find('option');
        });

        it('should show popover template', () => {
            var popover = $j(filter).find('div div')[0];

            expect(popover.hasAttribute('uib-popover-template-popup')).toBeTruthy();
            expect($j(popover).find('h3').text().trim()).toBe('Filter');
        });

        all('should have options', ['None','Equals','NotEquals','Contains','NotContains','StartsWith','NotStartsWith','EndsWith','NotEndsWith'], range => { 
            expect($j(options[idx++]).val()).toBe('string:'+range);            
        });

        it('should have selected', () => {        
            var select = $j(form).find('select')[0];
            $j(select).val('string:Equals');
            scope.$digest();
            expect($j(select).val()).toBe('string:Equals');    
        });
    });
});