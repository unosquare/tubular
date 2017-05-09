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

    onPrepare: () => {
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
            .run(function ($httpBackend) {
                $httpBackend.whenGET(/mockapi\/orders\/1?.*/g)
                    .respond({"CreatedUser":null,"OrderID":1,"CustomerName":"Unosquare","ShipperCity":"Guadalajara, JAL, Mexico","IsShipped":true,"Amount":300.00,"ShippedDate":"2017-02-01T12:00:00","CreationDate":"2015-12-30T00:00:00","CreatedUserId":"geoperez","WarehouseID":1,"OrderType":15,"ModificationDate":null,"Details":[]});
                $httpBackend.whenPOST(/mockapi\/saveOrder.*/g)
                    .respond({ Status: "OK"});
                $httpBackend.whenPUT(/mockapi\/saveOrder.*/g)
                    .respond({ Status: "OK"});
                $httpBackend.whenGET(/mockapi\/cities?.*/g)
                    .respond(["Guadalajara, JAL, Mexico","Leon, GTO, Mexico","Los Angeles, CA, USA","Portland, OR, USA"]);
                
                $httpBackend.whenPOST(/mockapi\/columntest?.*/)
                    .respond((method, url, data) => {
                        var payload = {};
                        var requestObj = angular.fromJson(data);

                        if (requestObj.Columns[0].SortDirection == 'Descending') {
                            payload = {"Counter":0,"Payload":[[500,"Vesta","2016-11-03T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[499,"Oxxo","2016-11-12T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[498,"Unosquare LLC","2016-11-09T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[497,"Microsoft","2016-11-04T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[496,"Vesta","2016-11-06T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[495,"Oxxo","2016-11-11T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[494,"Vesta","2016-11-04T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[493,"Vesta","2016-11-12T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[492,"Oxxo","2016-11-10T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[491,"Unosquare LLC","2016-11-03T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[490,"Vesta","2016-11-06T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[489,"Unosquare LLC","2016-11-11T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[488,"Microsoft","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[487,"Unosquare LLC","2016-11-06T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[486,"Oxxo","2016-11-11T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[485,"Advanced Technology Systems","2016-11-05T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[484,"Advanced Technology Systems","2016-11-04T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[483,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[482,"Super La Playa","2016-11-07T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[481,"Oxxo","2015-02-24T12:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"]],"TotalRecordCount":500,"FilteredRecordCount":500,"TotalPages":25,"CurrentPage":1,"AggregationPayload":{}};
                        } 
                        else if (requestObj.Columns[1].SortDirection == 'Ascending') {
                            payload = {"Counter":0,"Payload":[[14,"Advanced Technology Systems","2016-11-10T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[29,"Advanced Technology Systems","2016-11-11T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[32,"Advanced Technology Systems","2016-11-05T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[38,"Advanced Technology Systems","2016-11-10T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[42,"Advanced Technology Systems","2016-11-10T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[46,"Advanced Technology Systems","2016-11-08T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[58,"Advanced Technology Systems","2016-11-05T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[69,"Advanced Technology Systems","2016-11-06T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[77,"Advanced Technology Systems","2016-11-04T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[79,"Advanced Technology Systems","2016-11-07T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[80,"Advanced Technology Systems","2016-11-03T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[94,"Advanced Technology Systems","2016-11-03T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[96,"Advanced Technology Systems","2016-11-10T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[111,"Advanced Technology Systems","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[113,"Advanced Technology Systems","2016-11-04T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[123,"Advanced Technology Systems","2016-11-03T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[124,"Advanced Technology Systems","2016-11-05T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[131,"Advanced Technology Systems","2016-11-07T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[135,"Advanced Technology Systems","2016-11-11T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[165,"Advanced Technology Systems","2016-11-03T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"]],"TotalRecordCount":500,"FilteredRecordCount":500,"TotalPages":25,"CurrentPage":1,"AggregationPayload":{}};
                        }
                        else if (requestObj.Columns[1].SortDirection == 'Descending') {
                            payload = {"Counter":0,"Payload":[[12,"Vesta","2016-11-10T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[11,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[9,"Vesta","2016-11-08T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[23,"Vesta","2016-11-08T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[28,"Vesta","2016-11-09T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[49,"Vesta","2016-11-10T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[51,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[55,"Vesta","2016-11-03T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[63,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[65,"Vesta","2016-11-07T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[85,"Vesta","2016-11-07T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[86,"Vesta","2016-11-06T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[87,"Vesta","2016-11-11T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[93,"Vesta","2016-11-07T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[95,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[100,"Vesta","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[107,"Vesta","2016-11-04T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[108,"Vesta","2016-11-11T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[109,"Vesta","2016-11-11T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[112,"Vesta","2016-11-09T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"]],"TotalRecordCount":500,"FilteredRecordCount":500,"TotalPages":25,"CurrentPage":1,"AggregationPayload":{}};
                        }
                        else if (requestObj.Columns[2].SortDirection == 'Ascending') {
                            payload = {"Counter":0,"Payload":[[481,"Oxxo","2015-02-24T12:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[4,"Unosquare LLC","2016-02-02T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[2,"Microsoft","2016-03-05T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[55,"Vesta","2016-11-03T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[57,"Unosquare LLC","2016-11-03T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[60,"Super La Playa","2016-11-03T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[66,"Unosquare LLC","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[80,"Advanced Technology Systems","2016-11-03T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[94,"Advanced Technology Systems","2016-11-03T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[99,"Unosquare LLC","2016-11-03T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[100,"Vesta","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[110,"Microsoft","2016-11-03T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[111,"Advanced Technology Systems","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[114,"Oxxo","2016-11-03T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[117,"Oxxo","2016-11-03T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[123,"Advanced Technology Systems","2016-11-03T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[125,"Oxxo","2016-11-03T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[128,"Microsoft","2016-11-03T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[133,"Oxxo","2016-11-03T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[136,"Super La Playa","2016-11-03T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"]],"TotalRecordCount":500,"FilteredRecordCount":500,"TotalPages":25,"CurrentPage":1,"AggregationPayload":{}};
                        }
                        else if (requestObj.Columns[2].SortDirection == 'Descending') {
                            payload = {"Counter":0,"Payload":[[1,"Microsoft","2017-02-01T23:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[3,"Unosquare LLC","2016-12-18T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[11,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[7,"Microsoft","2016-11-12T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[21,"Unosquare LLC","2016-11-12T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[31,"Super La Playa","2016-11-12T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[36,"Super La Playa","2016-11-12T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[45,"Unosquare LLC","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[48,"Unosquare LLC","2016-11-12T00:00:00","2015-12-30T00:00:00","Leon, GTO, Mexico"],[51,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[59,"Microsoft","2016-11-12T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[63,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[72,"Microsoft","2016-11-12T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[95,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[127,"Microsoft","2016-11-12T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[130,"Super La Playa","2016-11-12T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[137,"Unosquare LLC","2016-11-12T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[141,"Vesta","2016-11-12T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[144,"Oxxo","2016-11-12T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[145,"Super La Playa","2016-11-12T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"]],"TotalRecordCount":500,"FilteredRecordCount":500,"TotalPages":25,"CurrentPage":1,"AggregationPayload":{}};
                        }
                        else {
                            payload = {"Counter":0,"Payload":[[1,"Microsoft","2017-02-01T23:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[2,"Microsoft","2016-03-05T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[3,"Unosquare LLC","2016-12-18T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[4,"Unosquare LLC","2016-02-02T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[5,"Microsoft","2016-11-11T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[6,"Unosquare LLC","2016-11-07T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[7,"Microsoft","2016-11-12T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[8,"Unosquare LLC","2016-11-09T00:00:00","2016-01-01T00:00:00","Portland, OR, USA"],[9,"Vesta","2016-11-08T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[10,"Unosquare LLC","2016-11-06T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[11,"Vesta","2016-11-12T00:00:00","2015-12-30T00:00:00","Los Angeles, CA, USA"],[12,"Vesta","2016-11-10T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[13,"Super La Playa","2016-11-05T00:00:00","2015-12-30T00:00:00","Portland, OR, USA"],[14,"Advanced Technology Systems","2016-11-10T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[15,"Unosquare LLC","2016-11-09T00:00:00","2016-01-01T00:00:00","Leon, GTO, Mexico"],[16,"Super La Playa","2016-11-09T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"],[17,"Microsoft","2016-11-08T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[18,"Microsoft","2016-11-04T00:00:00","2016-01-01T00:00:00","Guadalajara, JAL, Mexico"],[19,"Oxxo","2016-11-11T00:00:00","2016-01-01T00:00:00","Los Angeles, CA, USA"],[20,"Microsoft","2016-11-09T00:00:00","2015-12-30T00:00:00","Guadalajara, JAL, Mexico"]],"TotalRecordCount":500,"FilteredRecordCount":500,"TotalPages":25,"CurrentPage":1,"AggregationPayload":{}};
                        }

                        return [200, payload, {}];
                    });
                
                $httpBackend.whenGET(/.*tubular.azurewebsites.net.*/).passThrough();
                $httpBackend.whenPOST(/.*tubular.azurewebsites.net.*/).passThrough();
                $httpBackend.whenPUT(/.*tubular.azurewebsites.net.*/).passThrough();
                
                $httpBackend.whenGET(/^\/test\//).passThrough();
            });
      });
   }
};
