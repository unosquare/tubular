namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a Column model from Tubular javascript
    /// </summary>
    public class ModelColumn
    {
        /// <summary>
        /// The Column name
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// The Data type
        /// </summary>
        public DataType DataType { get; set; }
        /// <summary>
        /// The template to use with tbGrid
        /// </summary>
        public string Template { get; set; }
        /// <summary>
        /// The column label to display
        /// </summary>
        public string Label { get; set; }
        /// <summary>
        /// The Editor Type
        /// </summary>
        public string EditorType { get; set; }
        /// <summary>
        /// Set if the Column is searchable
        /// </summary>
        public bool Searchable { get; set; }
        /// <summary>
        /// Set if the Column has filter
        /// </summary>
        public bool Filter { get; set; }
        /// <summary>
        /// Set if the Column is visible
        /// </summary>
        public bool Visible { get; set; }
        /// <summary>
        /// Set if the Column is sortable
        /// </summary>
        public bool Sortable { get; set; }
        /// <summary>
        /// Set if the Columns is key in the datasrouce
        /// </summary>
        public bool IsKey { get; set; }
        /// <summary>
        /// Set the Column sort order
        /// </summary>
        public int SortOrder { get; set; }
        /// <summary>
        /// The Sort Direction
        /// </summary>
        public SortDirection SortDirection { get; set; }
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
