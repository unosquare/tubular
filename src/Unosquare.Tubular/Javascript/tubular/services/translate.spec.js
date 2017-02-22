'use strict';

describe('Module: tubular.services', function () {

    describe('Service: tubularTranslate', function () {
        var tubularTranslate;

        beforeEach(function () {
            module('tubular.services');

            inject(function (_tubularTranslate_) {
                tubularTranslate = _tubularTranslate_;
            });
        });

        it('should be defined', function () {
            expect(tubularTranslate).toBeDefined();
        });
    });
});