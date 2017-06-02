﻿'use strict';

describe('Tubular Form', () => {

        var scope, compile, templateCache, template, element;

        const btnDefault = '#btnDefault';
        const inpCustomerName = "input[name='CustomerName']";

        beforeEach(module('tubular.tests'));
        beforeEach(module('tubular'));
        beforeEach(module(function ($controllerProvider) {
            $controllerProvider.register('onSaved', $scope => {
              $scope.$on('tbForm_OnSuccessfulSave', function () {
                  $scope.textSave = "Saved";
              });
            });
        }));


        beforeEach(inject(function (_$compile_, _$rootScope_,  _$templateCache_) {
            scope = _$rootScope_;
            compile = _$compile_;
            templateCache = _$templateCache_;
            generate('tbSingleForm');
        }));

        function generate(caseName) {
            var tpl = templateCache.get(caseName + '.case.html');
            template = angular.element(tpl);
            element = compile(template)(scope);
            scope.$digest();
        }



        it('should pass', () => {
            element.find(btnDefault).click();

            expect(element.find(inpCustomerName).val()).toBe('Unosquare');
        });

});
