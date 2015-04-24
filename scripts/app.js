(function() {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', function($routeProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'assets/intro.html',
                    }).when('/Basic', {
                        templateUrl: 'assets/home.html',
                    }).when('/WebApi', {
                        templateUrl: 'assets/webapi.html',
                    }).when('/Generator', {
                        templateUrl: 'assets/generator.html',
                    }).when('/FormGenerator', {
                        templateUrl: 'assets/formgenerator.html',
                    }).otherwise({
                        redirectTo: '/'
                    });

                //$locationProvider.html5Mode(true);
            }
        ]);

    angular.module('app.controllers', ['tubular.services', 'LocalStorageModule', 'app.generator'])
        .controller('tubularSampleCtrl', [
            '$scope', '$location', '$anchorScroll', '$templateCache', 'tubularOData',
            function($scope, $location, $anchorScroll, $templateCache, tubularOData) {
                $scope.odata = tubularOData;
                $scope.source = [];
                $scope.tutorial = [
                    {
                        title: 'Basic Layout with JSON datasource',
                        body: 'First grid shows a basic layout, without any additional feature or special column. Just a plain grid using a JSON datasource.',
                        key: 'sample',
                        next: 'sample2'
                    },
                    {
                        title: 'Grid with Paginations using OData',
                        body: 'Adding a new feature: the pagination. This demo is using an OData datasource and you can move across the pages and change the size.',
                        key: 'sample2',
                        next: 'sample3'
                    },
                    {
                        title: 'Grid with common features using OData',
                        body: 'The grid can be extended to include features like sorting and filtering. Press Ctrl key to sort by multiple columns.',
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
                        title: 'Grouping',
                        body: 'You can group by one column (we hope improve this later) and also select the columns to show.',
                        key: 'sample5',
                        next: 'sample6'
                    },
                    {
                        title: 'Inline editors (read-only)',
                        body: 'You can add inline editors just defining a Save URL and assigning some controls. This demo is read-only, but you can get the idea.',
                        key: 'sample6',
                        next: null
                    }
                ];

                $scope.$on('tbGrid_OnSuccessfulUpdate', function(data) { toastr.success("Record updated"); });
                $scope.$on('tbGrid_OnRemove', function(data) { toastr.success("Record removed"); });
                $scope.$on('tbGrid_OnConnectionError', function(error) { toastr.error(error.statusText || "Connection error"); });
                $scope.$on('tbGrid_OnSuccessfulForm', function(data) { $location.path('/'); });
                $scope.$on('tbGrid_OnSavingNoChanges', function(model) {
                    toastr.warning("Nothing to save");
                    $location.path('/');
                });

                $scope.toggleCode = function(tag) {
                    if ($scope.source[tag] == null) {
                        $scope.source[tag] = $templateCache.get('assets/' + tag + '.html')[1];
                    } else {
                        $scope.source[tag] = null;
                    }
                };

                $scope.scrollTo = function(id) {
                    $location.hash(id);
                    $anchorScroll();
                };
            }
        ]).controller('tubularGeneratorCtrl', [
            '$scope', '$http', '$templateCache', 'tubularGenerator', 'localStorageService',
        function ($scope, $http, $templateCache, tubularGenerator, localStorageService) {
            // Options
            $scope.dataTypes = ['numeric', 'date', 'boolean', 'string'];
            $scope.editorTypes = ['tbSimpleEditor', 'tbNumericEditor', 'tbDateTimeEditor', 'tbDateEditor',
                'tbDropdownEditor', 'tbTypeaheadEditor', 'tbHiddenField', 'tbCheckboxField', 'tbTextArea'];
            $scope.gridMode = ['Read-Only', 'Inline', 'Popup'];
            $scope.httpMethods = ['POST', 'PUT'];

            $scope.templatename = '';
            $scope.basemodel = '';
            $scope.step = 1;
            $scope.dataUrl = '';
            $scope.isOData = false;
            $scope.uiOptions = {
                Pager: true,
                FreeTextSearch: true,
                PageSizeSelector: true,
                PagerInfo: true,
                ExportCsv: true,
                Mode: 'Read-Only'
            };
            $scope.formOptions = {
                SaveButton: true,
                CancelButton: true,
                IsNew: true,
                SaveUrl: '',
                SaveMethod: 'POST'
            };
            $scope.views = localStorageService.get('generator_views') || [];
            $scope.gridId = ($scope.views.length + 1);

            $scope.generateModel = function() {
                $scope.templatename = '';
                $scope.jsonstring = '';

                if ($scope.basemodel.indexOf('http') === 0) {
                    $scope.dataUrl = $scope.basemodel;

                    $http.get($scope.basemodel).success(function(data) {
                        tubularGenerator.createColumns(data.value, $scope);
                        $scope.isOData = true;
                        $scope.step++;
                        $scope.formOptions.SaveUrl = $scope.dataUrl;
                    });
                } else {
                    var model = angular.fromJson($scope.basemodel);
                    tubularGenerator.createColumns(model, $scope);

                    $scope.jsonstring = JSON.stringify({
                        Counter: 0,
                        Payload: model,
                        TotalRecordCount: model.length,
                        FilteredRecordCount: model.length,
                        TotalPages: 1,
                        CurrentPage: 1
                    }, undefined, 2);

                    $scope.dataUrl = window.URL.createObjectURL(new Blob([$scope.jsonstring], { type: "application/json" }));
                    $scope.step++;
                    $scope.formOptions.SaveUrl = $scope.dataUrl;
                }
            };

            $scope.runFormTemplate = function() {
                $scope.gridmodel = tubularGenerator.runFormTemplate($scope);

                $templateCache.put('tubulartemplate.html', $scope.gridmodel);
                $scope.templatename = 'tubulartemplate.html';

                $scope.step++;
            }

            $scope.runGridTemplate = function() {
                $scope.gridmodel = tubularGenerator.runGridTemplate($scope);

                $templateCache.put('tubulartemplate.html', $scope.gridmodel);
                $scope.templatename = 'tubulartemplate.html';

                $scope.step++;
            };

            $scope.useSample = function() {
                $http.get('data/generatorsample.json').
                    success(function(data) {
                        $scope.basemodel = angular.toJson(data);
                        $scope.generateModel();
                    });
            };

            $scope.useServerSample = function() {
                $scope.basemodel = "http://services.odata.org/V3/Northwind/Northwind.svc/Orders";
                $scope.generateModel();
            };

            $scope.revert = function () {
                $scope.templatename = '';
                $scope.step--;
            };

            $scope.cleanPlunker = function(filename) {
                $scope.clearViews();
                $scope.plunker(filename);
            }

            $scope.plunker = function(filename) {
                $http.get('generator/index.html').
                    success(function(data) {
                        var appJs = "angular.module('app', ['ngRoute','ngCookies','tubular.directives']).config(['$routeProvider', function($routeProvider) {$routeProvider.when('/', {templateUrl: 'grid.html',}).otherwise({redirectTo: '/'}); } ]);";
                        var files = [
                            { name: 'index.html', content: data },
                            { name: 'README.md', content: '#Tubular WebApp\r\nYou can add your content now. Create more views @ [Tubular](http://unosquare.github.io/tubular)' }
                        ];

                        if ($scope.views.length == 0) {
                            var tempUrl = $scope.dataUrl;

                            if (angular.isDefined($scope.jsonstring) && $scope.jsonstring !== '') {
                                tempUrl = 'data.json';
                                files.push({ name: tempUrl, content: $scope.jsonstring });
                            }

                            files.push({ name: filename + '.html', content: $scope.gridmodel.replace(/server-url="(.[^"]+)"/g, 'server-url="' + tempUrl + '"') });
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

            $scope.save = function(filename) {
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

            $scope.clearViews = function() {
                localStorageService.remove('generator_views');
                $scope.views = [];
                $scope.gridId = ($scope.views.length + 1);
            }

            $scope.removeColumn = function(row) {
                var index = $scope.columns.indexOf(row);
                if (index > -1) {
                    $scope.columns.splice(index, 1);
                }
            };
        }
    ]);

    angular.module('app', [
        'hljs',
        'tubular.directives',
        'app.routes',
        'app.controllers'
    ]);
})();