 [![Analytics](https://ga-beacon.appspot.com/UA-8535255-2/unosquare/tubular/)](https://github.com/igrigorik/ga-beacon)
 [![Build Status](https://travis-ci.org/unosquare/tubular.svg?branch=master)](https://travis-ci.org/unosquare/tubular)
 [![Build status](https://ci.appveyor.com/api/projects/status/scyh5u1fltu4d516?svg=true)](https://ci.appveyor.com/project/geoperez/tubular)
[![Coverage Status](https://coveralls.io/repos/unosquare/tubular/badge.svg?branch=master)](https://coveralls.io/r/unosquare/tubular?branch=master)

![Tubular](http://unosquare.github.io/tubular/assets/tubular.png)

:star: *Please star this project if you find it useful!*

Tubular provides a set of directives and services using AngularJS as framework, the main component is a grid with multiple options:

* **Full markup design**, you don't need to write even a Controller in AngularJS to start using our Grid or Form
* Common functionality like **Sorting, Filtering (specific to the data type), Free-text search, Paging** and more.
* Easy to implement inline editors, page or popup forms totally bound to your grid.
* Basic services like **Print and Export to CSV** in client-side.

Developing with .NET as backend? check [Tubular DotNet](https://github.com/unosquare/tubular-dotnet) project.
If you are looking for Angular2 support, check [Tubular2](https://github.com/unosquare/tubular2) project.

Please visit the <a href="http://unosquare.github.io/tubular" target="_blank">Tubular GitHub Page</a> to learn how quickly you can start coding. Don't forget to check out the Tubular Generator which quickly turns models into an awesome UIs!

## Dependencies

You will need to reference the following JS libraries in order to use Tubular in your HTML:

### Mandatory

* [AngularJS (optionally Animate and Route)](https://angularjs.org/) - 1.6
* [AngularJS UI Bootstrap](https://angular-ui.github.io/bootstrap/) - 2.5 with the Bootstrap CSS
* [Moment.js](http://momentjs.com/) - 2.17
* [Font Awesome](http://fortawesome.github.io/Font-Awesome/)

### Deprecated

* <s>[FileSaver.js](https://github.com/eligrey/FileSaver.js)</s> Only with Tubular < 1.4.0 
* <s>[AngularJS Local Storage](https://github.com/grevory/angular-local-storage)</s> Only with Tubular < 1.4.0 
* <s>[jQuery](http://jquery.com/) - 2.1.4</s> Only with Tubular < v1.0.0
* <s>[Twitter Bootstrap](http://getbootstrap.com/)</s> Only with Tubular < 1.0.0

## Using a CDN

You can get all the dependencies using the following links in your master HTML page. <a href="http://www.jsdelivr.com/">jsDelivr</a> provides almost everything you need to import.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/fontawesome/latest/css/font-awesome.min.css" />

<script src="//cdn.jsdelivr.net/g/angularjs@1.6.0(angular.min.js+angular-animate.min.js+angular-route.min.js),angular.bootstrap@2.5.0(ui-bootstrap.min.js+ui-bootstrap-tpls.min.js),momentjs@2.17.1"></script>
```

Then you will need to either grab your own copy of Tubular or you use jsDelivr to reference Tubular CSS and JS files.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.css" />
<script src="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.js"></script>
```

Finally update your modules to include Tubular, for example if your module is called <i>app</i>, then you will need to add Tubular as a dependency as follows:

```javascript
angular.module('app', ['tubular']);
```

If you want to use OData or LocalData connectors to populate tbGrid, you must include the separated files. Previous to version 1.0.0 those services where in the main bundle.

## NuGet Installation [![NuGet version](https://badge.fury.io/nu/tubular.svg)](http://badge.fury.io/nu/tubular)

<pre>
PM> Install-Package Tubular
</pre>

## Bower Installation [![Bower version](https://badge.fury.io/bo/tubular.svg)](http://badge.fury.io/bo/tubular)

<pre>
# install Tubular package and add it to bower.json
$ bower install tubular --save
</pre>

## npm Installation [![npm version](https://badge.fury.io/js/tubular.svg)](http://badge.fury.io/js/tubular)

The npm package only contains the **Tubular Template Generator Module**, if you want to use all of Tubular's features, please install the Bower package instead.

<pre>
# install Tubular package and add it to package.json
$ npm install tubular --save
</pre>

## Charts

An experimental support to chart is running with Tubular and you can choose between [ChartJS](http://www.chartjs.org/) or [Highcharts](http://www.highcharts.com/). If you want to use any of them, be sure to load the library before Tubular and check [Tubular OWIN Sample](https://github.com/unosquare/tubular-dotnet/tree/master/src/Unosquare.Tubular.OwinSample) with easy to understand code on how to start using charts.

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

Tubular works directly with either your own OData service or a custom RESTful call. You can simplify your RESTful API significantly by using our .NET Tubular.ServerSide library which handles `IQueryable` easily.

## Boilerplate

We have 3 boilerplates ready to seed your project:

* <a href="https://github.com/unosquare/tubular-boilerplate" target="_blank">Simple Boilerplate</a> without server-side. 
* [ASP.NET 4.6 Boilerplate](https://github.com/unosquare/tubular-boilerplate-csharp).
* [ASP.NET Core Boilerplate](https://github.com/unosquare/tubular-aspnet-core-boilerplate)
