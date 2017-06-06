'use strict';

describe('Module: tubular.services', () => {

    describe('Service: localPager', () => {
        var localPager;
        
        beforeEach(() => {
            module('tubular.services');
            
            inject((_localPager_) => {
                localPager = _localPager_;
            });
        });
        
        it('should be defined', () => expect(localPager).toBeDefined());

    });
});
