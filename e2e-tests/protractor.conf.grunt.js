exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        // 'e2e-tests/*.js'
       'e2e-tests/tbFilters-scen.js',
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    framework: 'jasmine',

    jasmineNodeOpts: {
        // High timeout interval for debugging purposes:
        defaultTimeoutInterval: 3000000

        // Uncomment:
        // defaultTimeoutInterval: 3000
    }
};
