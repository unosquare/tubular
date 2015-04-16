using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular
{
    public static class Extensions
    {
        private static readonly object SyncRoot = new object();

        private static readonly Dictionary<Type, Dictionary<string, PropertyInfo>> TypePropertyCache =
            new Dictionary<Type, Dictionary<string, PropertyInfo>>();

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static Dictionary<string, PropertyInfo> ExtractProperties(Type t)
        {
            Dictionary<string, PropertyInfo> properties;
            lock (SyncRoot)
            {
                if (TypePropertyCache.ContainsKey(t))
                {
                    properties = TypePropertyCache[t];
                }
                else
                {
                    properties = t.GetProperties()
                        .Where(p => Common.PrimitiveTypes.Contains(p.PropertyType) && p.CanRead)
                        .ToDictionary(k => k.Name, v => v);

                    TypePropertyCache[t] = properties;
                }
            }

            return properties;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static Dictionary<GridColumn, PropertyInfo> MapColumnsToProperties(GridColumn[] columns,
            Dictionary<string, PropertyInfo> properties)
        {
            var columnMap = new Dictionary<GridColumn, PropertyInfo>(columns.Length);

            foreach (var column in columns)
            {
                if (properties.ContainsKey(column.Name))
                    columnMap[column] = properties[column.Name];
            }

            return columnMap;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static List<List<object>> CreateGridPayload(IQueryable subset,
            Dictionary<GridColumn, PropertyInfo> columnMap, int initialCapacity, int timezoneOffset)
        {
            var payload = new List<List<object>>(initialCapacity);

            foreach (var item in subset)
            {
                var payloadItem = new List<object>(columnMap.Keys.Count);

                foreach (var value in columnMap.Select(m => m.Value.GetValue(item)))
                {
                    if (value is DateTime)
                        payloadItem.Add(((DateTime)value).AddMinutes(-timezoneOffset));
                    else
                        payloadItem.Add(value);
                }

                payload.Add(payloadItem);
            }

            return payload;
        }

        public static GridDataResponse CreateGridDataResponse(this GridDataRequest request, IQueryable dataSource)
        {
            var response = new GridDataResponse
            {
                Counter = request.Counter,
                TotalRecordCount = dataSource.Count(),
                FilteredRecordCount = dataSource.Count()
            };

            Dictionary<string, PropertyInfo> properties = ExtractProperties(dataSource.ElementType);
            Dictionary<GridColumn, PropertyInfo> columnMap = MapColumnsToProperties(request.Columns, properties);

            var subset = dataSource;

            // Perform Searching
            var searchLambda = new StringBuilder();
            var searchParamArgs = new List<object>();

            switch (request.Search.Operator)
            {
                case CompareOperators.Auto:

                    foreach (var column in request.Columns.Where(x => x.Searchable))
                    {
                        searchLambda.AppendFormat("{0}.Contains(@{1}) ||", column.Name, searchParamArgs.Count);
                        searchParamArgs.Add(request.Search.Text);
                    }

                    break;
            }

            // Perform Filtering
            foreach (var column in request.Columns.Where(x => x.Filter != null))
            {
                if (String.IsNullOrWhiteSpace(column.Filter.Text) && column.Filter.Argument == null)
                    continue; // TODO: Handle null?

                switch (column.Filter.Operator)
                {
                    case CompareOperators.Equals:
                        if (String.IsNullOrWhiteSpace(column.Filter.Text)) continue;
                        searchLambda.AppendFormat("{0} == @{1} &&", column.Name, searchParamArgs.Count);

                        if (column.DataType == DataType.Numeric.ToString().ToLower())
                            searchParamArgs.Add(Decimal.Parse(column.Filter.Text));
                        else if (column.DataType == DataType.DateTime.ToString().ToLower())
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));
                        else if (column.DataType == DataType.Boolean.ToString().ToLower())
                            searchParamArgs.Add(Boolean.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(column.Filter.Text);

                        break;
                    case CompareOperators.Contains:
                        searchLambda.AppendFormat("{0}.Contains(@{1}) &&", column.Name, searchParamArgs.Count);
                        searchParamArgs.Add(column.Filter.Text);
                        break;
                    case CompareOperators.StartsWith:
                        searchLambda.AppendFormat("{0}.StartsWith(@{1}) &&", column.Name, searchParamArgs.Count);
                        searchParamArgs.Add(column.Filter.Text);
                        break;
                    case CompareOperators.EndsWith:
                        searchLambda.AppendFormat("{0}.EndsWith(@{1}) &&", column.Name, searchParamArgs.Count);
                        searchParamArgs.Add(column.Filter.Text);
                        break;
                    case CompareOperators.Gte:
                        searchLambda.AppendFormat("{0} >= @{1} &&", column.Name, searchParamArgs.Count);

                        if (column.DataType == DataType.Numeric.ToString().ToLower())
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));

                        break;
                    case CompareOperators.Gt:
                        searchLambda.AppendFormat("{0} > @{1} &&", column.Name, searchParamArgs.Count);

                        if (column.DataType == DataType.Numeric.ToString().ToLower())
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));

                        break;
                    case CompareOperators.Lte:
                        searchLambda.AppendFormat("{0} <= @{1} &&", column.Name, searchParamArgs.Count);

                        if (column.DataType == DataType.Numeric.ToString().ToLower())
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));

                        break;
                    case CompareOperators.Lt:
                        searchLambda.AppendFormat("{0} < @{1} &&", column.Name, searchParamArgs.Count);

                        if (column.DataType == DataType.Numeric.ToString().ToLower())
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));

                        break;
                    case CompareOperators.Multiple:
                        if (column.Filter.Argument == null || column.Filter.Argument.Length == 0) continue;

                        var filterString = "(";
                        foreach (var filter in column.Filter.Argument)
                        {
                            filterString += String.Format("{0} == @{1} ||", column.Name, searchParamArgs.Count);
                            searchParamArgs.Add(filter);
                        }

                        if (filterString.Length == 1) continue;

                        searchLambda.AppendFormat(filterString.Remove(filterString.Length - 3, 3) + ") &&");

                        break;
                    case CompareOperators.Between:
                        if (column.Filter.Argument == null || column.Filter.Argument.Length == 0) continue;

                        searchLambda.AppendFormat("(({0} >= @{1}) &&  ({0} <= @{2})) &&", column.Name,
                            searchParamArgs.Count, searchParamArgs.Count + 1);

                        if (column.DataType == DataType.Numeric.ToString().ToLower())
                        {
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                            searchParamArgs.Add(decimal.Parse(column.Filter.Argument[0]));
                        }
                        else
                        {
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Argument[0]));
                        }

                        break;
                }
            }

            if (searchLambda.Length > 0)
            {
                subset = subset.Where(searchLambda.Remove(searchLambda.Length - 3, 3).ToString(),
                    searchParamArgs.ToArray());

                response.FilteredRecordCount = subset.Count();
            }

            // Perform Sorting
            var orderingExpression = string.Empty;
            foreach (var column in request.Columns.Where(x => x.SortOrder > 0).OrderBy(x => x.SortOrder))
            {
                orderingExpression += column.Name + " " +
                                      (column.SortDirection == SortDirection.Ascending ? "ASC" : "DESC") + ", ";
            }

            // Apply the sorting expression if supplied
            if (!string.IsNullOrWhiteSpace(orderingExpression))
            {
                subset = subset.OrderBy(orderingExpression.Substring(0, orderingExpression.Length - 2));
            }
            else
            {
                subset = subset.OrderBy(request.Columns.First().Name + " ASC");
            }

            subset = subset.Skip(request.Skip)
                .Take(request.Take);

            var pageSize = request.Take;
            response.TotalPages = (response.FilteredRecordCount + pageSize - 1) / pageSize;

            if (response.TotalPages > 0)
            {
                response.CurrentPage = 1 +
                                       (int)((request.Skip / (float)response.FilteredRecordCount) * response.TotalPages);
            }

            response.Payload = CreateGridPayload(subset, columnMap, pageSize, request.TimezoneOffset);

            return response;
        }

        public static IQueryable CreateDynamicFilteredSet(this IQueryable dataSource, string fieldName, string filter)
        {
            return dataSource.Where(String.Format("{0}.Contains(@0)", fieldName), new[] {filter});
        }

        public static IQueryable CreateTypeAheadList(this IQueryable dataSource, string fieldName, string filter)
        {
            // TODO: I need to connect this to a better platform
            return dataSource.CreateDynamicFilteredSet(fieldName, filter)
                .Select(fieldName)
                .Distinct()
                .Take(8);
        }
    }

    public enum SortDirection
    {
        None,
        Ascending,
        Descending
    }

    public enum CompareOperators
    {
        None,
        Auto,
        Equals,
        Contains,
        StartsWith,
        EndsWith,
        Gte,
        Gt,
        Lte,
        Lt,
        Multiple,
        Between
    }

    public enum DataType
    {
        String,
        Numeric,
        DateTime,
        Date,
        Boolean
    }

    public class Common
    {
        static public readonly Type[] PrimitiveTypes =
        { 
            typeof(string), 
            typeof(DateTime),
            typeof(DateTimeOffset),
            typeof(bool), 
            typeof(byte), 
            typeof(sbyte),
            typeof(char), 
            typeof(decimal),
            typeof(double),
            typeof(float), 
            typeof(int), 
            typeof(uint), 
            typeof(long),
            typeof(ulong),
            typeof(short), 
            typeof(ushort),
            typeof(DateTime?),
            typeof(DateTimeOffset?),
            typeof(bool?), 
            typeof(byte?), 
            typeof(sbyte?),
            typeof(char?), 
            typeof(decimal?),
            typeof(double?),
            typeof(float?), 
            typeof(int?), 
            typeof(uint?), 
            typeof(long?),
            typeof(ulong?),
            typeof(short?), 
            typeof(ushort?),
            typeof(Guid),
            typeof(Guid?)
        };
    }
}