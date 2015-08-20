namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Tubular's Grid column.
    /// 
    /// This object is only used to be serialized/deserialized between
    /// the API and Tubular
    /// </summary>
    public class GridColumn
    {
        /// <summary>
        /// Column's Name
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Column's Label
        /// </summary>
        public string Label { get; set; }
        /// <summary>
        /// Set if column is sortable
        /// </summary>
        public bool Sortable { get; set; }
        /// <summary>
        /// Set the sort order, zero or less are ignored
        /// </summary>
        public int SortOrder { get; set; }
        /// <summary>
        /// Set the sort direction
        /// </summary>
        public SortDirection SortDirection { get; set; }
        /// <summary>
        /// Represents the Columns filter
        /// </summary>
        public Filter Filter { get; set; }
        /// <summary>
        /// Set if the column is searchable in free-text search
        /// </summary>
        public bool Searchable { get; set; }
        /// <summary>
        /// Column's data type
        /// </summary>
        public string DataType { get; set; }
        /// <summary>
        /// Column's Aggregation Function
        /// </summary>
        public AggregationFunction Aggregate { get; set; }
    }
}
