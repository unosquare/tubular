'use strict';

describe('Module: tubular.services', function () {
  
    describe('Interceptor: Auth', function () {
        var AuthInterceptor, $httpBackend;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularAuthInterceptor_, _$httpBackend_) {
                AuthInterceptor = _tubularAuthInterceptor_;
                $httpBackend = _$httpBackend_;
            });
        });
        
        it('should be defined', function () {
            expect(AuthInterceptor).toBeDefined();
            expect($httpBackend).toBeDefined();
        })

    });
});