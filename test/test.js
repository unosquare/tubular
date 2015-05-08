var assert = require("assert");
var tubulargen = require("../dist/node-module.js");

describe('tubularTemplateServiceModule', function () {
    var models = require("./models");
    var columns = tubulargen.createColumns(models);

    describe('#createColumns()', function () {
        it('should return an array with 7 elements', function () {
            assert.notEqual(columns, []);
            assert.equal(columns.length, 7);
        });

        it('first element should match', function() {
            var first = require('./firstcolumn');
            assert.deepEqual(columns[0], first);
        });
    });
});