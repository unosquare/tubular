var gulp = require('gulp');
var Dgeni = require('dgeni');
var fs = require('fs');
var path = require('path');

gulp.task('dgeni', function() {
    try {
        var dgeni = new Dgeni([require('./docs/dgeni-conf')]);
        return dgeni.generate().then(function(docs) {
            var data = [];
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];

                if (typeof (doc.name) === 'undefined' || typeof (doc.outputPath) === 'undefined') continue;
                if (doc.outputPath.indexOf('a8m') > 0 || doc.docType == 'componentGroup') continue;

                data.push({ name: doc.name, url: doc.outputPath, docType: doc.docType });
            }

            fs.writeFile(path.join("data", "documentation.json"), JSON.stringify(data), function(err) {
                if (err) return console.log(err);
                return console.log("The file was saved!");
            });
        });
    } catch (x) {
        console.log(x.stack);
        throw x;
    }
});