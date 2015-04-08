
namespace Unosquare.Tubular.ObjectModel
{
    public class GridColumn
    {
        public string Name { get; set; }
        public string Label { get; set; }
        public bool Sortable { get; set; }
        public int SortOrder { get; set; }
        public SortDirection SortDirection { get; set; }
        public Filter Filter { get; set; }
        public bool Searchable { get; set; }
        public string DataType { get; set; }
    }
}
