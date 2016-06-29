namespace Unosquare.Tubular.Tests.Database
{
    using System.ComponentModel.DataAnnotations;
    using Unosquare.Tubular.ObjectModel;

    public class Thing
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        public double Number { get; set; }

        public decimal DecimalNumber { get; set; }

        public string Category { get; set; }

        public string Color { get; set; }

        public System.DateTime Date { get; set; }

        public bool Bool { get; set; }

        public static GridColumn[] GetColumnsWithAggregate()
        {
            return new[]
            {
                new GridColumn {Name = "Id"},
                new GridColumn {Name = "Number", Aggregate = AggregationFunction.Sum},
                new GridColumn {Name = "DecimalNumber", Aggregate = AggregationFunction.Sum}
            };
        }

        public static GridColumn[] GetColumnsWithMultipleCounts()
        {
            return new[]
            {
                new GridColumn {Name = "Id", Aggregate = AggregationFunction.DistinctCount},
                new GridColumn {Name = "Number", Aggregate = AggregationFunction.DistinctCount},
                new GridColumn {Name = "DecimalNumber", Aggregate = AggregationFunction.DistinctCount},
                new GridColumn {Name = "Name", Aggregate = AggregationFunction.DistinctCount},
                new GridColumn {Name = "Date", Aggregate = AggregationFunction.DistinctCount}
                // TODO: The Bool is failing with the new Dyamic LINQ
                //new GridColumn {Name = "Bool", Aggregate = AggregationFunction.DistinctCount}
            };
        }

        public static GridColumn[] GetColumns()
        {
            return new[]
            {
                new GridColumn {Name = "Id"},
                new GridColumn {Name = "Name", Searchable = true},
                new GridColumn {Name = "Date"},
                new GridColumn {Name = "Bool"}
            };
        }

        public static GridColumn[] GetColumnsWithSort()
        {
            return new[]
            {
                new GridColumn {Name = "Id"},
                new GridColumn {Name = "Name"},
                new GridColumn {Name = "Date", Sortable = true, SortDirection = SortDirection.Ascending, SortOrder = 1},
                new GridColumn {Name = "Bool"}
            };
        }

        public static GridColumn[] GetColumnsWithIdFilter()
        {
            return new[]
            {
                new GridColumn
                {
                    Name = "Id",
                    Filter = new Filter() {Text = "95", Operator = CompareOperators.Gt},
                    DataType = Tubular.DataType.Numeric
                },
                new GridColumn {Name = "Name"},
                new GridColumn {Name = "Date"},
                new GridColumn {Name = "Bool"}
            };
        }
    }
}