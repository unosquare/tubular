# tubular
A set of Angular directives and C# classes designed to rapidly build modern web applications. 
Featuring a simple to design grid with a lot of features like server side pagination, multi-column filtering, exporting to CSV in client side.

## Samples

The next HTML represents a basic grid, you don't need to add anything else to your controller.

```html
 <div class="container" ng-controller="YourController">
        <tb-grid server-url="/api/customers" page-size="20" class="row">
            <!-- Main grid nested row -->
            <div class="row">
                <div class="col-md-12">
                    <div class="panel panel-default panel-rounded">
                        <tb-grid-table class="table tubular-grid-table table-bordered table-responsive table-striped table-hover table-condensed">
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
                        </tb-grid-table>
                    </div>
                </div>
            </div>
        </tb-grid>
    </div>
```