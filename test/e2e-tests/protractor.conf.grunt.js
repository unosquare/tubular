exports.config = {
    allScriptsTimeout: 11000000,

    specs: [
        './test/e2e-tests/*.js'
    ],

    capabilities: {
        'browserName': 'firefox'
    },

    framework: 'jasmine',

    jasmineNodeOpts: { defaultTimeoutInterval: 3000000 }
};
