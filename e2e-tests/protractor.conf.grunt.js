exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'tbGridPagerInfo-scen.js'
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
