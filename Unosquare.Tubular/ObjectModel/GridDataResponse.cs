using System.Collections.Generic;

namespace Unosquare.Tubular.ObjectModel
{
    public class GridDataResponse
    {
        public int Counter { get; set; }
        public List<List<object>> Payload { get; set; }
        public int TotalRecordCount { get; set; }
        public int FilteredRecordCount { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
    }
}
