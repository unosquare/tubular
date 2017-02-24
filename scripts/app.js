(function (angular) {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', function ($routeProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'assets/intro.html',
                        key: 'Home'
                    }).when('/Basic', {
                        templateUrl: 'assets/home.html',
                        key: 'Tubular Samples',
                        desc: 'A little collection with samples from basic grid to more complex UI.'
                    }).when('/Charts', {
                        templateUrl: 'assets/charts.html',
                        key: 'Tubular Charts Samples',
                        desc: 'Helpful components to create charts with ChartJS or Highcharts.'
                    }).when('/Generator', {
                        templateUrl: 'assets/generator.html',
                        key: 'Tubular Grid Generator'
                    }).when('/FormGenerator', {
                        templateUrl: 'assets/formgenerator.html',
                        key: 'Tubular Form Generator'
                    }).when('/Documentation/:param?', {
                        templateUrl: 'assets/documentation.html',
                        key: 'Tubular Documentation'
                    }).otherwise({
                        redirectTo: '/'
                    });
            }
        ]);

    angular.module('app.controllers', ['tubular.services', 'LocalStorageModule', 'app.generator'])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', '$anchorScroll', '$templateCache', '$http', 'tubularGenerator', 'toastr',
    function ($scope, $location, $anchorScroll, $templateCache, $http, tubularGenerator, toastr) {
        $scope.source = [];

        $scope.tutorial = [

            {
                title: 'Grid with Paginations',
                body: 'Adding a new feature: the pagination. You can move across the pages and change the size.',
                key: 'samplesharp1',
                next: 'sample3'
            },
            {
                title: 'Grid with common features',
                body: 'The grid can be extended to include features like sorting and filtering. ' +
                    'Press Ctrl key to sort by multiple columns.',
                key: 'sample3',
                next: 'sample4'
            },
            {
                title: 'Free-text search',
                body: 'Adding a "searchable" attribute to your columns and you can perform free-text searches.',
                key: 'sample4',
                next: 'sample5'
            },
            {
                title: 'Print and Export to CSV',
                body: 'Easily you can print or export the current view or entire dataset to CSV using client-side only.',
                key: 'sample5',
                next: 'sample7'
            },
            {
                title: 'Inline editors (read-only)',
                body: 'You can add inline editors just defining a Save URL and assigning some controls. ' +
                    'This demo is read-only, but you can get the idea.',
                key: 'sample7',
                next: null
            },
            {
                title: 'Grid with Aggregation results',
                body: 'This sample has more controls in the grid and also two columns has aggregation methods. Customer count and Amount sum. The tbFootSet directive is helpful to show them.',
                key: 'sample8',
                next: null
            }
        ];

        $scope.chartTutorial = [
            {
                title: 'Basic line chart with ChartJS',
                body: 'Easily add a chart using a REST Service with the Tubular C# connector. In this sample we are using a JSON file, because there is not support to server side in this documentation',
                key: 'samplechart1',
                next: 'samplechart2'
            }, {
                title: 'Basic line chart with HighCharts',
                body: 'Easily add a chart using a REST Service with the Tubular C# connector. In this sample we are using a JSON file, because there is not support to server side in this documentation',
                key: 'samplechart2',
                next: null
            }
        ];

        $scope.$on('tbGrid_OnSuccessfulUpdate', function () { toastr.success("Record updated"); });
        $scope.$on('tbGrid_OnRemove', function () { toastr.success("Record removed"); });
        $scope.$on('tbGrid_OnConnectionError', function(error) {
            toastr.error(error.statusText || "Connection error");
        });
        $scope.$on('tbGrid_OnSuccessfulForm', function () { $location.path('/'); });
        $scope.$on('tbGrid_OnSavingNoChanges', function () {
            toastr.warning("Nothing to save");
            $location.path('/');
        });

        $scope.toggleCode = function (tag) {
            if ($scope.source[tag] == null) {
                $scope.source[tag] = $templateCache.get('assets/' + tag + '.html');
            } else {
                $scope.source[tag] = null;
            }
        };

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        };

        $scope.openCode = function (tag) {
            $http.get('generator/index.html').
                success(function (data) {
                    tubularGenerator.exportPluker([
                        { name: 'index.html', content: data },
                        { name: 'README.md', content: tubularGenerator.DefaultReadme },
                        { name: 'app.js', content: tubularGenerator.DefaultJs },
                        { name: 'grid.html', content: $templateCache.get('assets/' + tag + '.html') }
                    ]);
                });
        }
    }
        ])
        .controller('tubularGeneratorCtrl', [
            '$scope', '$http', '$templateCache', 'tubularGenerator', 'localStorageService', 'tubularTemplateService',
            function ($scope, $http, $templateCache, tubularGenerator, localStorageService, tubularTemplateService) {
                // Options
                $scope.enums = tubularTemplateService.enums;

                $scope.templatename = '';
                $scope.basemodel = '';
                $scope.step = 1;
                $scope.dataUrl = '';
                $scope.uiOptions = tubularTemplateService.defaults.gridOptions;
                $scope.formOptions = tubularTemplateService.defaults.formOptions;
                $scope.fieldsSettings = tubularTemplateService.defaults.fieldsSettings;
                $scope.uiOptions.ServiceName = 'local';
                $scope.formOptions.ServiceName = 'local';

                $scope.views = localStorageService.get('generator_views') || [];
                $scope.gridId = ($scope.views.length + 1);

                $scope.generateModel = function () {
                    $scope.templatename = '';
                    $scope.jsonstring = '';

                    if ($scope.basemodel.indexOf('http') === 0) {
                        $scope.dataUrl = $scope.basemodel;

                        $http.get($scope.basemodel).success(function (data) {
                            tubularGenerator.createColumns(data.value, $scope);
                            $scope.uiOptions.ServiceName = 'odata';
                            $scope.formOptions.ServiceName = 'odata';

                            $scope.step++;
                            $scope.formOptions.SaveUrl = $scope.dataUrl;
                        });
                    } else {
                        var model = angular.fromJson($scope.basemodel);

                        tubularGenerator.createColumns(model, $scope);
                        $scope.dataUrl = window.URL.createObjectURL(new Blob([$scope.basemodel], { type: "application/json" }));
                        $scope.step++;
                        $scope.formOptions.SaveUrl = $scope.dataUrl;
                    }
                };

                $scope.runFormTemplate = function () {
                    $scope.gridmodel = tubularGenerator.runFormTemplate($scope);

                    $templateCache.put('tubulartemplate.html', $scope.gridmodel);
                    $scope.templatename = 'tubulartemplate.html';

                    $scope.step++;
                }

                $scope.runGridTemplate = function () {
                    $scope.gridmodel = tubularGenerator.runGridTemplate($scope);

                    $templateCache.put('tubulartemplate.html', $scope.gridmodel);
                    $scope.templatename = 'tubulartemplate.html';

                    $scope.step++;
                };

                $scope.useSample = function () {
                    $http.get('data/generatorsample.json').
                        success(function (data) {
                            $scope.basemodel = angular.toJson(data);
                            $scope.generateModel();
                        });
                };

                $scope.useServerSample = function () {
                    $scope.basemodel = "http://services.odata.org/V3/Northwind/Northwind.svc/Orders";
                    $scope.generateModel();
                };

                $scope.revert = function () {
                    $scope.templatename = '';
                    $scope.step--;
                };

                $scope.cleanPlunker = function (filename) {
                    $scope.clearViews();
                    $scope.plunker(filename);
                }

                $scope.plunker = function (filename) {
                    $http.get('generator/index.html').
                        success(function (data) {
                            var appJs = tubularGenerator.DefaultJs;
                            var files = [
                                { name: 'index.html', content: data },
                                { name: 'README.md', content: tubularGenerator.DefaultReadme }
                            ];

                            if ($scope.views.length == 0) {
                                var tempUrl = $scope.dataUrl;

                                if (angular.isDefined($scope.jsonstring) && $scope.jsonstring !== '') {
                                    tempUrl = 'data.json';
                                    files.push({ name: tempUrl, content: $scope.jsonstring });
                                }

                                files.push({
                                    name: filename + '.html',
                                    content: $scope.gridmodel.replace(/server-url="(.[^"]+)"/g, 'server-url="' + tempUrl + '"')
                                });

                                appJs = appJs.replace(/grid.html/g, filename + '.html');
                            } else {
                                for (var prop in $scope.views) {
                                    var view = $scope.views[prop];
                                    files.push(view);

                                    if (view.indexOf('.html') > 0) {
                                        appJs = appJs.replace(/grid.html/g, view);
                                    }
                                }
                            }

                            // TODO: Generate route for all
                            files.push({ name: 'app.js', content: appJs });

                            tubularGenerator.exportPluker(files);
                        });
                };

                $scope.save = function (filename) {
                    var tempUrl = $scope.dataUrl;

                    if (angular.isDefined($scope.jsonstring) && $scope.jsonstring !== '') {
                        tempUrl = 'data' + ($scope.gridId) + '.json';
                        $scope.views.push({ name: tempUrl, content: $scope.jsonstring });
                    }

                    $scope.views.push({
                        name: filename + ($scope.gridId++) + '.html',
                        content: $scope.gridmodel.replace(/server-url="(.[^"]+)"/g, 'server-url="' + tempUrl + '"')
                    });

                    localStorageService.set('generator_views', $scope.views);
                    $scope.step = 1;
                    $scope.basemodel = '';
                };

                $scope.clearViews = function () {
                    localStorageService.remove('generator_views');
                    $scope.views = [];
                    $scope.gridId = ($scope.views.length + 1);
                }

                $scope.removeColumn = function (row) {
                    var index = $scope.columns.indexOf(row);
                    if (index > -1) {
                        $scope.columns.splice(index, 1);
                    }
                };
            }
        ])
        .controller('tubularDocCtrl',
        [
            '$scope', '$http', '$anchorScroll', '$location', '$routeParams', '$templateCache',
            function ($scope, $http, $anchorScroll, $location, $routeParams, $templateCache) {
                $scope.internalLink = function (url) {
                    var find = $scope.items.filter(function (el) { return el.name === url; });

                    if (find.length > 0) {
                        $scope.open(find[0].url);
                    }
                };

                $scope.getHtml = function (url) {
                    var data = $templateCache.get(url);
                    return data;
                };

                $scope.open = function (url) {
                    if (url.indexOf('http') === 0) {
                        document.location = url;
                        return;
                    }

                    $scope.doc = url.indexOf('tutorial') === 0 ? url : 'docs/build/' + url;
                };

                $http.get('data/documentation.json').then(function (data) {
                    $scope.items = data.data;

                    // Load Angular Components API
                    $scope.items.push({ name: '$http', url: 'https://docs.angularjs.org/api/ng/service/$http', docType: 'external' });
                    $scope.items.push({ name: '$q', url: 'https://docs.angularjs.org/api/ng/service/$q', docType: 'external' });
                    $scope.items.push({ name: '$compile', url: 'https://docs.angularjs.org/api/ng/service/$compile', docType: 'external' });
                    $scope.items.push({ name: '$timeout', url: 'https://docs.angularjs.org/api/ng/service/$timeout', docType: 'external' });
                    $scope.items.push({ name: '$templateCache', url: 'https://docs.angularjs.org/api/ng/service/$templateCache', docType: 'external' });
                    $scope.items.push({ name: '$cacheFactory', url: 'https://docs.angularjs.org/api/ng/service/$cacheFactory', docType: 'external' });
                    $scope.items.push({ name: '$rootScope', url: 'https://docs.angularjs.org/api/ng/service/$rootScope', docType: 'external' });
                    $scope.items.push({ name: '$modal', url: 'https://angular-ui.github.io/bootstrap/#/modal', docType: 'external' });
                    $scope.items.push({ name: '$location', url: 'https://docs.angularjs.org/api/ng/service/$location', docType: 'external' });
                    $scope.items.push({ name: '$filter', url: 'https://docs.angularjs.org/api/ng/service/$filter', docType: 'external' });
                    $scope.items.push({ name: 'localStorageService', url: 'https://github.com/grevory/angular-local-storage', docType: 'external' });

                    // Load internal doc
                    $scope.items.push({ name: 'StartGrid', url: 'tutorial/grid.html', docType: 'external' });
                    $scope.items.push({ name: 'StartForm', url: 'tutorial/form.html', docType: 'external' });
                    $scope.items.push({ name: 'StartChart', url: 'tutorial/chart.html', docType: 'external' });
                    $scope.items.push({ name: 'WebApi', url: 'tutorial/webapi.html', docType: 'external' });
                    $scope.items.push({ name: 'StartReporting', url: 'tutorial/reporting.html', docType: 'external' });
                    $scope.items.push({ name: 'ModalGrid', url: 'tutorial/modal.html', docType: 'external' });
                    $scope.items.push({ name: 'InlineEditor', url: 'tutorial/inline.html', docType: 'external' });

                    if (angular.isDefined($routeParams.param)) {
                        $scope.internalLink($routeParams.param);
                    }
                });
            }
        ]).controller('infoCtrl', [
            '$route', '$routeParams', '$location', function ($route, $routeParams, $location) {
                this.$route = $route;
                this.$location = $location;
                this.$routeParams = $routeParams;
            }
        ])
        .config([
            '$sceDelegateProvider', function ($sceDelegateProvider) {
                $sceDelegateProvider.resourceUrlWhitelist(['self', 'blob:**', 'http://services.odata.org/**']);
            }
        ]);

    angular.module('app', [
        'hljs',
        'toastr',
        'tubular',
        'tubular-chart.directives',
        'tubular-hchart.directives',
        'app.routes',
        'app.controllers'
    ]);

    ZeroClipboard.config({ swfPath: "//cdn.jsdelivr.net/zeroclipboard/2.2.0/ZeroClipboard.swf" });
})(window.angular);