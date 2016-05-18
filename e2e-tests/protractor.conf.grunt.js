exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'http://localhost:9000/e2e-tests/tbGridPagerInfo-scen.js'
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
