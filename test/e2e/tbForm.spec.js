'use strict';

describe('Tubular Form', () => {

        var scope, compile, template, element;


        beforeEach(module('tubular'));

        beforeEach(inject(function (_$compile_, _$rootScope_) {
            scope = _$rootScope_;
            compile = _$compile_;

        }));

        function generate(tpl) {
            template = angular.element(tpl);
            element = compile(template)(scope);
            scope.$digest();

        }

        beforeEach(() => {
            generate(`<div><tb-form form-name='nombre_de_forma' server-url='mockapi/orders/' require-authentication='false' model='modelProp' server-save-url='mockapi/orders/save'><tb-simple-editor min="3" show-label="true" name="CustomerName" help="Please a good name"></tb-simple-editor><button id="btnDefault" class="btn btn-warning" ng-click="Model.CustomerName = 'Unosquare'">Default name</button></tb-form></div>`);

        });


        it('should pass', (done) => {
            element.find('#btnDefault').click();

            expect(element.find('input').attr('value')).toBe('Unosquare');
            done();
        });



});
