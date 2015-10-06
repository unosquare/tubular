using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Represents a multiple serie chart response
    /// </summary>
    /// <typeparam name="L"></typeparam>
    public class MultipleSerieChartResponse<L>
    {
        /// <summary>
        /// The chart response data
        /// </summary>
        public L[][] Data;
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