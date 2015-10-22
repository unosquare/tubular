namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Form Options model
    /// </summary>
    public class FormOptions
    {
        /// <summary>
        /// Defines if Form shows Cancel button
        /// </summary>
        public bool CancelButton { get; set; }

        /// <summary>
        /// Sets the Url to save the form
        /// </summary>
        public string SaveUrl { get; set; }

        /// <summary>
        /// Sets the HTTP Method to save
        /// </summary>
        public string SaveMethod { get; set; }

        /// <summary>
        /// Sets the Layout
        /// </summary>
        public FormLayout Layout { get; set; }

        /// <summary>
        /// Defines an initial key to load data
        /// </summary>
        public string ModelKey { get; set; }

        /// <summary>
        /// Checks if authentication is required
        /// </summary>
        public bool RequireAuthentication { get; set; }

        /// <summary>
        /// Defines the Service Provider, usually TubularHttp
        /// </summary>
        public string ServiceName { get; set; }

        /// <summary>
        /// The Data Url
        /// </summary>
        public string DataUrl { get; set; }
    }
}