namespace Unosquare.Tubular
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Dynamic.Core;
    using System.Linq.Expressions;
    using Unosquare.Tubular.ObjectModel;

    /// <summary>
    /// Extension methods to create chart responses
    /// </summary>
    public static class ChartsExtension
    {
        /// <summary>
        /// Creates a single serie chart from a IQueryable
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="R"></typeparam>
        /// <param name="datasource"></param>
        /// <param name="label"></param>
        /// <param name="value"></param>
        /// <param name="serieName"></param>
        /// <param name="aggregation"></param>
        /// <returns></returns>
        public static SingleSerieChartResponse<R> ProvideSingleSerieChartResponse<T, R>(this IQueryable<T> datasource,
            Expression<Func<T, string>> label, Expression<Func<T, R>> value, string serieName = null,
            AggregationFunction aggregation = AggregationFunction.Sum)
        {
            var labelExpression = label.Body is MemberExpression
                ? (MemberExpression) label.Body
                : ((MemberExpression) ((UnaryExpression) label.Body).Operand);

            var valueExpression = value.Body is MemberExpression
                ? (MemberExpression) value.Body
                : ((MemberExpression) ((UnaryExpression) value.Body).Operand);

            var dataSelector = GenerateDataSelector(aggregation, valueExpression);

            var data =
                datasource.GroupBy(labelExpression.Member.Name, "it")
                    .Select(string.Format("new (it.Key as Label, {0} as Data)", dataSelector));

            return new SingleSerieChartResponse<R>
            {
                Data = data.Select("Data").Cast<R>().ToArray(),
                SerieName = serieName,
                Labels = data.Select("Label").Cast<string>().ToArray(),
            };
        }

        private static string GenerateDataSelector(AggregationFunction aggregation, MemberExpression valueExpression)
        {
            var dataSelector = string.Empty;

            if (aggregation == AggregationFunction.Count || aggregation == AggregationFunction.DistinctCount)
            {
                // TODO: DISTINCT is tricky and Ricky is a friend of mine
                dataSelector = "COUNT()";
            }
            else
            {
                dataSelector = string.Format("{0}(it.{1})", aggregation.ToString().ToUpper(),
                    valueExpression.Member.Name);
            }

            return dataSelector;
        }

        /// <summary>
        /// Creates a multiple series chart from a IQueryable
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="R"></typeparam>
        /// <param name="datasource"></param>
        /// <param name="label"></param>
        /// <param name="serie"></param>
        /// <param name="value"></param>
        /// <param name="aggregation"></param>
        /// <returns></returns>
        public static MultipleSerieChartResponse<R> ProvideMultipleSerieChartResponse<T, R>(
            this IQueryable<T> datasource, Expression<Func<T, string>> label, Expression<Func<T, string>> serie,
            Expression<Func<T, R>> value, AggregationFunction aggregation = AggregationFunction.Sum)
        {
            // Series are filters

            var labelExpression = label.Body is MemberExpression
                ? (MemberExpression) label.Body
                : ((MemberExpression) ((UnaryExpression) label.Body).Operand);

            var serieExpression = serie.Body is MemberExpression
                ? (MemberExpression) serie.Body
                : ((MemberExpression) ((UnaryExpression) serie.Body).Operand);

            var valueExpression = value.Body is MemberExpression
                ? (MemberExpression) value.Body
                : ((MemberExpression) ((UnaryExpression) value.Body).Operand);

            var dataSelector = GenerateDataSelector(aggregation, valueExpression);

            var series =
                datasource.OrderBy(serieExpression.Member.Name)
                    .Select(serieExpression.Member.Name)
                    .Cast<string>()
                    .Distinct()
                    .ToList();
            var labels =
                datasource.OrderBy(labelExpression.Member.Name)
                    .Select(labelExpression.Member.Name)
                    .Cast<string>()
                    .Distinct()
                    .ToList();
            var data = new List<List<decimal>>();

            foreach (var serieValue in series)
            {
                var subset = datasource.Where(string.Format("{0} == @0", serieExpression.Member.Name), serieValue)
                    .GroupBy(labelExpression.Member.Name, "it")
                    .Select(string.Format("new (it.Key as Label, {0} as Data)", dataSelector));

                var tempData = subset.Select("Data").Cast<decimal>().ToList();
                var subsetLabels = subset.Select("Label").Cast<string>().ToList();

                var unkwnownLabels = labels.Except(subsetLabels);

                foreach (var item in unkwnownLabels)
                {
                    var index = labels.IndexOf(item);
                    tempData.Insert(index, 0);
                }

                data.Add(tempData);
            }

            return new MultipleSerieChartResponse<R>
            {
                Data = data.Select(x => x.Cast<R>().ToArray()).ToArray(),
                Labels = labels.ToArray(),
                Series = series.ToArray()
            };
        }
    }
}