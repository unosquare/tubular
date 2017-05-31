'use strict';

describe('Module: tubular.models', () => {
    describe('Tubular Column', () => {
        var tubularColumn;

        beforeEach(() => {
            module('tubular.models');

            inject(_tubularColumn_ => tubularColumn = _tubularColumn_);
        });

        it('should tubularModel to be defined', () => expect(tubularColumn).toBeDefined());

        it('should constructor create instance', () => {
            var sut = tubularColumn('Test');
            expect(sut).toBeDefined();
        });

        it('should constructor with name define column name', () => {
            var sut = tubularColumn('Test');
            expect(sut.Name).toBe('Test');
        });

        it('should constructor with name define label properly', () => {
            var sut = tubularColumn('MyColumn');
            expect(sut.Label).toBe('My Column');
        });

        it('should constructor with name define default values', () => {
            var sut = tubularColumn('Test');
            expect(sut.SortOrder).toBe(-1);
            expect(sut.SortDirection).toBe('None');
            expect(sut.IsKey).toBe(false);
            expect(sut.Visible).toBe(true);
            expect(sut.DataType).toBe('string');
            expect(sut.Aggregate).toBe('none');
        });

        it('should constructor with name and option define label', () => {
            var sut = tubularColumn('Test', {Label: 'My Column'});
            expect(sut.Label).toBe('My Column');
        });
    });
});