# Tubular

A set of [Angular](https://angularjs.org/) directives and C# classes designed to rapidly build modern web applications. 
Featuring a simple to design grid with a lot of features like server side pagination, multi-column filtering, exporting to CSV in client side.

## Dependencies

You will need to add the next JS libraries to use Tubular:

* jQuery
* Twitter Bootstrap
* AngularJS (including Route, Cookies and if you want Animate)
* AngularJS UI Bootstrap
* AngularJS Local Storage
* Font Awesome

Also if you use the Visual Studio project you need [Web Essentials](http://vswebessentials.com/download) to generate the Tubular bundles.

## Samples

You can check [Tubular GitPage](http://unosquare.github.io/tubular) for more demos.

The next HTML represents a basic grid, you don't need to add anything else to your controller.

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

Tubular can work directly with any OData service or you can create your own service using C# and our library to handle Tubular's models.

## Tubular Models

Tubular uses a special model to request a page in C# and expect a model with the payload.