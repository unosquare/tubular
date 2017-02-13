'use strict';
describe('Module: tubular.services', function () {
    describe('Service: tubularLocalData', function () {
        var sut, tubularHttp, pager;

        beforeEach(function () {
            angular.module('ui.bootstrap', []);
            module('tubular.services');
            module(function ($provide) {
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['get', 'getByKey', 'registerService', 'retrieveDataAsync']);
                pager = jasmine.createSpyObj('pager', ['page']);
                $provide.value('tubularHttp', tubularHttp)
                $provide.value('tubularLocalDataPager', pager)
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

        describe('Method: get', function () {
            it('should delegate to tubularHttp.get', function () {
                var expected = Math.random();
                tubularHttp.get.and.returnValue(expected);

                var actual = sut.get();

                expect(actual).toBe(expected);
            })
        })

        describe('Method: getByKey', function () {
            it('should delegate to tubularHttp.getByKey', function () {
                var expected = Math.random();
                tubularHttp.getByKey.and.returnValue(expected);

                var actual = sut.getByKey();

                expect(actual).toBe(expected);
            })
        })



        describe('Method: retrieveDataAsync', function () {
            var request, defered, scope;

            beforeEach(inject(function (_$q_, _$rootScope_) {
                request = {
                    requireAuthentication: true,
                    serverUrl: 'http://someurl'
                };
                scope = _$rootScope_;
                defered = {
                    promise: _$q_.defer()
                }
                
            }))

            function call() {
                return sut.retrieveDataAsync(request);
            }

            it('should reset requireAuthentication on request', function () {
                tubularHttp.retrieveDataAsync.and.returnValue(defered)
                defered.promise.resolve(['test']);

                call()
                scope.$digest();

                expect(request.requireAuthentication).toBe(false);
            })

            describe('url starts with http', function () {
                

                it('should return result from tubularHttp', function () {

                    tubularHttp.retrieveDataAsync.and.returnValue(defered)
                    defered.promise.resolve(['test']);

                    var result = call();
                    scope.$digest();
                    expect(tubularHttp.retrieveDataAsync).toHaveBeenCalledWith(request);

                })
            })

            
        })

    });
});