namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Column model from Tubular javascript
    /// </summary>
    public class ModelColumn : GridColumn
    {
        /// <summary>
        /// The template to use with tbGrid
        /// </summary>
        public string Template { get; set; }
        /// <summary>
        /// The Editor Type
        /// </summary>
        public string EditorType { get; set; }
        /// <summary>
        /// Set if the Column has filter
        /// </summary>
        public bool HasFilter { get; set; }
        /// <summary>
        /// Set if the Column is visible
        /// </summary>
        public bool Visible { get; set; }
        /// <summary>
        /// Set if the Columns is key in the datasource
        /// </summary>
        public bool IsKey { get; set; }
        /// <summary>
        /// Defines if the label is shown
        /// </summary>
        public bool ShowLabel { get; set; }
        /// <summary>
        /// Placeholder text
        /// </summary>
        public string Placeholder { get; set; }
        /// <summary>
        /// Format string
        /// </summary>
        public string Format { get; set; }
        /// <summary>
        /// Help text
        /// </summary>
        public string Help { get; set; }
        /// <summary>
        /// Set if the field is required
        /// </summary>
        public bool Required { get; set; }
        /// <summary>
        /// Set if the field is read-only
        /// </summary>
        public bool ReadOnly { get; set; }
    }

    internal class FieldSettings
    {
        public bool ShowLabel { get; set; }
        public bool Placeholder { get; set; }
        public bool Format { get; set; }
        public bool Help { get; set; }
        public bool Required { get; set; }
        public bool ReadOnly { get; set; }
        public bool EditorType { get; set; }
    }
}
