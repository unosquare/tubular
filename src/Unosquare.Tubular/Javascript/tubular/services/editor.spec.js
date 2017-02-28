'use strict';

describe('Module: tubular.services', function () {
  
    describe('Service: editor', function () {
        var filter, editor;

        beforeEach(function () {
            module('tubular.services');
            module(function ($filterProvider) {
                
                filter = jasmine.createSpy().and.returnValue('translated');
                $filterProvider.register('translate', function () { return filter;});

            });

            inject(function (_tubularEditorService_) {
                editor = _tubularEditorService_;
                
            });
        });


        it('should be defined', function() {
                expect(editor).toBeDefined();
            });

    });
});