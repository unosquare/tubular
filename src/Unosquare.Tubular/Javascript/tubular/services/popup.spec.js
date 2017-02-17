'use strict';

describe('Module: tubular.services', function () {

    describe('Service: popup', function () {
        var popupService, uibModal, templateService;

        beforeEach(function () {
            module('tubular.services');
            module(function ($provide) {
                uibModal = jasmine.createSpyObj('uibModal', ['m']);
                templateService = jasmine.createSpyObj('templateService', ['m']);
             
                $provide.value('$uibModal', uibModal);
                $provide.value('tubularTemplateService', templateService);
            });

            inject(function (_tubularPopupService_) {
                popupService = _tubularPopupService_;

            });
        });

        it('should be defined', function () {
            expect(popupService).toBeDefined();
        })

    });
});