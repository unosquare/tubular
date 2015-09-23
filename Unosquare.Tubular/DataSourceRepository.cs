using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular
{
    /// <summary>
    /// Repository to save data sources
    /// </summary>
    public class DataSourceRepository : List<IDataSourceConfig>
    {
        /// <summary>
        /// Generates a Dynamic datasource from a model using the Data Sources in the Repository
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public IQueryable GetDataSource(GridDataRequest model)
        {
            var sources = model.Columns.Select(x => x.Name.Split('_')[0]).Distinct().ToArray();

            if (sources.Any() == false) return null;

            var mainSource = this.FirstOrDefault(x => x.Name == sources.First());

            if (mainSource == null) return null;

            var datasource = mainSource.GetSource();
            var singleTable = true;
            var previousJoin = string.Empty;
            var previousKey1 = string.Empty;

            foreach (var secondSource in sources.Skip(1))
            {
                singleTable = false;

                if (mainSource.Joins.Any(x => x.Name2 == secondSource) == false)
                    throw new Exception(string.Format("Unknown join betweeb {0} and {1} sources", secondSource,
                        sources.First()));

                var join = mainSource.Joins.First(x => x.Name2 == secondSource);

                previousJoin = string.IsNullOrWhiteSpace(previousJoin)
                    ? join.Selector
                    : Common.ReplaceJoin
                        .Replace(previousJoin, (m) =>
                        {
                            var x = m.ToString();
                            var index = previousJoin.IndexOf(x);

                            if (index > 0 && previousJoin[index - 1] == '.')
                                return x;

                            return sources.First() + "." + x;
                        })
                        .Replace(")", join.Selector2);

                previousKey1 = string.IsNullOrWhiteSpace(previousKey1)
                    ? join.Key1
                    : previousKey1 + join.Key1;

                datasource = datasource.Join(sources.First(),
                    this.First(x => x.Name == secondSource).GetSource(),
                    secondSource, previousKey1, join.Key2, previousJoin);

                previousKey1 = sources.First() + ".";
            }

            if (model.Columns.Any(x => x.MetaAggregate != AggregationFunction.None))
            {
                var keyColumns = model.Columns.Where(x => x.MetaAggregate == AggregationFunction.None);

                datasource = datasource.GroupBy("new (" +
                                                string.Join(",",
                                                    keyColumns.Select(
                                                        x =>
                                                            singleTable
                                                                ? x.Name.Split('_')[1]
                                                                : x.Name.Replace("_", ".") + " as " +
                                                                  x.Name))
                                                + ")", "it");

                var groupSelection = keyColumns.Select(x => "it.Key." + x.Name + " as " + x.Name).ToList();

                foreach (var column in model.Columns.Where(x => x.MetaAggregate != AggregationFunction.None))
                {
                    groupSelection.Add(string.Format("{0}(it.{1}) as {2}", column.MetaAggregate.ToString().ToUpper(),
                        (singleTable ? column.Name.Split('_')[1] : column.Name.Replace("_", ".")), column.Name));
                }

                var groupSelector = "new (" + string.Join(",", groupSelection) + ")";

                return datasource.Select(groupSelector);
            }

            var selection = "new (" +
                            string.Join(",",
                                model.Columns.Select(
                                    x =>
                                        (singleTable ? x.Name.Split('_')[1] : x.Name.Replace("_", ".")) + " as " +
                                        x.Name)) +
                            ")";

            return datasource.Select(selection);
        }

        /// <summary>
        /// Generates a GridDataResponse from a model
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public GridDataResponse CreateGridDataResponseFromDataSource(GridDataRequest model)
        {
            return model.CreateGridDataResponse(GetDataSource(model));
        }
    }
}