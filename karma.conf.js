// Karma configuration

module.exports = (config) => {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: 'src/Unosquare.Tubular',

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
          '../../bower_components/highchart-ng/dist/highcharts-ng.js',
          '../../bower_components/chart.js/dist/Chart.js',
          '../../bower_components/angular-chart.js/dist/angular-chart.js',
          'Javascript/tubular/tubular-models.js',
          'Javascript/tubular/tubular-services.js',
          'Javascript/tubular*/**/*.module.js',
          'Javascript/tubular/services/**/*.js',
          'Javascript/tubular/interceptors/**/*.js',
          'Javascript/tubular/tubular-directives.js',
          'Javascript/tubular*/**/*tpl.html',
          'Javascript/tubular/directives/**/*.js',
          'Javascript/tubular/tubular.js',
          'Javascript/tubular-chart/**/*.js',
          'Javascript/tubular*/**/*.spec.js'
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
            'Javascript/tubular*/**/!(*spec|*bundle).js': ['coverage'],
            'Javascript/tubular*/**/*tpl.html': ['ng-html2js']
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
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        failOnEmptyTestSuite: true
    });
};
