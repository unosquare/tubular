namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a DataSource metadata
    /// </summary>
    public class DataSourceMetadata
    {
        /// <summary>
        /// The DataSources
        /// </summary>
        public DataSourceRepository DataSources { get; set; }
        /// <summary>
        /// The Aggregation Functions
        /// </summary>
        public string[] AggregationFunctions { get; set; }
        /// <summary>
        /// The valid data Types
        /// </summary>
        public string[] Types { get; set; }
    }
}
