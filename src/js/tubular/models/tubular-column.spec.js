'use strict';

describe('Module: tubular.models', () => {
    describe('Tubular Column', () => {
        var tubularColumn,
            sortDirection,
            aggregateFunctions,
            dataTypes;

        beforeEach(() => {
            module('tubular.core');
            module('tubular.models');
            module('tubular.services');

            inject(
                _tubularColumn_ => tubularColumn = _tubularColumn_,
                _sortDirection_ => sortDirection = _sortDirection_,
                _aggregateFunctions_ => aggregateFunctions = _aggregateFunctions_,
                _dataTypes_ => dataTypes = _dataTypes_);
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
            expect(sut.SortDirection).toBe(sortDirection.NONE);
            expect(sut.IsKey).toBe(false);
            expect(sut.Visible).toBe(true);
            expect(sut.DataType).toBe(dataTypes.STRING);
            expect(sut.Aggregate).toBe(aggregateFunctions.NONE);
        });

        it('should constructor with name and option define label', () => {
            var sut = tubularColumn('Test', { Label: 'My Column' });
            expect(sut.Label).toBe('My Column');
        });

        it('should fail constructor with wrong datatype', () => {
            expect(() => tubularColumn('Test', { DataType: 'dummy' })).toThrow(`Invalid data type: 'dummy' for column 'Test'`);
        });

        it('should fail constructor with wrong aggregate', () => {
            expect(() => tubularColumn('Test', { Aggregate: 'dummy' })).toThrow(`Invalid aggregate function: 'dummy' for column 'Test'`);
        });
    });
});