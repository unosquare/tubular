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

    describe('Service: popup', () => {
        var popupService, tubularTemplateService, $controller, uibModal, dialog, scope;

        beforeEach(() => {
            module('tubular.services');

            inject((_tubularPopupService_, _tubularTemplateService_) => {
                popupService = _tubularPopupService_;
                tubularTemplateService = _tubularTemplateService_;
            });
        });

        beforeEach(inject((_$controller_, _$rootScope_) => {
            $controller = _$controller_;
            scope = _$rootScope_.$new();
        }));

        beforeEach(() => {
            popupService.fakeMethod = () => {};
            spyOn(popupService, "fakeMethod").and.callFake(function() {
                return this;
            });
            dialog = popupService.fakeMethod();
        });


        it('should popupService to be defined', () => {
            expect(popupService).toBeDefined();
        })

        it('should openDialog to be defined', () => {
            expect(dialog.openDialog).toBeDefined();
        })

        it('should onSuccessForm to be defined', () => {
            expect(dialog.onSuccessForm).toBeDefined();
        })

        it('should onConnectionError to be defined', () => {
            expect(dialog.onConnectionError).toBeDefined();
        })

        it('should create a modal instance', () => {
            var templateName = 'temp' + (new Date().getTime()) + '.html';
            tubularTemplateService.generatePopup(models, 'Test');
            var instance = dialog.openDialog(templateName, models, scope, 'lg');
            expect(instance).toBeDefined();
        })

    });
});