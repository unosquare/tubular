using System.Collections.Generic;

namespace Unosquare.Tubular.GenericModels
{
    /// <summary>
    /// Represents a application menu
    /// </summary>
    public class Menu
    {
        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the URL.
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the template URL.
        /// </summary>
        public string TemplateUrl { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this instance is visible.
        /// </summary>
        public bool IsVisible { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this instance is separator.
        /// </summary>
        public bool IsSeparator { get; set; }

        /// <summary>
        /// Gets or sets the URL link.
        /// </summary>
        public string UrlLink { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this link is function.
        /// </summary>
        public bool IsFunction { get; set; }
    }

    /// <summary>
    /// Represents a top menu
    /// </summary>
    /// <seealso cref="Unosquare.Tubular.GenericModels.Menu" />
    public class AppModule : Menu
    {
        /// <summary>
        /// Gets or sets a value indicating whether this instance is root and
        /// it doesn't show child menu
        /// </summary>
        public bool IsRoot { get; set; }

        /// <summary>
        /// Gets or sets the menus.
        /// </summary>
        public List<Menu> Menus { get; set; }
    }
}