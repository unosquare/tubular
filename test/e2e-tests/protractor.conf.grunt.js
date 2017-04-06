var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');

exports.config = {
    allScriptsTimeout: 11000000,

    specs: [ './test/e2e-tests/*.js' ],

    capabilities: {
        'browserName': 'firefox'
    },
    
    framework: 'jasmine',

    directConnect : true,
    jasmineNodeOpts: { defaultTimeoutInterval: 3000000 },

    onPrepare: function() {
      jasmine.getEnv().addReporter(
        new Jasmine2HtmlReporter({
            savePath: './report/e2e',
            cleanDestination: false,
            consolidate: true,
            consolidateAll: true,
            showPassed: false,
            takeScreenshotsOnlyOnFailures: true,
            fileName: 'index.html'
        })
      );

      browser.addMockModule('httpMocker', function() {
        angular.module('httpMocker', ['ngMockE2E'])
            .run(function($httpBackend) {
                $httpBackend.whenGET(/mockapi\/orders\/1?.*/g)
                    .respond({"CreatedUser":null,"OrderID":1,"CustomerName":"Unosquare","ShipperCity":"Guadalajara, JAL, Mexico","IsShipped":true,"Amount":300.00,"ShippedDate":"2017-02-01T12:00:00","CreationDate":"2015-12-30T00:00:00","CreatedUserId":"geoperez","WarehouseID":1,"OrderType":15,"ModificationDate":null,"Details":[]});
                $httpBackend.whenPOST(/mockapi\/saveOrder.*/g)
                    .respond({ Status: "OK"});
                $httpBackend.whenPUT(/mockapi\/saveOrder.*/g)
                    .respond({ Status: "OK"});
                $httpBackend.whenGET(/mockapi\/cities?.*/g)
                    .respond(["Guadalajara, JAL, Mexico","Leon, GTO, Mexico","Los Angeles, CA, USA","Portland, OR, USA"]);
                
                $httpBackend.whenGET(/.*tubular.azurewebsites.net.*/).passThrough();
                $httpBackend.whenPOST(/.*tubular.azurewebsites.net.*/).passThrough();
                $httpBackend.whenPUT(/.*tubular.azurewebsites.net.*/).passThrough();
                
                $httpBackend.whenGET(/^\/test\//).passThrough();
            });
      });
   }
};
