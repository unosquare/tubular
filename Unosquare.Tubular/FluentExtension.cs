namespace Unosquare.Tubular
{
    using Unosquare.Tubular.ObjectModel;

    /// <summary>
    /// Fluent Extension Methods
    /// </summary>
    public static class FluentExtension
    {
        /// <summary>
        /// Sets a Secure URL to Grid Options
        /// </summary>
        /// <param name="options"></param>
        /// <param name="url"></param>
        /// <param name="method"></param>
        /// <returns></returns>
        public static GridOptions WithSecureUrl(this GridOptions options, string url, string method = "POST")
        {
            options.RequireAuthentication = true;
            options.DataUrl = url;
            options.RequestMethod = method;

            return options;
        }
    }
}