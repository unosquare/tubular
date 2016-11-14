namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Tubular's filter (by column).
    /// 
    /// This object is only used to be serialized/deserialized between
    /// the API and Tubular
    /// </summary>
    public class Filter
    {
        /// <summary>
        /// Initialize a Filter with default params
        /// </summary>
        public Filter()
        {
            Operator = CompareOperators.None;
            OptionsUrl = string.Empty;
            Name = string.Empty;
            Text = string.Empty;
        }

        /// <summary>
        /// Filter name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Filter search text
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Filter search params
        /// </summary>
        public string[] Argument { get; set; }

        /// <summary>
        /// Filter's operator
        /// </summary>
        public CompareOperators Operator { get; set; }

        /// <summary>
        /// Gets or sets the options URL.
        /// The url returns a list of Filter objects
        /// </summary>
        /// <value>
        /// The options URL.
        /// </value>
        public string OptionsUrl { get; set; }

        /// <summary>
        /// Flags if the Filter is applied.
        /// </summary>
        public bool HasFilter { get; set; }
    }
}