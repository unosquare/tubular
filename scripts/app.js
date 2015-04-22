(function() {
    'use strict';

    angular.module('app.routes', ['ngRoute'])
        .config([
            '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'assets/intro.html',
                    }).when('/Basic', {
                        templateUrl: 'assets/home.html',
                    }).when('/WebApi', {
                        templateUrl: 'assets/webapi.html',
                    }).when('/Generator', {
                        templateUrl: 'assets/generator.html',
                    }).otherwise({
                        redirectTo: '/'
                    });

                //$locationProvider.html5Mode(true);
            }
        ]);

    angular.module('app.controllers', ['tubular.services'])
        // This Factory and the pluker button is based on Angular Documentation
        .factory('formPostData', ['$document', function ($document) {
        return function (url, newWindow, fields) {
            /**
             * If the form posts to target="_blank", pop-up blockers can cause it not to work.
             * If a user choses to bypass pop-up blocker one time and click the link, they will arrive at
             * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
             * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
             * newWindow param allows for this possibility.
             */
            var target = newWindow ? '_blank' : '_self';
            var form = angular.element('<form style="display: none;" method="post" action="' + url + '" target="' + target + '"></form>');
            angular.forEach(fields, function (value, name) {
                var input = angular.element('<input type="hidden" name="' + name + '">');
                input.attr('value', value);
                form.append(input);
            });
            $document.find('body').append(form);
            form[0].submit();
            form.remove();
        };
    }]) .controller('tubularSampleCtrl', [
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
            '$scope', '$http', '$templateCache', 'formPostData', function($scope, $http, $templateCache, formPostData) {
            $scope.templatename = '';
            $scope.basemodel = '';
            $scope.step = 1;
            $scope.dataTypes = ['numeric', 'date', 'boolean', 'string'];

            $scope.generate = function() {
                $scope.templatename = '';

                var model = angular.fromJson($scope.basemodel);

                if (angular.isArray(model) && model.length > 0) {
                    $scope.jsonmodel = model[0];
                } else {
                    $scope.jsonmodel = model;
                }

                $scope.columns = [];

                for (var prop in $scope.jsonmodel) {
                    if ($scope.jsonmodel.hasOwnProperty(prop)) {
                        var value = $scope.jsonmodel[prop];
                        if (angular.isNumber(value) || parseFloat(value).toString() == value) {
                            $scope.columns.push({ Name: prop, DataType: 'numeric', Template: '{{row.' + prop + '}}' });
                        } else if (angular.isDate(value) || isNaN((new Date(value)).getTime()) == false) {
                            $scope.columns.push({ Name: prop, DataType: 'date', Template: '{{row.' + prop + ' | date}}' });
                        } else if (value.toLowerCase() == 'true' || value.toLowerCase() == 'false') {
                            $scope.columns.push({ Name: prop, DataType: 'boolean', Template: '{{row.' + prop + ' ? "TRUE" : "FALSE" }}' });
                        } else {
                            var newColumn = { Name: prop, DataType: 'string', Template: '{{row.' + prop + '}}' };

                            if ((/e(-|)mail/ig).test(newColumn.Name)) {
                                newColumn.Template = '<a href="mailto:' + newColumn.Template + '">' + newColumn.Template + '</a>';
                            }

                            $scope.columns.push(newColumn);
                        }
                    }
                }

                var firstSort = false;

                for (var column in $scope.columns) {
                    if ($scope.columns.hasOwnProperty(column)) {
                        var columnObj = $scope.columns[column];
                        columnObj.Label = columnObj.Name.replace(/([a-z])([A-Z])/g, '$1 $2');
                        columnObj.Searchable = columnObj.DataType === 'string';
                        columnObj.Visible = true;
                        columnObj.Sortable = true;
                        columnObj.IsKey = false;
                        columnObj.SortOrder = -1;

                        if (firstSort === false) {
                            columnObj.IsKey = true;
                            columnObj.SortOrder = 1;
                            firstSort = true;
                        }
                    }
                }

                $scope.uiOptions = {
                    Pager: true,
                    FreeTextSearch: true,
                    PageSizeSelector: true,
                    PagerInfo: true,
                    ExportCsv: true
                };

                $scope.payload = {
                    Counter: 0,
                    Payload: model,
                    TotalRecordCount: model.length,
                    FilteredRecordCount: model.length,
                    TotalPages: 1,
                    CurrentPage: 1
                };

                $scope.step++;
            };

            $scope.runTemplate = function() {
                $scope.jsonstring = JSON.stringify($scope.payload, undefined, 2);

                var dataUrl = window.URL.createObjectURL(new Blob([$scope.jsonstring], { type: "application/json" }));

                var topToolbar = '';
                var bottomToolbar = '';

                if ($scope.uiOptions.Pager) {
                    topToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                    bottomToolbar += '\r\n\t<tb-grid-pager class="col-md-6"></tb-grid-pager>';
                }

                if ($scope.uiOptions.ExportCsv) {
                    topToolbar += '\r\n\t<div class="col-md-3">' +
                        '\r\n\t\t<div class="btn-group"><tb-print-button title="Tubular" class="btn-sm"></tb-print-button><tb-export-button filename="tubular.csv" css="btn-sm"></tb-export-button>' +
                        '\r\n\t\t</div>' +
                        '\r\n\t</div>';
                }

                if ($scope.uiOptions.FreeTextSearch) {
                    topToolbar += '\r\n\t<tb-text-search class="col-md-3" css="input-sm"></tb-text-search>';
                }

                if ($scope.uiOptions.PageSizeSelector) {
                    bottomToolbar += '\r\n\t<tb-page-size-selector class="col-md-3" selectorcss="input-sm"></tb-page-size-selector>';
                }

                if ($scope.uiOptions.PagerInfo) {
                    bottomToolbar += '\r\n\t<tb-grid-pager-info class="col-md-3"></tb-grid-pager-info>';
                }

                $scope.gridmodel = '<h1>Autogenerated Grid</h1>' +
                    '\r\n<div class="container">' +
                    '\r\n<tb-grid server-url="' + dataUrl + '" request-method="GET" class="row" require-authentication="false" page-size="10">' +
                    (topToolbar === '' ? '' : '\r\n\t<div class="row">' + topToolbar + '\r\n\t</div>') +
                    '\r\n\t<div class="row">' +
                    '\r\n\t<div class="col-md-12">' +
                    '\r\n\t<div class="panel panel-default panel-rounded">' +
                    '\r\n\t<tb-grid-table class="table-bordered">' +
                    '\r\n\t<tb-column-definitions>' +
                    $scope.columns.map(function (el) {
                        return '\r\n\t\t<tb-column name="' + el.Name + '" label="' + el.Label + '" column-type="' + el.DataType + '" sortable="' + el.Sortable + '" ' +
                            '\r\n\t\t\tsort-order="' + el.SortOrder + '" is-key="' + el.IsKey + '" searchable="' + el.Searchable + '" visible="' + el.Visible + '">' +
                            '\r\n\t\t\t<tb-column-header>{{label}}</tb-column-header>' +
                            '\r\n\t\t</tb-column>';
                    }).join('') +
                    '\r\n\t</tb-column-definitions>' +
                    '\r\n\t<tb-row-set>' +
                    '\r\n\t<tb-row-template ng-repeat="row in $component.rows" row-model="row">' +
                    $scope.columns.map(function (el) { return '\r\n\t\t<tb-cell-template column-name="' + el.Name + '">\r\n\t\t\t' + el.Template + '\r\n\t\t</tb-cell-template>'; }).join('') +
                    '\r\n\t</tb-row-template>' +
                    '\r\n\t</tb-row-set>' +
                    '\r\n\t</tb-grid-table>' +
                    '\r\n\t</div>' +
                    '\r\n\t</div>' +
                    '\r\n\t</div>' +
                    (bottomToolbar === '' ? '' : '\r\n\t<div class="row">' + bottomToolbar + '\r\n\t</div>') +
                    '\r\n\t</div>' +
                    '\r\n</tb-grid>' +
                    '\r\n</div>';

                $templateCache.put('tubulartemplate.html', $scope.gridmodel);
                $scope.templatename = 'tubulartemplate.html';

                $scope.step++;
            };

            $scope.useSample = function() {
                $http.get('data/generatorsample.json').
                    success(function(data) {
                        $scope.basemodel = angular.toJson(data);
                        $scope.generate();
                    });
            };

            $scope.plunker = function() {
                $http.get('assets/plunker.html').
                    success(function(data) {
                        var postData = {};
                        var fixedTemplate = $scope.gridmodel.replace(/server-url="(.[^"]+)"/g, 'server-url="data.json"');

                        var files = [
                            { name: 'index.html', content: data.replace('{{content}}', fixedTemplate) },
                            { name: 'app.js', content: "angular.module('app', ['ngRoute','ngAnimate','ngCookies','tubular.models','tubular.services','tubular.directives']);" },
                            { name: 'data.json', content: $scope.jsonstring }
                        ];

                        angular.forEach(files, function(file) {
                            postData['files[' + file.name + ']'] = file.content;
                        });

                        postData['tags[0]'] = "angularjs";
                        postData['tags[1]'] = "tubular";
                        postData['tags[1]'] = "autogenerated";
                        postData.private = true;
                        postData.description = "Tubular Sample";

                        formPostData('http://plnkr.co/edit/?p=preview', false, postData);
                    });
            };
        }
    ]);

    angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'ngCookies',
        'hljs',
        'tubular.models',
        'tubular.services',
        'tubular.directives',
        'app.routes',
        'app.controllers'
    ]);
})();