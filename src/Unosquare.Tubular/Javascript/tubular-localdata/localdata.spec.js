'use strict';
describe('Module: tubular.services', function () {
    describe('Service: tubularLocalData', function () {
        var sut, tubularHttp;

        beforeEach(function () {
            angular.module('ui.bootstrap', []);
            module('tubular.services');
            module(function ($provide) {
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['get', 'getByKey', 'registerService', 'retrieveDataAsync']);
                $provide.value('tubularHttp', tubularHttp)
            })
            inject(function ($injector) {
                sut = $injector.get('tubularLocalData');
            })

        });


        it('should be defined', function () {
            expect(sut).toBeDefined();
        });

        it('should register itself as local', function () {
            expect(tubularHttp.registerService).toHaveBeenCalledWith('local', sut);
        });

        describe('method: get', function () {
            it('should delegate to tubularHttp.get', function () {
                var expected = Math.random();
                tubularHttp.get.and.returnValue(expected);

                var actual = sut.get();

                expect(actual).toBe(expected);
            })
        })

        describe('method: getByKey', function () {
            it('should delegate to tubularHttp.getByKey', function () {
                var expected = Math.random();
                tubularHttp.getByKey.and.returnValue(expected);

                var actual = sut.getByKey();

                expect(actual).toBe(expected);
            })
        })



        describe('method: retrieveDataAsync', function () {

        })

    });
});