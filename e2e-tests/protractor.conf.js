exports.config = {
    allScriptsTimeout: 11000,

    specs: [
    //   'tbGridPager-scen.js',
    //   'tbPageSizeSelector-scen.js',
    //   'tbGridPagerInfo-scen.js',
    //   'tbColumn-scen.js',
      'tbFilters-scen.js'
    ],

    capabilities: {
        'browserName': 'firefox'
    },

    baseUrl: 'http://localhost:8000/Unosquare.Tubular.WebTest/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        // High timeout interval for debugging purposes:
        defaultTimeoutInterval: 3000000

        // Uncomment:
        // defaultTimeoutInterval: 3000
    }
};