namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Grid Options model
    /// </summary>
    public class GridOptions
    {
        /// <summary>
        /// Sets if the Grid had pager
        /// </summary>
        public bool Pager { get; set; }
        /// <summary>
        /// Sets if the Grid had free text search
        /// </summary>
        public bool FreeTextSearch { get; set; }
        /// <summary>
        /// Sets if the Grid had page size selector
        /// </summary>
        public bool PageSizeSelector { get; set; }
        /// <summary>
        /// Sets if the Grid had pager info
        /// </summary>
        public bool PagerInfo { get; set; }
        /// <summary>
        /// Sets if the Grid had export to CSV button
        /// </summary>
        public bool ExportCsv { get; set; }
        /// <summary>
        /// The editor mode
        /// </summary>
        public string Mode { get; set; }
        /// <summary>
        /// Sets if the Grid had authentication
        /// </summary>
        public bool RequireAuthentication { get; set; }
        /// <summary>
        /// Sets if the Grid Service name, default to http
        /// </summary>
        public string ServiceName { get; set; }
        /// <summary>
        /// The Request method to retrieve data
        /// </summary>
        public string RequestMethod { get; set; }
        /// <summary>
        /// The Grid name
        /// </summary>
        public string GridName { get; set; }

        /// <summary>
        /// The Data Url
        /// </summary>
        public string DataUrl { get; set; }
    }
}
