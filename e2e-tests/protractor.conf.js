exports.config = {
    sauceUser: 'geoperez',
    sauceKey: 'dd986cd7-696b-433a-941e-3820d83aa09a',

    allScriptsTimeout: 11000,

    specs: [
      'tbGridPager-scen.js',
      'tbPageSizeSelector-scen.js',
      'tbGridPagerInfo-scen.js',
      'tbColumn-scen.js',
      'tbFilters-scen.js'
    ],

    capabilities: {
        'browserName': 'chrome'
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
