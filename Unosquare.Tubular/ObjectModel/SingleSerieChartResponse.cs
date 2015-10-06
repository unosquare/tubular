namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Creates a single-serie chart reponse
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class SingleSerieChartResponse<T>
    {
        /// <summary>
        /// The chart response data
        /// </summary>
        public T[] Data;
        /// <summary>
        /// The chart labels
        /// </summary>
        public string[] Labels;
        /// <summary>
        /// The serie name
        /// </summary>
        public string SerieName;
    }
}
