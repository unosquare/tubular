# Tubular

A set of <a href="https://angularjs.org/" target="_blank">AngularJS</a> directives and C# classes designed to rapidly build modern web applications. 
Tubular features a fully templateable grid with lots of features such as server-side pagination, multi-column sorting and filtering, built-in export to CSV, and in-line editing of rows via templates.

## NuGet Installation

### Package containing only the client-side stuff

<pre>
PM> Install-Package Tubular
</pre>

### Package containing the server-side stuff (which also installs the client-side stuff)

<pre>
PM> Install-Package Tubular.ServerSide
</pre>

## Dependencies

You will need to reference the following JS libraries in order to use Tubular in your HTML:

* jQuery
* Twitter Bootstrap
* AngularJS (including Route, Cookies, and optionally, Animate)
* AngularJS UI Bootstrap
* AngularJS Local Storage
* Font Awesome
* FileSaver.js and Blob.js

Also, if you use the Visual Studio you will need the excellent <a href="http://vswebessentials.com/download" target="_blank">Web Essentials</a> plug-in in order to generate the Tubular bundles.

## Using CDN

You can get all dependencies using the next lines in your initial HTML page. <a href="http://www.jsdelivr.com/">jsDelivr</a> has almost everything you need.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/bootstrap/3.3.4/css/bootstrap.min.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/fontawesome/4.3.0/css/font-awesome.min.css" />

<script src="//cdn.jsdelivr.net/g/jquery,bootstrap,angularjs(angular.min.js+angular-animate.min.js+angular-cookies.min.js+angular-route.min.js),filesaver.js,angular.bootstrap(ui-bootstrap.min.js+ui-bootstrap-tpls.min.js),blob.js(Blob.js),filesaver.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/angular-local-storage/0.1.5/angular-local-storage.min.js"></script>
```

Then you need to grab your own Tubular copy or you can use the same CDN to retrieve Tubular CSS and JS files.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.css" />
<script src="//cdn.jsdelivr.net/tubular/latest/tubular-bundle.min.js"></script>
```

Finally update your modules to include Tubular, for example if your module is app.

```javascript
angular.module('app', ['ngRoute','ngAnimate','ngCookies','tubular.models','tubular.services','tubular.directives']);
```

## Samples

You can check out the <a href="http://unosquare.github.io/tubular" target="_blank">Tubular GitPage</a> to get a few examples. We still need to work on more samples and better documentation, but we feel what we have now will get you up to speed for now.

The following HTML represents a basic grid. You don't need to add anything else to your controller! Everything is templated

```html
 <div class="container" ng-controller="YourController">
        <tb-grid server-url="/data/customers.json" page-size="20" class="row">
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
                            <tb-row-template ng-repeat="row in $component.rows" row-model="row" selectable="true">
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

Tubular works directly with either your own OData service or, you can also have it consume custom calls using our .NET library to handle Tubular's models.

## Tubular Models

Tubular uses a special model to represent requests and expects a specific JSON payload. More details to come.
