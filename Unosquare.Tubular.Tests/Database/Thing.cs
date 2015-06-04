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

        public System.DateTime Date { get; set; }

        public bool Bool { get; set; }

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
                    DataType = Tubular.DataType.Numeric.ToString()
                },
                new GridColumn {Name = "Name"},
                new GridColumn {Name = "Date"},
                new GridColumn {Name = "Bool"}
            };
        }
    }
}