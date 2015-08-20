namespace Unosquare.Tubular.ObjectModel
{
    using System.Collections.Generic;

    /// <summary>
    /// Represents a Data Response to a Tubular's Grid.
    /// 
    /// This model is how Tubular Grid expects data to any server.
    /// </summary>
    public class GridDataResponse
    {
        /// <summary>
        /// Response's counter
        /// </summary>
        public int Counter { get; set; }
        /// <summary>
        /// A list of object's list with all the rows
        /// </summary>
        public List<List<object>> Payload { get; set; }
        /// <summary>
        /// Set how many records are in the entire set
        /// </summary>
        public int TotalRecordCount { get; set; }
        /// <summary>
        /// Set how many records are in the filtered set
        /// </summary>
        public int FilteredRecordCount { get; set; }
        /// <summary>
        /// Set how many pages are available
        /// </summary>
        public int TotalPages { get; set; }
        /// <summary>
        /// Set which page is sent
        /// </summary>
        public int CurrentPage { get; set; }
        /// <summary>
        /// A dictionary with the aggregation functions
        /// </summary>
        public Dictionary<string, object> AggregationPayload { get; set; }
    }
}
