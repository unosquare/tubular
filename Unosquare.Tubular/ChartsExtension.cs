using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular
{
    /// <summary>
    /// Extension methods to create chart responses
    /// </summary>
    public static class ChartsExtension
    {
        public static SingleSerieChartResponse<R> GetSingleSerieChartResponse<T, R>(this IQueryable<T> datasource, Expression<Func<T, string>> label, Expression<Func<T, R>> value, AggregationFunction aggregation = AggregationFunction.Sum)
        {
            var labelExpression = label.Body is MemberExpression
                ? (MemberExpression)label.Body
                : ((MemberExpression)((UnaryExpression)label.Body).Operand);

            var valueExpression = value.Body is MemberExpression
                ? (MemberExpression)value.Body
                : ((MemberExpression)((UnaryExpression)value.Body).Operand);

            var dataSelector = string.Empty;

            if (aggregation == AggregationFunction.Count || aggregation == AggregationFunction.DistinctCount)
            {
                // TODO: DISTINCT is tricky and Ricky is a friend of mine
                dataSelector = "COUNT()";
            }
            else
            {
                dataSelector = string.Format("{0}(it.{1})", aggregation.ToString().ToUpper(), valueExpression.Member.Name);
            }

            var data = datasource.GroupBy(labelExpression.Member.Name, "it").Select(String.Format("new (it.Key as Label, {0} as Data)", dataSelector));

            return new SingleSerieChartResponse<R>
            {
                Data = data.Select("Data").Cast<R>().ToArray(),
                Labels = data.Select("Label").Cast<string>().ToArray(),
            };
        }
    }
}