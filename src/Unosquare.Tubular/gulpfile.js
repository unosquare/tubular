/// <binding BeforeBuild='min' ProjectOpened='watch' />
'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    del = require('del'),
    bundleconfig = require('./bundleconfig.json');

require('gulp-grunt')(gulp, {
    base: require('path').join(__dirname, '../..')
});

var regex = {
    css: /\.css$/,
    js: /\.js$/
};

gulp.task('min', ['min:js', 'min:css']);

gulp.task('bundle:js', function () {
    var tasks = getBundles(regex.js).map(function (bundle) {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(concat(bundle.outputFileName))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('bundle:css', function () {
    var tasks = getBundles(regex.css).map(function (bundle) {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(concat(bundle.outputFileName))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('min:js', ['bundle:js'], function () {
    var tasks = getBundles(regex.js).map(function (bundle) {
        return gulp.src(bundle.outputFileName, { base: '.' })
            .pipe(uglify())
            .pipe(rename(bundle.outputFileName.replace('.js', '.min.js')))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('min:css', ['bundle:css'], function () {
    var tasks = getBundles(regex.css).map(function (bundle) {
        return gulp.src(bundle.outputFileName, { base: '.' })
            .pipe(cssmin())
            .pipe(rename(bundle.outputFileName.replace('.css', '.min.css')))
            .pipe(gulp.dest('.'));
    });
    return merge(tasks);
});

gulp.task('clean', function () {
    var files = bundleconfig.map(function (bundle) {
        return bundle.outputFileName;
    });

    return del(files);
});

gulp.task('watch', function () {
    getBundles(regex.js).forEach(function (bundle) {
        gulp.watch(bundle.inputFiles, ['min:js']);
    });

    getBundles(regex.css).forEach(function (bundle) {
        gulp.watch(bundle.inputFiles, ['min:css']);
    });
});

gulp.task('html2js', ['grunt-html2js:main']);

function getBundles(regexPattern) {
    return bundleconfig.filter(function (bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}