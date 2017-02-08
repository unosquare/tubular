"use strict";

describe('service: tubularLocalData', function () {
    var sut, tubularHttp;

    
    beforeEach(function () {
        angular.module('ui.bootstrap', []);
        module('tubular.services');
        module(function ($provide) {
            tubularHttp = jasmine.createSpyObj('tubularHttp', ['get', 'getByKey', 'registerService']);
            $provide.value('tubularHttp', tubularHttp)
        })
        inject(function ($injector) {
            sut = $injector.get('tubularLocalData');
        })

    });


    it('should be defined', function () {
        expect(sut).toBeDefined();
    });
    it('should have get method', function () {
        expect(sut.get).toBe(tubularHttp.get);
    })

    it('should have getByKey method', function () {
        expect(sut.getByKey).toBe(tubularHttp.getByKey);
    })
});