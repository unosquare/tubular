'use strict';

var models = [{
    'Id': 8,
    'Name': 'Guzman Webster',
    'Company': 'IDEGO',
    'Email': 'guzmanwebster@idego.com',
    'Phone': '+1 (869) 428-2675',
    'Birthday': 'Fri Mar 01 1996 00:57:47 GMT-0600 (Central Standard Time (Mexico))',
    'IsOwner': 'false'
}];

describe('Module: tubular.services', () => {

    describe('Controller: GenericPopupController', () => {
        var $controller, scope, rootScope, gridScope, $modalInstance;

        beforeEach(() => {
            module('tubular.services');

            inject((_$controller_, _$rootScope_) => {
                $controller = _$controller_;
                scope = _$rootScope_.$new();
                rootScope = _$rootScope_.$new();
                gridScope = jasmine.createSpyObj('gridScope', ['saveRow']);

                $modalInstance = jasmine.createSpyObj('$uibModalInstance', ['close']);
            })
        });

        beforeEach(() =>
            $controller('GenericPopupController', {
                '$rootScope': rootScope,
                '$scope': scope,
                'model': models,
                '$uibModalInstance': $modalInstance,
                'gridScope': gridScope
            }));

        it('should scope.Model to be equals model', () => {
            expect(scope.Model).toBe(models);
        })

        it('should scope.savePopup to be defined', () => {
            expect(scope.savePopup).toBeDefined();
        })

        it('should scope.closePopup to be defined', () => {
            expect(scope.closePopup).toBeDefined();
        })

        describe('Method: savePopup', () => {
            beforeEach(() => {
                models.$isNew = false;
                models.$hasChanges = false;
            });
        });

        xit('should savePopup return null', () => {
            expect(scope.savePopup(models, false)).toBe(null);
        })

        xit('should result to be null', () => {
            expect(scope.savePopup(models, true)).toBe(null);
        })

        xit('should savePopup to be defined', () => {
            models.save = () => {
                return new Promise((resolve, reject) => {});
            };
            expect(scope.savePopup(models, true)).toBeDefined();
        })
    });
});