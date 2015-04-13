
namespace Unosquare.Tubular.ObjectModel
{
    public class Filter
    {
        public Filter()
        {
            this.Operator = CompareOperators.None;
            this.OptionsUrl = string.Empty;
            this.Name = string.Empty;
            this.Text = string.Empty;
            this.Required = false;
        }

        public string Name { get; set; }
        public string Text { get; set; }
        public bool Required { get; set; }
        public string[] Argument { get; set; }
        public CompareOperators Operator { get; set; }

        /// <summary>
        /// Gets or sets the options URL.
        /// The url returns a list of Filter objects
        /// </summary>
        /// <value>
        /// The options URL.
        /// </value>
        public string OptionsUrl { get; set; }
    }
}
