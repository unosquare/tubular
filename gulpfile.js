var gulp = require('gulp');
var Dgeni = require('dgeni');
var fs = require('fs');
var path = require('path');

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

gulp.task('dgeni', function() {
    try {
        var dgeni = new Dgeni([require('./docs/dgeni-conf')]);
        return dgeni.generate().then(function(docs) {
            var data = [];
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];

                if (typeof (doc.name) === 'undefined' || typeof (doc.outputPath) === 'undefined') continue;
                if (doc.outputPath.indexOf('a8m') > 0 || doc.docType == 'componentGroup'  || doc.docType == 'ngConstant') continue;

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

gulp.task('reports', function() {
    var baseCss = '<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/latest/lumen/bootstrap.min.css" />';
    var output = '';

    getDirectories('reports').reverse().forEach(function(dir) {
        output += "<li><a href='https://unosquare.github.io/tubular/reports/" + dir + "'>" + dir + "</a></li>";

        var subOutput = '';
        getDirectories('reports/' + dir).forEach(function(subDir) {
            subOutput += "<li><a href='https://unosquare.github.io/tubular/reports/" + dir + "/" + subDir + "'>" + subDir + "</a></li>";
        });

        fs.writeFile('reports/' + dir + '/index.html', baseCss + "<h1>Travis Build #" + dir +" Reports</h1><ul>" + subOutput + "</ul>");
    }, this);

    fs.writeFile('reports/index.html', baseCss + "<h1>Travis Builds Reports</h1><ul>" + output + "</ul>");
});
