exports.config = {
    allScriptsTimeout: 11000000,
    specs: [
        './test/integration/tests/*.js'
    ],

    directConnect: true,
    
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