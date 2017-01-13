exports.config = {
    allScriptsTimeout: 11000000,

    specs: [
        './test/e2e-tests/tbGridPager-scen.js',
        './test/e2e-tests/tbGridPagerInfo-scen.js',
        './test/e2e-tests/tbPageSizeSelector-scen.js'
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