exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'tbPager-Scen.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/tbTestApp/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
