using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Net.Http;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular
{
    /// <summary>
    /// Extensions methods
    /// </summary>
    public static class Extensions
    {
        private static readonly Regex TimezoneOffset = new Regex(@"timezoneOffset=(\d[^&]*)");

        private static readonly object SyncRoot = new object();

        private static readonly ConcurrentDictionary<Type, Dictionary<string, PropertyInfo>> TypePropertyCache = new ConcurrentDictionary<Type, Dictionary<string, PropertyInfo>>();

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static Dictionary<string, PropertyInfo> ExtractProperties(Type t)
        {
            return TypePropertyCache.GetOrAdd(t, GetTypeProperties);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static Dictionary<string, PropertyInfo> GetTypeProperties(Type t)
        {
            return t.GetProperties()
                    .Where(p => Common.PrimitiveTypes.Contains(p.PropertyType) && p.CanRead)
                    .ToDictionary(k => k.Name, v => v);
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

                foreach (var column in columnMap.Select(m => new {Value = m.Value.GetValue(item), m.Key}))
                {
                    if (column.Value is DateTime)
                    {
                        if (column.Key.DataType == DataType.DateTimeUtc ||
                            TubularDefaultSettings.AdjustTimezoneOffset == false)
                            payloadItem.Add(((DateTime) column.Value));
                        else
                            payloadItem.Add(((DateTime) column.Value).AddMinutes(-timezoneOffset));
                    }
                    else
                    {
                        payloadItem.Add(column.Value);
                    }
                }

                payload.Add(payloadItem);
            }

            return payload;
        }

        /// <summary>
        /// Adjust a timezone data in a object
        /// </summary>
        /// <param name="data"></param>
        /// <param name="timezoneOffset"></param>
        /// <returns></returns>
        public static object AdjustTimeZone(object data, int timezoneOffset)
        {
            var properties = data.GetType().GetProperties().Where(x => x.PropertyType == typeof (DateTime));

            foreach (var prop in properties)
            {
                if (!(prop.GetValue(data) is DateTime)) continue;

                var value = (DateTime) prop.GetValue(data);
                value = value.AddMinutes(-timezoneOffset);
                prop.SetValue(data, value);
            }

            return data;
        }

        /// <summary>
        /// Checks the datetime properties in an object and adjust the timezone.
        /// </summary>
        /// <param name="request">The Http Request</param>
        /// <param name="data">The output object</param>
        /// <param name="fromLocal"></param>
        /// <returns></returns>
        public static object AdjustObjectTimeZone(this HttpRequestMessage request, object data, bool fromLocal = false)
        {
            var query = request.RequestUri.Query;

            if (string.IsNullOrWhiteSpace(query)) return data;

            var match = TimezoneOffset.Match(query);

            if (!match.Success) return data;
            var timeDiff = int.Parse(match.Groups[1].Value);
            if (fromLocal) timeDiff *= -1;

            return AdjustTimeZone(data, timeDiff);
        }

        /// <summary>
        /// Delegates a process to format a subset response
        /// </summary>
        /// <param name="dataSource">The datasource</param>
        public delegate IQueryable ProcessResponseSubset(IQueryable dataSource);

        /// <summary>
        /// Generates a GridDataReponse using the GridDataRequest and an IQueryable source,
        /// like a DataSet in Entity Framework.
        /// </summary>
        /// <param name="request">The Tubular's grid request</param>
        /// <param name="dataSource">The IQueryable source</param>
        /// <returns></returns>
        public static GridDataResponse CreateGridDataResponse(this GridDataRequest request, IQueryable dataSource)
        {
            return CreateGridDataResponse(request, dataSource, null);
        }

        /// <summary>
        /// Generates a GridDataReponse using the GridDataRequest and an IQueryable source,
        /// like a DataSet in Entity Framework.
        /// </summary>
        /// <param name="request">The Tubular's grid request</param>
        /// <param name="dataSource">The IQueryable source</param>
        /// <param name="preProcessSubset">The subset's process delegate</param>
        /// <returns></returns>
        public static GridDataResponse CreateGridDataResponse(this GridDataRequest request, IQueryable dataSource,
            ProcessResponseSubset preProcessSubset)
        {
            if (request == null) throw new InvalidOperationException("The GridDataRequest is null");

            var response = new GridDataResponse
            {
                Counter = request.Counter,
                TotalRecordCount = dataSource.Count(),
                FilteredRecordCount = dataSource.Count()
            };

            var properties = ExtractProperties(dataSource.ElementType);
            var columnMap = MapColumnsToProperties(request.Columns, properties);

            var subset = FilterResponse(request, dataSource, response);


            // Perform Sorting
            var orderingExpression = request.Columns.Where(x => x.SortOrder > 0).OrderBy(x => x.SortOrder)
                .Aggregate(string.Empty,
                    (current, column) =>
                        current +
                        (column.Name + " " + (column.SortDirection == SortDirection.Ascending ? "ASC" : "DESC") + ", "));

            // Apply the sorting expression if supplied
            subset = !string.IsNullOrWhiteSpace(orderingExpression)
                ? subset.OrderBy(orderingExpression.Substring(0, orderingExpression.Length - 2))
                : subset.OrderBy(request.Columns.First().Name + " ASC");

            // Check aggregations before paging
            // Should it aggregate before filtering too?
            response.AggregationPayload = new Dictionary<string, object>();

            foreach (var column in request.Columns)
            {
                switch (column.Aggregate)
                {
                    case AggregationFunction.Sum:
                        // we try to select the column as decimal? and sum it
                        if (subset.ElementType.GetProperty(column.Name).PropertyType == typeof (double))
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<double?>().Sum());
                        }
                        else
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<decimal?>().Sum());
                        }

                        break;
                    case AggregationFunction.Average:
                        if (subset.ElementType.GetProperty(column.Name).PropertyType == typeof (double))
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<double?>().Average());
                        }
                        else
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<decimal?>().Average());
                        }

                        break;
                    case AggregationFunction.Max:
                        if (subset.ElementType.GetProperty(column.Name).PropertyType == typeof (double))
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<double?>().Max());
                        }
                        else
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<decimal?>().Max());
                        }

                        break;
                    case AggregationFunction.Min:
                        if (subset.ElementType.GetProperty(column.Name).PropertyType == typeof (double))
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<double?>().Min());
                        }
                        else
                        {
                            response.AggregationPayload.Add(column.Name,
                                subset.Select(column.Name).Cast<decimal?>().Min());
                        }

                        break;
                    case AggregationFunction.Count:
                        response.AggregationPayload.Add(column.Name, subset.Select(column.Name).Cast<string>().Count());
                        break;
                    case AggregationFunction.DistinctCount:
                        response.AggregationPayload.Add(column.Name,
                            subset.Select(column.Name).Cast<string>().Distinct().Count());
                        break;
                    case AggregationFunction.None:
                        break;
                    default:
                        response.AggregationPayload.Add(column.Name, 0);
                        break;
                }
            }

            var pageSize = request.Take;

            // Take with value -1 represents entire set
            if (request.Take == -1)
            {
                response.TotalPages = 1;
                response.CurrentPage = 1;
                pageSize = subset.Count();
                subset = subset.Skip(request.Skip);
            }
            else
            {
                response.TotalPages = (response.FilteredRecordCount + pageSize - 1)/pageSize;

                if (response.TotalPages > 0)
                {
                    response.CurrentPage = 1 +
                                           (int)
                                               Math.Truncate((request.Skip/(float) response.FilteredRecordCount)*
                                                             response.TotalPages);

                    if (response.CurrentPage > response.TotalPages)
                    {
                        response.CurrentPage = response.TotalPages;
                        request.Skip = (response.CurrentPage - 1)*request.Take;
                    }

                    if (request.Skip < 0) request.Skip = 0;

                    subset = subset.Skip(request.Skip);
                }

                subset = subset.Take(request.Take);
            }

            // Generate the response data in a suitable format
            if (preProcessSubset != null)
                subset = preProcessSubset(subset);

            response.Payload = CreateGridPayload(subset, columnMap, pageSize, request.TimezoneOffset);
            return response;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static string GetSqlOperator(CompareOperators op)
        {
            switch (op)
            {
                case CompareOperators.Equals:
                    return "==";
                case CompareOperators.NotEquals:
                    return "!=";
                case CompareOperators.Gte:
                    return ">=";
                case CompareOperators.Gt:
                    return ">";
                case CompareOperators.Lte:
                    return "<=";
                case CompareOperators.Lt:
                    return "<";
                default:
                    return null;
            }
        }

        private static IQueryable FilterResponse(GridDataRequest request, IQueryable subset, GridDataResponse response)
        {
            var isDbQuery = subset.GetType().GetTypeInfo().IsGenericType &&
                            subset.GetType().GetInterfaces().Any(y => y == typeof (IListSource));

            // Perform Searching
            var searchLambda = new StringBuilder();
            var searchParamArgs = new List<object>();
            var searchValue = isDbQuery ? request.Search.Text : request.Search.Text.ToLowerInvariant();

            switch (request.Search.Operator)
            {
                case CompareOperators.Auto:
                    var filter = string.Empty;
                    var values = new List<object>();

                    if (request.Columns.Any(x => x.Searchable))
                        filter = "(";

                    foreach (var column in request.Columns.Where(x => x.Searchable))
                    {
                        filter += string.Format(isDbQuery
                            ? "{0}.Contains(@{1}) ||"
                            : "({0} != null && {0}.ToLowerInvariant().Contains(@{1})) ||", column.Name, values.Count);

                        values.Add(searchValue);
                    }

                    if (string.IsNullOrEmpty(filter) == false)
                    {
                        searchLambda.Append(filter.Remove(filter.Length - 3, 3) + ") &&");
                        searchParamArgs.AddRange(values);
                    }

                    break;
            }

            // Perform Filtering
            foreach (
                var column in
                    request.Columns.Where(x => x.Filter != null)
                        .Where(
                            column => !string.IsNullOrWhiteSpace(column.Filter.Text) || column.Filter.Argument != null))
            {
                column.Filter.HasFilter = true;

                switch (column.Filter.Operator)
                {
                    case CompareOperators.Equals:
                    case CompareOperators.NotEquals:
                        if (string.IsNullOrWhiteSpace(column.Filter.Text)) continue;

                        if (column.DataType == DataType.Date)
                        {
                            searchLambda.AppendFormat(
                                column.Filter.Operator == CompareOperators.Equals
                                    ? "({0} >= @{1} && {0} <= @{2}) &&"
                                    : "({0} < @{1} || {0} > @{2}) &&", column.Name,
                                searchParamArgs.Count, searchParamArgs.Count + 1);
                        }
                        else
                        {
                            searchLambda.AppendFormat("{0} {2} @{1} &&", column.Name, searchParamArgs.Count,
                                GetSqlOperator(column.Filter.Operator));
                        }

                        switch (column.DataType)
                        {
                            case DataType.Numeric:
                                searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                                break;
                            case DataType.DateTime:
                            case DataType.DateTimeUtc:
                                searchParamArgs.Add(DateTime.Parse(column.Filter.Text));
                                break;
                            case DataType.Date:
                                searchParamArgs.Add(DateTime.Parse(column.Filter.Text).Date);
                                searchParamArgs.Add(DateTime.Parse(column.Filter.Text).Date.AddDays(1).AddMinutes(-1));
                                break;
                            case DataType.Boolean:
                                searchParamArgs.Add(bool.Parse(column.Filter.Text));
                                break;
                            default:
                                searchParamArgs.Add(column.Filter.Text);
                                break;
                        }

                        break;
                    case CompareOperators.Contains:
                        searchLambda.AppendFormat(
                            isDbQuery
                                ? "{0}.Contains(@{1}) &&"
                                : "({0} != null && {0}.ToLowerInvariant().Contains(@{1})) &&", column.Name,
                            searchParamArgs.Count);

                        searchParamArgs.Add(column.Filter.Text.ToLowerInvariant());
                        break;
                    case CompareOperators.StartsWith:
                        searchLambda.AppendFormat(
                            isDbQuery
                                ? "{0}.StartsWith(@{1}) &&"
                                : "({0} != null && {0}.ToLowerInvariant().StartsWith(@{1})) &&", column.Name,
                            searchParamArgs.Count);

                        searchParamArgs.Add(column.Filter.Text.ToLowerInvariant());
                        break;
                    case CompareOperators.EndsWith:
                        searchLambda.AppendFormat(
                            isDbQuery
                                ? "{0}.EndsWith(@{1}) &&"
                                : "({0} != null && {0}.ToLowerInvariant().EndsWith(@{1})) &&", column.Name,
                            searchParamArgs.Count);

                        searchParamArgs.Add(column.Filter.Text.ToLowerInvariant());
                        break;
                    case CompareOperators.NotContains:
                        searchLambda.AppendFormat(
                            isDbQuery
                                ? "{0}.Contains(@{1}) == false &&"
                                : "({0} != null && {0}.ToLowerInvariant().Contains(@{1}) == false) &&", column.Name,
                            searchParamArgs.Count);

                        searchParamArgs.Add(column.Filter.Text.ToLowerInvariant());
                        break;
                    case CompareOperators.NotStartsWith:
                        searchLambda.AppendFormat(
                            isDbQuery
                                ? "{0}.StartsWith(@{1}) == false &&"
                                : "({0} != null && {0}.ToLowerInvariant().StartsWith(@{1}) == false) &&", column.Name,
                            searchParamArgs.Count);

                        searchParamArgs.Add(column.Filter.Text.ToLowerInvariant());
                        break;
                    case CompareOperators.NotEndsWith:
                        searchLambda.AppendFormat(
                            isDbQuery
                                ? "{0}.EndsWith(@{1}) == false &&"
                                : "({0} != null && {0}.ToLowerInvariant().EndsWith(@{1}) == false) &&", column.Name,
                            searchParamArgs.Count);

                        searchParamArgs.Add(column.Filter.Text.ToLowerInvariant());
                        break;
                    case CompareOperators.Gte:
                    case CompareOperators.Gt:
                    case CompareOperators.Lte:
                    case CompareOperators.Lt:
                        searchLambda.AppendFormat("{0} {2} @{1} &&", column.Name, searchParamArgs.Count,
                            GetSqlOperator(column.Filter.Operator));

                        if (column.DataType == DataType.Numeric)
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));

                        break;
                    case CompareOperators.Multiple:
                        if (column.Filter.Argument == null || column.Filter.Argument.Length == 0) continue;

                        var filterString = "(";
                        foreach (var filter in column.Filter.Argument)
                        {
                            filterString += $" {column.Name} == @{searchParamArgs.Count} ||";
                            searchParamArgs.Add(filter);
                        }

                        if (filterString.Length == 1) continue;

                        searchLambda.AppendFormat(filterString.Remove(filterString.Length - 3, 3) + ") &&");

                        break;
                    case CompareOperators.Between:
                        if (column.Filter.Argument == null || column.Filter.Argument.Length == 0) continue;

                        searchLambda.AppendFormat("(({0} >= @{1}) &&  ({0} <= @{2})) &&", column.Name,
                            searchParamArgs.Count, searchParamArgs.Count + 1);

                        if (column.DataType == DataType.Numeric)
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

            if (searchLambda.Length <= 0) return subset;

            subset = subset.Where(searchLambda.Remove(searchLambda.Length - 3, 3).ToString(),
                searchParamArgs.ToArray());

            if (subset != null)
                response.FilteredRecordCount = subset.Count();

            return subset;
        }

        /// <summary>
        /// Creates a dynamic set filtered by a LINQ expression
        /// </summary>
        /// <param name="dataSource">The IQueryable source</param>
        /// <param name="fieldName">The field to filter</param>
        /// <param name="filter">The LINQ expression</param>
        /// <returns>The filtered IQueryable</returns>
        public static IQueryable CreateDynamicFilteredSet(this IQueryable dataSource, string fieldName, string filter)
        {
            return dataSource.Where($"{fieldName}.Contains(@0)", filter);
        }

        /// <summary>
        /// Generates a list with distinct values to use in TypeAhead UI control
        /// </summary>
        /// <param name="dataSource">The IQueryable source</param>
        /// <param name="fieldName">The field to filter</param>
        /// <param name="filter">The LINQ expression</param>
        /// <param name="records">How many records to retrieve, default 8</param>
        /// <returns>The filtered IQueryable</returns>
        public static IQueryable<string> CreateTypeAheadList(this IQueryable dataSource, string fieldName, string filter,
            int records = 8)
        {
            // TODO: I need to connect this to a better platform
            return (dataSource.CreateDynamicFilteredSet(fieldName, filter)
                .Select($"{fieldName}.ToString()") as IQueryable<string>)
                .Distinct()
                .Take(records);
        }

        /// <summary>
        /// Generates a list with distinct values to use in TypeAhead UI control
        /// </summary>
        /// <param name="dataSource">The IQueryable source</param>
        /// <param name="fieldName">The field to filter</param>
        /// <param name="records">How many records, 0 to retrieve all</param>
        /// <returns>The filtered IQueryable</returns>
        public static IQueryable<string> CreateTypeAheadList(this IQueryable dataSource, string fieldName,
            int records = 8)
        {
            var stringDatasource = (dataSource
                .Select($"{fieldName}.ToString()") as IQueryable<string>)
                .Distinct();

            return (records > 0 ? stringDatasource.Take(records) : stringDatasource);
        }
    }
}