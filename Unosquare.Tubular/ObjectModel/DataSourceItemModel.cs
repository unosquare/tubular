namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Model to generate ModelColumns
    /// </summary>
    public class DataSourceItemModel
    {
        /// <summary>
        /// The Aggregation Function
        /// </summary>
        public AggregationFunction Aggregation { get; set; }

        /// <summary>
        /// Column Name
        /// </summary>
        public string Column { get; set; }

        /// <summary>
        /// Datasource Name
        /// </summary>
        public string DataSource { get; set; }

        /// <summary>
        /// Data Type
        /// </summary>
        public DataType DataType { get; set; }

        /// <summary>
        /// Filter Expression
        /// </summary>
        public string Filter { get; set; }
    }
}