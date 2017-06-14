 [![Analytics](https://ga-beacon.appspot.com/UA-8535255-2/unosquare/tubular/)](https://github.com/igrigorik/ga-beacon)
 [![Build Status](https://travis-ci.org/unosquare/tubular.svg?branch=master)](https://travis-ci.org/unosquare/tubular)
 [![Build status](https://ci.appveyor.com/api/projects/status/scyh5u1fltu4d516?svg=true)](https://ci.appveyor.com/project/geoperez/tubular)
[![Coverage Status](https://coveralls.io/repos/unosquare/tubular/badge.svg?branch=master)](https://coveralls.io/r/unosquare/tubular?branch=master)

![Tubular](http://unosquare.github.io/tubular/assets/tubular.png)

:star: *Please star this project if you find it useful!*

Tubular provides a set of directives and services using AngularJS as framework. The main component is a grid with multiple options:

* **Full markup design**, you don't need to write even a Controller in AngularJS to start using our Grid or Form
* Common functionality like **Sorting, Filtering (specific to the data type), Free-text search, Paging** and more.
* Easy to implement inline editors, page or popup forms totally bound to your grid.
* Basic services like **Print and Export to CSV** in client-side.

Developing with .NET as backend? check [Tubular DotNet](https://github.com/unosquare/tubular-dotnet) project.
If you are looking for Angular2 support, check [Tubular2](https://github.com/unosquare/tubular2) beta project.

Please visit the <a href="http://unosquare.github.io/tubular" target="_blank">Tubular GitHub Page</a> to learn how quickly you can start coding. Don't forget to check out the Tubular Generator which quickly turns models into an awesome UIs!

## Dependencies

You will need to reference the following JS libraries in order to use Tubular in your HTML:

* [AngularJS (optionally Animate and Route)](https://angularjs.org/) - 1.6
* [AngularJS UI Bootstrap](https://angular-ui.github.io/bootstrap/) - 2.5 with the Bootstrap CSS
* [Moment.js](http://momentjs.com/) - 2.17
* [Font Awesome](http://fortawesome.github.io/Font-Awesome/)

## Using a CDN

You can get all the dependencies using the following links in your master HTML page. <a href="http://www.jsdelivr.com/">jsDelivr</a> provides almost everything you need to import.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/latest/css/bootstrap.min.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/fontawesome/latest/css/font-awesome.min.css" />

<script src="//cdn.jsdelivr.net/npm/angular@1.6.4/angular.js"></script>
<script src="//cdn.jsdelivr.net/npm/angular-route@1.6.4/angular-route.js"></script>
<script src="//cdn.jsdelivr.net/npm/angular-animate@1.6.4/angular-animate.js"></script>
<script src="//cdn.jsdelivr.net/g/angular.bootstrap@2.5.0(ui-bootstrap.min.js+ui-bootstrap-tpls.min.js),momentjs@2.17.1"></script>
```

Then you will need to either grab your own copy of Tubular or you use jsDelivr to reference Tubular CSS and JS files.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.css" />
<script src="//cdn.jsdelivr.net/npm/tubular@1.7.2"></script>
```

Finally include Tubular to your module as follows:

```javascript
angular.module('app', ['tubular']);
```
## Bower Installation [![Bower version](https://badge.fury.io/bo/tubular.svg)](http://badge.fury.io/bo/tubular)

<pre>
# install Tubular package and add it to bower.json
$ bower install tubular --save
</pre>

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

## Boilerplate

We have 3 boilerplates ready to seed your project:

* <a href="https://github.com/unosquare/tubular-boilerplate" target="_blank">Simple Boilerplate</a> without server-side. 
* [ASP.NET 4.6 Boilerplate](https://github.com/unosquare/tubular-boilerplate-csharp).
* [ASP.NET Core Boilerplate](https://github.com/unosquare/tubular-aspnet-core-boilerplate)
