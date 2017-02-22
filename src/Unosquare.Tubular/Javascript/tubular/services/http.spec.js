'use strict';

describe('Module: tubular.services', function () {

    describe('Service: http', function () {
        var $httpBackend, tubularHttp;

        beforeEach(function () {
            module('tubular.services');
            module(function ($filterProvider) {
                var filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter; });
            });

            inject(function ($injector, _tubularHttp_) {
                $httpBackend = $injector.get('$httpBackend');
                tubularHttp = _tubularHttp_;
            });
        });

        it('should be defined', function () {
            expect(tubularHttp).toBeDefined();
        });
    });
});