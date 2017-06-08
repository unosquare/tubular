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
            var select = $j(form).find('select')[0];
            var input = $j(form).find('input')[0]; 
            var buttons = $j(form).find('button');

            expect(popover.hasAttribute('uib-popover-template-popup')).toBeTruthy();
            expect($j(popover).find('h3').text().trim()).toBe('Filter');
            expect($j(select)).toBeDefined();
            expect($j(buttons).length).toBe(4);
        });

        all('should have options', ['None','Equals','NotEquals','Contains','NotContains','StartsWith','NotStartsWith','EndsWith','NotEndsWith'], range => { 
            expect($j(options[idx++]).val()).toBe('string:'+range);            
        });

        all('should have state of input and buttons', ['string:None','string:Equals','string:NotEquals','string:Contains','string:NotContains','string:StartsWith','string:NotStartsWith','string:EndsWith','string:NotEndsWith'], range => {
            var select = $j(form).find('select')[0];
           
            $j(select).val(range).change();

            select = $j(form).find('select')[0];
            var input = $j(form).find('input')[0];            
            var apply = $j(form).find('button')[2];
            var clear = $j(form).find('button')[3];

            expect($j(select).val()).toBe(range);

            if(range == 'string:None'){
                expect(input.hasAttribute('disabled')).toBeTruthy('input ' + range);
                expect(apply.hasAttribute('disabled')).toBeTruthy('apply ' + range);
            }
            else{
                expect(input.hasAttribute('disabled')).toBeFalsy('input ' + range);
                expect(apply.hasAttribute('disabled')).toBeFalsy('apply ' + range);
            }
            expect(clear.hasAttribute('disabled')).toBeFalsy('clear ' + range);
        });

        describe('Filter Data', () => {

            let select, input, apply, clear;

            beforeEach(() => {
                generate();

                filter = element.find('tb-column-filter');
                var buttonFilter = $j(filter).find('button')[0];

                $j(buttonFilter).click();

                scope.$digest();

                select = $j(form).find('select')[0];
                input = $j(form).find('input')[0];
                apply = $j(form).find('button')[2];
                clear = $j(form).find('button')[3];
                
            })

            it('should filter Equals', () => {
                $j(select).val('string:Equals').change();

                input = $j(form).find('input');
                input.val('1');

                $j(apply).click();

                $httpBackend.expectPOST(serverUrl)
                    .respond(200, {"Counter": 0, "Payload": [[1, 'Name1']], "TotalRecordCount": 500, "FilteredRecordCount": 1, "TotalPages": 0, "CurrentPage": 0, "AggregationPayload": {}});

                generate(true);

                var data = element.find('tbody tr');

                expect(data.length).toBe(1);
            });
        });
    });
});