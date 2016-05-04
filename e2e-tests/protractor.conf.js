exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'tbColumn-scen.js',
    'tbGridPager-scen.js',
    'tbPageSizeSelector-scen.js',
    'tbGridPagerInfo-scen.js'
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
