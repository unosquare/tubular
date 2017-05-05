'use strict';

describe('Module: tubular.models', () => {
    describe('Tubular Model', () => {
        var scope, tubularModel, ctrl, obj;

        beforeEach(() => {
            module('tubular.services');
            module('tubular.models');

            inject((_$rootScope_, _tubularModel_) => {
                scope = _$rootScope_.$new();
                tubularModel = _tubularModel_;
            });

            ctrl = {
                columns: [
                    { 'DataType': 'string', 'IsKey': true, 'Name': 'Id' },
                    { 'DataType': 'string', 'IsKey': false, 'Name': 'Name' }
                ]
            };
        });

        it('should tubularModel to be defined', () => expect(tubularModel).toBeDefined());

        describe('With data as array', () => {

            beforeEach(() => {
                var data = ["1", "GDL"];
                obj = tubularModel(scope, ctrl, data);
            });

            it('should obj result to be defined', () => {
                expect(obj).toBeDefined();
            })

            it('should obj.$key to be 1', () => {
                expect(obj.$key).toBe('1');
            })

            it('should $addField method to be called', () => {
                expect(obj.$fields.length).toBe(2);
            })

            it('should obj.$isEditing to be false', () => {
                expect(obj.$isEditing).toBe(false);
            })

            it('should obj.$hasChanges to be false', () => {
                expect(obj.$hasChanges).toBe(false);
            })

            it('should obj.$isNew to be false', () => expect(obj.$isNew).toBe(false))
        });

        describe('With data as object', () => {

            beforeEach(() => {
                var data = { "Id": "1", "Name": "GDL" };
                obj = tubularModel(scope, ctrl, data);
            });

            it('should $addField method to be called', () => {
                expect(obj.$fields.length).toBe(2);
            })

            it('should obj.$key to be 1', () => {
                expect(obj.$key).toBe('1');
            })

            it('should $valid to be true', () => {
                expect(obj.$valid()).toBe(true);
            })

            it('should $valid to be false', () => {
                obj.$state = [{ $valid: () => false }];
                expect(obj.$valid()).toBe(false);
            })
        });

        it('should $key have multiple values', () => {
            var data = ["3", "ZAP"];
            ctrl.columns = [
                { 'DataType': 'string', 'IsKey': true, 'Name': 'Id' },
                { 'DataType': 'string', 'IsKey': true, 'Name': 'Name' }
            ];
            obj = new tubularModel(scope, ctrl, data);

            expect(obj.$key).toBe('3,ZAP');
        });

        describe('working with $original', () => {
            beforeEach(() => {
                var data = { "Id": "1", "Name": "GDL" };
                obj = new tubularModel(scope, ctrl, data);
            });


            it('should have original values value', () => {
                expect(obj.$original.Id).toBe('1');
                expect(obj.$original.Name).toBe('GDL');
            });

            it('should revert changes', () => {
                obj.Id = '2';
                obj.Name = 'ZAP';
                obj.revertChanges();
                expect(obj.Id).toBe('1');
                expect(obj.Name).toBe('GDL');
            });

            it('should reset originals', () => {
                obj.Id = '2';
                obj.Name = 'ZAP';
                obj.resetOriginal();
                expect(obj.$original.Id).toBe('2');
                expect(obj.$original.Name).toBe('ZAP');
            });
        });
    });
});