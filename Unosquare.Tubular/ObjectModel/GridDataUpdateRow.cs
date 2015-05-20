namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents an non-optimistic row.
    /// 
    /// The Old property contains the original model and the New property
    /// the changes to commit.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class GridDataUpdateRow<T> where T : class
    {
        /// <summary>
        /// Original model
        /// </summary>
        public T Old { get; set; }
        /// <summary>
        /// Changed model
        /// </summary>
        public T New { get; set; }
    }
}
