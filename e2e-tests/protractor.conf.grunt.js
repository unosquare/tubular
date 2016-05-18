exports.config = {
    allScriptsTimeout: 11000000,

    specs: [
        'e2e-tests/tbGridPagerInfo-scen.js'
    ],

    capabilities: {
        'browserName': 'firefox'
    },

    framework: 'jasmine',

    jasmineNodeOpts: {
        // High timeout interval for debugging purposes:
        defaultTimeoutInterval: 3000000

        // Uncomment:
        // defaultTimeoutInterval: 3000
    }
};
