# tubular
A set of Angular directives and C# classes designed to rapidly build modern web applications. 
Featuring a simple to design grid with a lot of features like server side pagination, multi-column filtering, exporting to CSV in client side.

## Samples

The next HTML represents a basic grid, you don't need to add anything else to your controller.

```html
 <div class="container" ng-controller="YourController">
        <tubular-grid server-url="/api/customers" page-size="20" class="row">
            <!-- Main grid nested row -->
            <div class="row">
                <div class="col-md-12">
                    <div class="panel panel-default panel-rounded">
                        <tubular-grid-table class="table tubular-grid-table table-bordered table-responsive table-striped table-hover table-condensed">
                            <tubular-column-definitions>
                                <tubular-column name="CustomerName">
                                    <tubular-column-header>
                                        <span>{{label}}</span>
                                    </tubular-column-header>
                                </tubular-column>
                                <tubular-column name="Invoices">
                                    <tubular-column-header>
                                        <span>{{label}}</span>
                                    </tubular-column-header>
                                </tubular-column>
                            </tubular-column-definitions>
                        </tubular-grid-table>
                    </div>
                </div>
            </div>
        </tubular-grid>
    </div>
```