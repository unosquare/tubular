'use strict';

describe('Module: tubular.services', () => {

    describe('Service: localPager', () => {
        var localPager;
        const emptyResponse = {
                Counter: 0,
                CurrentPage: 1,
                FilteredRecordCount: 0,
                TotalRecordCount: 0,
                Payload: [],
                TotalPages: 0
            };

        beforeEach(() => {
            module('tubular.services');
            
            inject((_localPager_) => {
                localPager = _localPager_;
            });
        });
        
        it('should be defined', () => expect(localPager).toBeDefined());

        it('should return a promise', () => {
            expect(localPager.process(null, null)).toBeDefined();
        });

        it('should return empty response with null data', done => {
            localPager.process(null, null).then(data => {
                expect(data).toBe(emptyResponse);
                done();
            });
        });
    });
});
