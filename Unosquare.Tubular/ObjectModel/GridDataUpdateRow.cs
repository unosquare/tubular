
namespace Unosquare.Tubular.ObjectModel
{
    public class GridDataUpdateRow<T> where T : class
    {
        public T Old { get; set; }
        public T New { get; set; }
    }
}
