# Tubular

A set of <a href="https://angularjs.org/" target="_blank">AngularJS</a> directives and C# classes designed to rapidly build modern web applications. 
Tubular features a fully templateable grid with lots of features such as server-side pagination, multi-column sorting and filtering, built-in export to CSV, and in-line editing of rows via templates.

## Dependencies

You will need to reference the following JS libraries in order to use Tubular in your HTML:

* jQuery
* Twitter Bootstrap
* AngularJS (including Route, Cookies, and optionally, Animate)
* AngularJS UI Bootstrap
* AngularJS Local Storage
* Font Awesome

Also, if you use the Visual Studio you will need the excellent <a href="http://vswebessentials.com/download" target="_blank">Web Essentials</a> plug-in in order to generate the Tubular bundles.

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
                            <tb-row-template ng-repeat="cells in $component.rows" row-model="cells" selectable="true">
                                <tb-cell-template>
                                    {{cells.CustomerName}}
                                </tb-cell-template>
                                <tb-cell-template>
                                    {{cells.Invoices}}
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
