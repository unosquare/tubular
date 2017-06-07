// Karma configuration

module.exports = (config) => {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: 'src/js',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
          '../../node_modules/jasmine-data_driven_tests/src/all.js',
          '../../bower_components/angular/angular.js',
          '../../bower_components/angular-mocks/angular-mocks.js',
          '../../bower_components/angular-route/angular-route.js',
          '../../bower_components/angular-loader/angular-loader.js',
          '../../bower_components/moment/moment.js',
          '../../bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
          'tubular/tubular-services.js',
          'tubular/tubular-models.js',
          'tubular*/**/*.module.js',
          'tubular/models/**/*.js',
          'tubular/services/**/*.js',
          'tubular/interceptors/**/*.js',
          'tubular/tubular-directives.js',
          'tubular*/**/*tpl.html',
          'tubular/directives/**/*.js',
          'tubular/tubular.js',
          'tubular/filters/**/*.js',
          'tubular*/**/*.spec.js'
        ],

        // list of files to exclude
        exclude: [
           '**/*.min.js',
           '**/*bundle.js',
           '**/*.run.js',
           '**/*.e2e.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'tubular*/**/!(*spec|*bundle).js': ['coverage'],
            'tubular*/**/*tpl.html': ['ng-html2js']
        },

        ngHtml2JsPreprocessor: {
            moduleName: 'tubular.directives',
            cacheIdFromPath: (filepath) => {
                const pieces = filepath.split('/');
                return pieces[pieces.length -1];
            }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage', 'html'],

        htmlReporter: {
            outputDir: 'report/unit', // where to put the reports
            focusOnFailures: true, // reports show failures on start
            namedFiles: true, // name files instead of creating sub-directories
            reportName: 'index',

            // experimental
            preserveDescribeNesting: false, // folded suites stay folded
            foldAll: false // reports start folded (only with preserveDescribeNesting)
        },

        // optionally, configure the reporter
        coverageReporter: {
            type: 'lcov',
            dir: '../../report/coverage',
            subdir: '.'
        },
        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS', 'Firefox'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        failOnEmptyTestSuite: true
    });
};
