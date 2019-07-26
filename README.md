 [![Analytics](https://ga-beacon.appspot.com/UA-8535255-2/unosquare/tubular/)](https://github.com/igrigorik/ga-beacon)
 [![Build Status](https://travis-ci.org/unosquare/tubular.svg?branch=master)](https://travis-ci.org/unosquare/tubular)
 [![Build status](https://ci.appveyor.com/api/projects/status/scyh5u1fltu4d516?svg=true)](https://ci.appveyor.com/project/geoperez/tubular)
[![Coverage Status](https://coveralls.io/repos/unosquare/tubular/badge.svg?branch=master)](https://coveralls.io/r/unosquare/tubular?branch=master)

![Tubular](http://unosquare.github.io/tubular/assets/tubular.png)

Important - This repository has been archived. We are not longer maintaining this project. Please check Tubular for [Angular.io](https://github.com/unosquare/tubular2) or [React](https://github.com/unosquare/tubular-react).

:star: *Please star this project if you find it useful!*

Tubular for AngularJS (formerly Tubular) provides a set of directives and services using AngularJS as framework. The main component is a grid with multiple options:

* **Full markup design**, you don't need to write even a Controller in AngularJS to start using our Grid or Form
* Common functionality like **Sorting, Filtering (specific to the data type), Free-text search, Paging** and more.
* Easy to implement inline editors, page or popup forms totally bound to your grid.
* Basic services like **Print and Export to CSV** in client-side.
* Independent backend platform (.NET and Node.js)
* Compatible with modern browsers (Chrome, Firefox, and Edge). We are not supporting old browsers like Internet Explorer, you may need to include some polyfills.

Please visit the [Tubular GitHub Page](http://unosquare.github.io/tubular) to learn how quickly you can start coding. See [Related projects](#related-projects) below to discover more Tubular libraries and backend solutions.

## Dependencies

You will need to reference the following JS libraries in order to use Tubular in your HTML:

* [AngularJS (optionally Animate and Route)](https://angularjs.org/) - 1.6
* [AngularJS UI Bootstrap](https://angular-ui.github.io/bootstrap/) - 2.5 with the Bootstrap CSS
* [Moment.js](http://momentjs.com/) - 2.17
* [Font Awesome](http://fortawesome.github.io/Font-Awesome/)

## Using a CDN

You can get all the dependencies using the following links in your master HTML page. <a href="http://www.jsdelivr.com/">jsDelivr</a> provides almost everything you need to import.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/font-awesome@latest/css/font-awesome.min.css" />

<script src="//cdn.jsdelivr.net/npm/angular@1.6.4/angular.js"></script>
<script src="//cdn.jsdelivr.net/npm/angular-route@1.6.4/angular-route.js"></script>
<script src="//cdn.jsdelivr.net/npm/angular-animate@1.6.4/angular-animate.js"></script>
<script src="//cdn.jsdelivr.net/combine/npm/angular-ui-bootstrap@2.5.0/dist/ui-bootstrap.min.js,npm/angular-ui-bootstrap@2.5.0/dist/ui-bootstrap-tpls.min.js,npm/moment@2.18.1"></script>
```          
Then you will need to either grab your own copy of Tubular or you use jsDelivr to reference Tubular CSS and JS files.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/tubular@latest/dist/tubular-bundle.min.css" />
<script src="//cdn.jsdelivr.net/npm/tubular@1.8.1"></script>
```

Finally include Tubular to your module as follows:

```javascript
angular.module('app', ['tubular']);
```
## npm Installation [![npm version](https://badge.fury.io/js/tubular.svg)](http://badge.fury.io/js/tubular)

<pre>
# install Tubular package and add it to package.json
$ npm install tubular --save
</pre>

## Samples

You can check out the <a href="http://unosquare.github.io/tubular" target="_blank">Tubular GitHub Page</a> to get a few examples. We still need to work on more samples and better documentation, but we feel what we have now will get you up to speed very quickly :).

The following HTML represents a basic grid. You don't need to add anything else to your controller! Everything you need is to create your markup.

```html
 <div class="container">
        <tb-grid server-url="/data/customers.json" page-size="20" 
                 class="row" grid-name="mygrid">
            <div class="col-md-12">
                <div class="panel panel-default panel-rounded">
                    <tb-grid-table class="table-bordered">
                        <tb-column-definitions>
                            <tb-column name="CustomerName">
                                <tb-column-header>
                                    <span>{{label}}</span>
                                </tb-column-header>
                            </tb-column>
                            <tb-column name="Invoices">
                                <tb-column-header>
                                    <span>{{label}}</span>
                                </tb-column-header>
                            </tb-column>
                        </tb-column-definitions>
                        <tb-row-set>
                            <tb-row-template ng-repeat="row in $component.rows" 
                                             row-model="row">
                                <tb-cell-template>
                                    {{row.CustomerName}}
                                </tb-cell-template>
                                <tb-cell-template>
                                    {{row.Invoices}}
                                </tb-cell-template>
                            </tb-row-template>
                        </tb-row-set>
                    </tb-grid-table>
                </div>
            </div>
        </tb-grid>
    </div>
```

### Run Sample

There is a sample included in this project, you can run it just by doing the following.

```
// Install all the dependencies
npm install
// Builds the project and generates the bundles
grunt build
// Runs the sample project
npm run serve 
```

## Related Projects

Name | Type | Language/tech | Description
-----|------|---------------|--------------
| [Tubular for AngularJS (formerly Tubular)](https://github.com/unosquare/tubular) | Library | AngularJs | Tubular provides a set of directives and services using AngularJS as framework. |
| [Tubular for Angular6 (formerly Tubular2)](https://github.com/unosquare/tubular2) | Library | Angular6 | New Tubular2 with Angular6 (Angular2) and Angular Material 2.
| [Tubular React](https://github.com/unosquare/tubular-react) | Library | React | Tubular-React is a DataGrid component using Material-UI |
| [Tubular Common](https://github.com/unosquare/tubular-common) | Library | Javascript/Typescript | Tubular Common provides TypeScript and Javascript models and data transformer to use any Tubular DataGrid component with an array of Javascript objects. |
| [Tubular Dotnet](https://github.com/unosquare/tubular-dotnet) | Backend library | C#/.NET Core | Tubular provides .NET Framework and .NET Core Library to create REST service to use with Tubular Angular Components easily with any WebApi library (ASP.NET Web API for example). |
| [Tubular Nodejs](https://github.com/unosquare/tubular-nodejs) | Backend Library | Javascript | Tubular Node.js provides an easy way to integrate Tubular Angular Components easily with any Node.js WebApi library. |
| [Tubular Boilerplate C#](https://github.com/unosquare/tubular-boilerplate-csharp) | Boilerplate | C# | Tubular Directives Boilerplate (includes AngularJS and Bootstrap) |
| [Tubular Boilerplate](https://github.com/unosquare/tubular-boilerplate) | Boilerplate | Javascript/AngularJS | Tubular Directives Boilerplate (includes AngularJS and Bootstrap). |
| [Tubular ASP.NET Core 2.0 Boilerplate](https://github.com/unosquare/tubular-aspnet-core-boilerplate) | Boilerplate | C#/.NET Core | Tubular Directives Boilerplate (includes AngularJS and Bootstrap). |
