'use strict';

describe('Module: tubular.services', function () {
    describe('Service: tubularLocalData', function () {
        var sut, tubularHttp, pager, localDataBase64;

        beforeEach(function () {
            angular.module('ui.bootstrap', []);
            module('tubular.services');
            module(function ($provide) {
                tubularHttp = jasmine.createSpyObj('tubularHttp', ['get', 'getByKey', 'registerService', 'retrieveDataAsync']);
                pager = jasmine.createSpyObj('pager', ['page']);
                localDataBase64 = jasmine.createSpyObj('localDataBase64', ['getFromUrl']);
                $provide.value('tubularHttp', tubularHttp)
                $provide.value('tubularLocalDataPager', pager)
                $provide.value('tubularLocalDataBase64', localDataBase64)
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
            var request, defered, httpResult, serverData, scope, expected;

            beforeEach(inject(function (_$q_, _$rootScope_) {
                request = {
                    requireAuthentication: true,
                    serverUrl: 'http://someurl'
                };
                scope = _$rootScope_;
                defered = _$q_.defer();
                serverData = ['test'];
                httpResult = {
                    promise: defered.promise
                }

                tubularHttp.retrieveDataAsync.and.returnValue(httpResult)
                expected = ['test expected']
                pager.page.and.returnValue(expected)
                
            }))

            function call() {
                return sut.retrieveDataAsync(request);
            }

            it('should reset requireAuthentication on request', function () {
                
                defered.resolve(serverData);

                call()
                scope.$digest();

                expect(request.requireAuthentication).toBe(false);
            })

            describe('url starts with http', function () {
                

                it('should get data from tubularHttp', function () {

                    defered.resolve(serverData);

                    call();
                    scope.$digest();

                    expect(tubularHttp.retrieveDataAsync).toHaveBeenCalledWith(request);

                })

                it('should use pager to page the data', function () {
                   
                    defered.resolve(serverData);

                    call();

                    scope.$digest();


                    expect(pager.page).toHaveBeenCalledWith(request, serverData);

                })

                it('should return result from pager', function (done) {
                    
                    defered.resolve(serverData);

                    call().promise.then(function (data) {
                        expect(data).toBe(expected);
                        done()
                    });

                    scope.$digest();
                })


                it('should cancel with correct reason', function (done) {
                    var reason = "cancelling";

                    call().cancel(reason).then(function (data) {
                        expect(data).toBe(reason);
                        done()
                    });

                    scope.$digest();
                })

                
            })

            describe('url starts with data', function () {

                beforeEach(function () {
                    request.serverUrl = "data://";
                })
                it('should get data from base64', function () {

                    

                    call();
                    scope.$digest();

                    expect(localDataBase64.getFromUrl).toHaveBeenCalledWith(request.serverUrl);

                })

                it('should use pager to page the data', function () {
                    localDataBase64.getFromUrl.and.returnValue(serverData);
                    
                    call();

                    scope.$digest();


                    expect(pager.page).toHaveBeenCalledWith(request, serverData);

                })

                it('should return result from pager', function (done) {

                    localDataBase64.getFromUrl.and.returnValue(serverData);

                    call().promise.then(function (data) {
                        expect(data).toBe(expected);
                        done()
                    });

                    scope.$digest();
                })


                it('should cancel with correct reason', function (done) {
                    var reason = "cancelling";

                    call().cancel(reason).then(function (data) {
                        expect(data).toBe(reason);
                        done()
                    });

                    scope.$digest();
                })


            })


            
        })

    });
});