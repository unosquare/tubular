exports.config = {
    allScriptsTimeout: 11000000,
    specs: [
        './test/integration/tests/*.js'
    ],

    directConnect: true,

    // multiCapabilities: [{
    //     'browserName': 'firefox'
    // }, {
    //     'browserName': 'chrome'
    // }],
    capabilities: {
        'browserName': 'chrome'
    },

    framework: 'jasmine',

    suites: {
        sorting: 'tests/e2e/homepage/**/*spec.js',
        // search: ['tests/e2e/contact_search/**/*Spec.js',
        //     'tests/e2e/venue_search/**/*Spec.js']
    },


    jasmineNodeOpts: {
        // High timeout interval for debugging purposes:
        defaultTimeoutInterval: 3000000

        // Uncomment:
        // defaultTimeoutInterval: 3000
    }
};