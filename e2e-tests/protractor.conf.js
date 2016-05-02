exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'tbPager-scen.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/Unosquare.Tubular.WebTest/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
