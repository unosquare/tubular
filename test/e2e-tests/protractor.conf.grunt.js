var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');

exports.config = {
    allScriptsTimeout: 11000000,

    specs: [ './test/e2e-tests/*.js' ],

    capabilities: { 'browserName': 'firefox' },

    framework: 'jasmine',

    directConnect : true,
    jasmineNodeOpts: { defaultTimeoutInterval: 3000000 },

    onPrepare: function() {
      jasmine.getEnv().addReporter(
        new Jasmine2HtmlReporter({
            savePath: './report',
            cleanDestination: false,
            consolidate: true,
            consolidateAll: true,
            showPassed: false,
            takeScreenshotsOnlyOnFailures: true
        })
      );
   }
};
