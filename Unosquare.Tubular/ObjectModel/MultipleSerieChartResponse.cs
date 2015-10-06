namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a multiple serie chart response
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class MultipleSerieChartResponse<T>
    {
        /// <summary>
        /// The chart response data
        /// </summary>
        public T[][] Data;
        /// <summary>
        /// The chart labels
        /// </summary>
        public string[] Labels;
        /// <summary>
        /// The chart series
        /// </summary>
        public string[] Series;
    }
}