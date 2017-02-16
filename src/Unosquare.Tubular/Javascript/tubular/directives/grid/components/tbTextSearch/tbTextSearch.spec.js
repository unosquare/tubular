'use strict';

describe('Module: tubular.directives', function () {
    describe('component: tbTextSearch', function () {
        var sut, ctrl, scope, $compile, isolated, template, element, gridCtrl;

        beforeEach(function () {
            module('tubular.directives');
            module(function ($controllerProvider) {
                ctrl = jasmine.createSpyObj('ctrl', ['finishDefinition']);

                $controllerProvider.register('tbTextSearchController', function ($scope) {
                    $scope.finishDefinition = ctrl.finishDefinition;

                });
            })


        });

        beforeEach(inject(function (_$compile_, _$rootScope_) {
            scope = _$rootScope_.$new();
            $compile = _$compile_;

        }));

        function generate(tpl) {
            template = angular.element();
            element = $compile(template)(scope)
            element.data('$tbGridController', gridCtrl);
            scope.$digest();
            isolated = element.isolateScope()
        }

        it('should pass', function () {
            generate('<tb-text-search class="col-md-3 col-xs-6"></tb-text-search>')
        })
    })
});