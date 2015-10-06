 [![Analytics](https://ga-beacon.appspot.com/UA-8535255-2/unosquare/tubular/)](https://github.com/igrigorik/ga-beacon)
 [![Build Status](https://travis-ci.org/unosquare/tubular.svg?branch=master)](https://travis-ci.org/unosquare/tubular)
 [![Build status](https://ci.appveyor.com/api/projects/status/scyh5u1fltu4d516?svg=true)](https://ci.appveyor.com/project/geoperez/tubular)
[![Coverage Status](https://coveralls.io/repos/unosquare/tubular/badge.svg?branch=master)](https://coveralls.io/r/unosquare/tubular?branch=master)

![Tubular](http://unosquare.github.io/tubular/assets/tubular.png)

Tubular is a set of <a href="https://angularjs.org/" target="_blank">AngularJS</a> directives and C# classes designed to rapidly build modern web applications.  The centerpiece of Tubular is its fully templateable grid with lots of features such as server-side pagination, multi-column sorting and filtering, built-in export to CSV (client-side), and in-line editing of rows via templates.

Please visit the <a href="http://unosquare.github.io/tubular" target="_blank">Tubular GitHub Page</a> to learn how quickly you can start coding. Don't forget to check out the Tubular Generator which quickly turns models into an awesome UIs!

## NuGet Installation [![NuGet version](https://badge.fury.io/nu/tubular.svg)](http://badge.fury.io/nu/tubular)

### Package containing only the client-side stuff

<pre>
PM> Install-Package Tubular
</pre>

### Package containing the server-side stuff (which also installs the client-side stuff)

<pre>
PM> Install-Package Tubular.ServerSide
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


## Dependencies

You will need to reference the following JS libraries in order to use Tubular in your HTML:

* [jQuery](http://jquery.com/)
* [Twitter Bootstrap](http://getbootstrap.com/)
* [AngularJS (optionally Animate and Route)](https://angularjs.org/)
* [AngularJS UI Bootstrap](https://angular-ui.github.io/bootstrap/)
* [AngularJS Local Storage](https://github.com/grevory/angular-local-storage)
* [Font Awesome](http://fortawesome.github.io/Font-Awesome/)
* [FileSaver.js and Blob.js](https://github.com/eligrey/FileSaver.js)

Also, if you use the Visual Studio you will need the excellent <a href="http://vswebessentials.com/download" target="_blank">Web Essentials</a> if you are running VS2013 or [Bundler & Minifier](https://visualstudiogallery.msdn.microsoft.com/9ec27da7-e24b-4d56-8064-fd7e88ac1c40) plug-in for VS2015 in order to generate the Tubular bundles.

### Charts

An experimental support to chart is running with Tubular and you can choose between [ChartJS](http://www.chartjs.org/) or [Highcharts](http://www.highcharts.com/). If you want to use any of them, be sure to load the library before Tubular and check [Tubular Sample](https://github.com/unosquare/tubular/tree/master/Unosquare.Tubular.Sample) with easy to understand code on how to start using charts.

## Using a CDN

You can get all the dependencies using the following links in your master HTML page. <a href="http://www.jsdelivr.com/">jsDelivr</a> provides almost everything you need to import.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/fontawesome/latest/css/font-awesome.min.css" />

<script src="//cdn.jsdelivr.net/g/jquery,bootstrap,angularjs(angular.min.js+angular-animate.min.js+angular-route.min.js),filesaver.js,angular.bootstrap(ui-bootstrap.min.js+ui-bootstrap-tpls.min.js),blob.js(Blob.js),filesaver.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/angular-local-storage/0.1.5/angular-local-storage.min.js"></script>
```

Then you will need to either grab your own copy of Tubular or you use jsDelivr to reference Tubular CSS and JS files.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.css" />
<script src="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.js"></script>
```

Finally update your modules to include Tubular, for example if your module is called <i>app</i>, then you will need to add Tubular as a dependency as follows:

```javascript
angular.module('app', ['ngRoute','tubular']);
```

##Boilerplate

We have a basic <a href="https://github.com/unosquare/tubular-boilerplate" target="_blank">Boilerplate</a> with everything that you need to start your own tubular project. If you are working with .NET WebAPI you can check our [C# Boilerplate](https://github.com/unosquare/tubular-boilerplate-csharp) too.

We are already working on a <a href="http://yeoman.io/" taget="_blank">Yeoman Generator</a>. Check out the <a href="https://github.com/unosquare/generator-tubular" target="_blank">generator-tubular</a> repository to check out our progress.

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
                                             row-model="row" selectable="true">
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

Tubular works directly with either your own OData service or a custom RESTful call. You can simplify your RESTful API significantly by using our .NET Tubular.ServerSide library which handles IQueryables easily.
