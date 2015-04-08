
namespace Unosquare.Tubular.ObjectModel
{
    public class GridDataRequest
    {
        public int Counter { get; set; }
        public Filter Search { get; set; }
        public int Skip { get; set; }
        public int Take { get; set; }
        public GridColumn[] Columns { get; set; }
        public int TimezoneOffset { get; set; }
    }
}
