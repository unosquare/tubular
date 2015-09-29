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
        /// Generates a Dynamic data source from a model using the Data Sources in the Repository
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public IQueryable GetDataSource(GridDataRequest model)
        {
            var sources = model.Columns.Select(x => x.Name.Split('_')[0]).Distinct().ToList();

            if (sources.Any() == false) return null;

            var mainSource = this.FirstOrDefault(x => x.Name == sources.First());

            if (mainSource == null) return null;

            var datasource = mainSource.GetSource();
            var singleTable = true;
            var possibleJoins = this.SelectMany(x => x.Joins.Select(y => y)).ToArray();
            var joins = new List<IDataSourceJoinConfig>();

            // First validate joins and try to create anything missing
            foreach (var secondSource in sources.Skip(1))
            {
                var join = mainSource.Joins.FirstOrDefault(x => x.Name2 == secondSource);

                if (join == null)
                {
                    var possibleJoin =
                        possibleJoins.FirstOrDefault(
                            x => mainSource.Joins.Any(y => y.Name2 == x.Name1) && x.Name2 == secondSource);

                    if (possibleJoin != null)
                    {
                        if (joins.Any(x => x.Name1 == mainSource.Name && x.Name2 == possibleJoin.Name1) == false)
                            joins.Add(mainSource.Joins.First(x => x.Name2 == possibleJoin.Name1));

                        joins.Add(possibleJoin);
                    }
                    else
                    {
                        throw new Exception(string.Format("Unknown join between {0} and {1} sources", secondSource,
                            sources.First()));
                    }
                }
                else
                {
                    if (joins.Any(x => x.Name1 == mainSource.Name && x.Name2 == secondSource)) continue;

                    joins.Add(join);
                }
            }

            var firstJoin = true;
            var currentItems = new List<string>();

            foreach (var join in joins)
            {
                if (firstJoin)
                {
                    currentItems.Add(join.Name1);
                }

                singleTable = false;

                var selector = firstJoin
                    ? string.Format("new (outer as {0}, inner as {1})", join.Name1, join.Name2)
                    : "new (" + string.Join(", ", currentItems.Select(x => "outer." + x + " as " + x)) +
                      string.Format(", inner as {0})", join.Name2);

                datasource = datasource.Join(this.First(x => x.Name == join.Name2).GetSource(), firstJoin
                    ? join.Key1
                    : join.Name1 + "." + join.Key1, join.Key2, selector);

                currentItems.Add(join.Name2);

                if (firstJoin) firstJoin = false;
            }

            if (model.Columns.Any(x => x.MetaAggregate != AggregationFunction.None))
            {
                var keyColumns = model.Columns.Where(x => x.MetaAggregate == AggregationFunction.None).ToList();

                datasource = datasource.GroupBy("new (" +
                                                string.Join(",",
                                                    keyColumns.Select(
                                                        x =>
                                                            singleTable
                                                                ? x.Name.Split('_')[1]
                                                                : x.Name.Replace("_", ".") + " as " +
                                                                  x.Name))
                                                + ")", "it");

                var groupSelection =
                    keyColumns.Select(x => "it.Key." + (singleTable ? x.Name.Split('_')[1] : x.Name) + " as " + x.Name)
                        .ToList();

                foreach (var column in model.Columns.Where(x => x.MetaAggregate != AggregationFunction.None))
                {
                    if (column.MetaAggregate == AggregationFunction.Count ||
                        column.MetaAggregate == AggregationFunction.DistinctCount)
                    {
                        // TODO: DISTINCT is tricky and Ricky is a friend of mine
                        groupSelection.Add(string.Format("COUNT() as {0}", column.Name));
                    }
                    else
                    {
                        groupSelection.Add(string.Format("{0}(it.{1}) as {2}", column.MetaAggregate.ToString().ToUpper(),
                            (singleTable ? column.Name.Split('_')[1] : column.Name.Replace("_", ".")), column.Name));
                    }
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

        /// <summary>
        /// Generates a ModelColumn list
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public List<ModelColumn> GenerateModels(DataSourceItemModel[] data)
        {
            var columns = new List<ModelColumn>();

            foreach (var model in data)
            {
                var column = new ModelColumn
                {
                    DataType = model.DataType,
                    Name = model.DataSource + "_" + model.Column,
                    Label = string.IsNullOrWhiteSpace(model.Label) ? model.Column.Humanize() : model.Label,
                    Visible = true,
                    Sortable = true,
                    MetaAggregate = model.Aggregation,
                    HasFilter = true
                };

                column.Template = CodeGenerator.GetTemplateByDataType(column.Name, column.DataType);
                column.EditorType = CodeGenerator.GetEditorTypeByDataType(column.DataType);
                column.Searchable = column.DataType == DataType.String;

                if (string.IsNullOrWhiteSpace(model.Filter) == false)
                {
                    column.Filter = new Filter();

                    if (model.Filter.StartsWith("="))
                    {
                        column.Filter.Text = model.Filter.Substring(1);
                        column.Filter.Operator = CompareOperators.Contains;
                    }
                    else if (model.Filter.StartsWith("!="))
                    {
                        column.Filter.Text = model.Filter.Substring(2);
                        column.Filter.Operator = CompareOperators.NotContains;
                    }
                }

                columns.Add(column);
            }

            return columns;
        }

        /// <summary>
        /// Gets the DataSource metadata
        /// </summary>
        /// <returns></returns>
        public DataSourceMetadata GetMetadata()
        {
            return new DataSourceMetadata
            {
                DataSources = this,
                AggregationFunctions = Enum.GetNames(typeof (AggregationFunction)),
                Types = Enum.GetNames(typeof (DataType))
            };
        }
    }
}