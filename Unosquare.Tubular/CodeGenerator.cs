using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular
{
    /// <summary>
    /// Provides static methods to generate HTML code with tbGrid or tbForm
    /// </summary>
    public static class CodeGenerator
    {
        private static readonly Regex UnderscoreRegex = new Regex(@"_",
            RegexOptions.Multiline | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static readonly Regex CamelCaseRegEx = new Regex(@"[a-z][A-Z]",
            RegexOptions.Multiline | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static readonly Regex UpperRegEx = new Regex(@"[A-Z]",
            RegexOptions.Multiline | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static string SplitCamel(Match m)
        {
            var x = m.ToString();
            return x[0] + " " + x.Substring(1, x.Length - 1);
        }

        private static string EditorName(Match m)
        {
            var x = m.ToString().ToLower();
            return "-" + x[0];
        }

        private static string GetEditorTypeByDataType(DataType dataType)
        {
            switch (dataType)
            {
                case DataType.Date:
                case DataType.DateTime:
                    return "tbDateTimeEditor";
                case DataType.Numeric:
                    return "tbNumericEditor";
                case DataType.Boolean:
                    return "tbCheckboxField";
                default:
                    return "tbSimpleEditor";
            }
        }

        /// <summary>
        /// Humanizes the specified camel case string.
        /// </summary>
        /// <param name="camelCaseString">The camel case string.</param>
        /// <returns></returns>
        public static string Humanize(this string camelCaseString)
        {
            var returnValue = camelCaseString ?? string.Empty;
            returnValue = UnderscoreRegex.Replace(returnValue, " ");
            returnValue = CamelCaseRegEx.Replace(returnValue, SplitCamel);
            return returnValue;
        }

        /// <summary>
        /// Creates a list with the Columns from a model
        /// </summary>
        /// <param name="model">The model</param>
        /// <returns>A ModelColumn list</returns>
        public static List<ModelColumn> CreateColumns(object model)
        {
            var columns = new List<ModelColumn>();

            var properties =
                model.GetType().GetProperties().Where(p => Common.PrimitiveTypes.Contains(p.PropertyType) && p.CanRead);

            foreach (var prop in properties)
            {
                if (Common.NumericTypes.Contains(prop.PropertyType))
                {
                    columns.Add(new ModelColumn
                    {
                        DataType = DataType.Numeric,
                        Name = prop.Name,
                        Template = "{{row." + prop.Name + " | number}}"
                    });
                }
                else if (prop.PropertyType == typeof (DateTime) || prop.PropertyType == typeof (DateTime?))
                {
                    columns.Add(new ModelColumn
                    {
                        DataType = DataType.Date,
                        Name = prop.Name,
                        Template = "{{row." + prop.Name + " | date}}"
                    });
                }
                else if (prop.PropertyType == typeof (bool) || prop.PropertyType == typeof (bool?))
                {
                    columns.Add(new ModelColumn
                    {
                        DataType = DataType.Boolean,
                        Name = prop.Name,
                        Template = "{{row." + prop.Name + " ? \"TRUE\" : \"FALSE\" }}"
                    });
                }
                else
                {
                    columns.Add(new ModelColumn
                    {
                        DataType = DataType.String,
                        Name = prop.Name,
                        Template = "{{row." + prop.Name + "}}"
                    });
                }
            }

            var firstSort = false;

            foreach (var column in columns)
            {
                column.Label = column.Name.Humanize();
                column.EditorType = GetEditorTypeByDataType(column.DataType);

                // Grid attributes
                column.Searchable = column.DataType == DataType.String;
                column.Filter = true;
                column.Visible = true;
                column.Sortable = true;
                column.IsKey = false;
                column.SortOrder = 0;
                column.SortDirection = SortDirection.None;
                // Form attributes
                column.ShowLabel = true;
                column.Placeholder = "";
                column.Format = "";
                column.Help = "";
                column.Required = true;
                column.ReadOnly = false;

                if (!firstSort)
                {
                    column.IsKey = true;
                    column.SortOrder = 1;
                    column.SortDirection = SortDirection.Ascending;
                    firstSort = true;
                }
            }

            return columns;
        }

        /// <summary>
        /// Generates a array with a template for every column
        /// </summary>
        /// <param name="columns"></param>
        /// <returns></returns>
        public static List<string> GenerateFieldsArray(List<ModelColumn> columns)
        {
            var list = new List<string>();

            foreach (var column in columns)
            {
                var editorTag = UpperRegEx.Replace(column.EditorType, EditorName);
                var defaults = Common.FieldSettings[column.EditorType];

                list.Add("\r\n\t<" + editorTag + " name=\"" + column.Name + "\"" +
                         (defaults.EditorType ? "\r\n\t\teditor-type=\"" + column.DataType + "\" " : "") +
                         (defaults.ShowLabel
                             ? "\r\n\t\tlabel=\"" + column.Label + "\" show-label=\"" + column.ShowLabel + "\""
                             : "") +
                         (defaults.Placeholder ? "\r\n\t\tplaceholder=\"" + column.Placeholder + "\"" : "") +
                         (defaults.Required ? "\r\n\t\trequired=\"" + column.Required + "\"" : "") +
                         (defaults.ReadOnly ? "\r\n\t\tread-only=\"" + column.ReadOnly + "\"" : "") +
                         (defaults.Format ? "\r\n\t\tformat=\"" + column.Format + "\"" : "") +
                         (defaults.Help ? "\r\n\t\thelp=\"" + column.Help + "\"" : "") +
                         ">\r\n\t</" + editorTag + ">");
            }

            return list;
        }

        /// <summary>
        /// Generates the grid's cells markup
        /// </summary>
        /// <param name="columns"></param>
        /// <param name="mode"></param>
        /// <returns></returns>
        public static string GenerateCells(List<ModelColumn> columns, string mode)
        {
            var list = new List<string>();

            foreach (var column in columns)
            {
                var editorTag = UpperRegEx.Replace(column.EditorType, EditorName);

                list.Add("\r\n\t\t<tb-cell-template column-name=\"" + column.Name + "\">" +
                         "\r\n\t\t\t" +
                         (mode == "Inline"
                             ? "<" + editorTag + " is-editing=\"row.$isEditing\" value=\"row." + column.Name + "\">" +
                               "</" + editorTag + ">"
                             : column.Template) +
                         "\r\n\t\t</tb-cell-template>");
            }

            return string.Join("", list);
        }
    }
}