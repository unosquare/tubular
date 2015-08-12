namespace Unosquare.Tubular
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Dynamic;
    using System.Reflection;
    using System.Runtime.CompilerServices;
    using System.Text;
    using Unosquare.Tubular.ObjectModel;

    /// <summary>
    /// Extensions methods
    /// </summary>
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
                        payloadItem.Add(((DateTime) value).AddMinutes(-timezoneOffset));
                    else
                        payloadItem.Add(value);
                }

                payload.Add(payloadItem);
            }

            return payload;
        }

        /// <summary>
        /// Generates a GridDataReponse using the GridDataRequest and an IQueryable source,
        /// like a DataSet in Entity Framework.
        /// </summary>
        /// <param name="request">The Tubular's grid request</param>
        /// <param name="dataSource">The IQueryable source</param>
        /// <returns></returns>
        public static GridDataResponse CreateGridDataResponse(this GridDataRequest request, IQueryable dataSource)
        {
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

            subset = subset.Skip(request.Skip);
            var pageSize = request.Take;

            // Take with value -1 represents entire set
            if (request.Take == -1)
            {
                response.TotalPages = 1;
                response.CurrentPage = 1;
                pageSize = subset.Count();
            }
            else
            {
                subset = subset.Take(request.Take);
                response.TotalPages = (response.FilteredRecordCount + pageSize - 1)/pageSize;

                if (response.TotalPages > 0)
                {
                    response.CurrentPage = 1 +
                                           (int)
                                               ((request.Skip/(float) response.FilteredRecordCount)*response.TotalPages);
                }
            }

            response.Payload = CreateGridPayload(subset, columnMap, pageSize, request.TimezoneOffset);

            return response;
        }

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
            // Perform Searching
            var searchLambda = new StringBuilder();
            var searchParamArgs = new List<object>();

            switch (request.Search.Operator)
            {
                case CompareOperators.Auto:
                    var filter = string.Empty;
                    var values = new List<object>();

                    if (request.Columns.Any(x => x.Searchable))
                        filter = "(";

                    foreach (var column in request.Columns.Where(x => x.Searchable))
                    {
                        filter += string.Format("{0}.Contains(@{1}) ||", column.Name, values.Count);
                        values.Add(request.Search.Text);
                    }

                    if (string.IsNullOrEmpty(filter) == false)
                    {
                        searchLambda.Append(filter.Remove(filter.Length - 3, 3) + ") &&");
                        searchParamArgs.AddRange(values);
                    }

                    break;
            }

            // Perform Filtering
            foreach (var column in request.Columns.Where(x => x.Filter != null))
            {
                if (string.IsNullOrWhiteSpace(column.Filter.Text) && column.Filter.Argument == null)
                    continue; // TODO: Handle null?

                switch (column.Filter.Operator)
                {
                    case CompareOperators.Equals:
                    case CompareOperators.NotEquals:
                        if (string.IsNullOrWhiteSpace(column.Filter.Text)) continue;

                        if (column.DataType == DataType.Date.ToString().ToLower())
                        {
                            if (column.Filter.Operator == CompareOperators.Equals)
                            {
                                searchLambda.AppendFormat("({0} >= @{1} && {0} <= @{2}) &&", column.Name, searchParamArgs.Count, searchParamArgs.Count + 1);
                            }
                            else
                            {
                                searchLambda.AppendFormat("({0} < @{1} || {0} > @{2}) &&", column.Name, searchParamArgs.Count, searchParamArgs.Count + 1);
                            }
                        }
                        else
                        {
                            searchLambda.AppendFormat("{0} {2} @{1} &&", column.Name, searchParamArgs.Count, GetSqlOperator(column.Filter.Operator));
                        }

                        if (string.Equals(column.DataType, DataType.Numeric.ToString(),
                            StringComparison.CurrentCultureIgnoreCase))
                        {
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        }
                        else if (
                            string.Equals(column.DataType, DataType.DateTime.ToString(),
                                StringComparison.CurrentCultureIgnoreCase))
                        {
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));
                        }
                        else if (
                            string.Equals(column.DataType, DataType.Date.ToString(),
                                StringComparison.CurrentCultureIgnoreCase))
                        {
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text).Date);
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text).Date.AddDays(1).AddMinutes(-1));
                        }
                        else if (string.Equals(column.DataType, DataType.Boolean.ToString(),
                            StringComparison.CurrentCultureIgnoreCase))
                        {
                            searchParamArgs.Add(bool.Parse(column.Filter.Text));
                        }
                        else
                        {
                            searchParamArgs.Add(column.Filter.Text);
                        }

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
                    case CompareOperators.Gt:
                    case CompareOperators.Lte:
                    case CompareOperators.Lt:
                        searchLambda.AppendFormat("{0} {2} @{1} &&", column.Name, searchParamArgs.Count, GetSqlOperator(column.Filter.Operator));

                        if (string.Equals(column.DataType, DataType.Numeric.ToString(), StringComparison.CurrentCultureIgnoreCase))
                            searchParamArgs.Add(decimal.Parse(column.Filter.Text));
                        else
                            searchParamArgs.Add(DateTime.Parse(column.Filter.Text));

                        break;
                    case CompareOperators.Multiple:
                        if (column.Filter.Argument == null || column.Filter.Argument.Length == 0) continue;

                        var filterString = "(";
                        foreach (var filter in column.Filter.Argument)
                        {
                            filterString += string.Format("{0} == @{1} ||", column.Name, searchParamArgs.Count);
                            searchParamArgs.Add(filter);
                        }

                        if (filterString.Length == 1) continue;

                        searchLambda.AppendFormat(filterString.Remove(filterString.Length - 3, 3) + ") &&");

                        break;
                    case CompareOperators.Between:
                        if (column.Filter.Argument == null || column.Filter.Argument.Length == 0) continue;

                        searchLambda.AppendFormat("(({0} >= @{1}) &&  ({0} <= @{2})) &&", column.Name,
                            searchParamArgs.Count, searchParamArgs.Count + 1);

                        if (string.Equals(column.DataType, DataType.Numeric.ToString(), StringComparison.CurrentCultureIgnoreCase))
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
            return dataSource.Where(string.Format("{0}.Contains(@0)", fieldName), new[] {filter});
        }

        /// <summary>
        /// Generates a list with distinct values to use in TypeAhead UI control
        /// </summary>
        /// <param name="dataSource">The IQueryable source</param>
        /// <param name="fieldName">The field to filter</param>
        /// <param name="filter">The LINQ expression</param>
        /// <param name="records">How many records to retrieve, default 8</param>
        /// <returns>The filtered IQueryable</returns>
        public static IQueryable<string> CreateTypeAheadList(this IQueryable dataSource, string fieldName, string filter, int records = 8)
        {
            // TODO: I need to connect this to a better platform
            return dataSource.CreateDynamicFilteredSet(fieldName, filter)
                .Select(fieldName + ".ToString()")
                .Distinct()
                .Take(records) as IQueryable<string>;
        }

        /// <summary>
        /// Generates a list with distinct values to use in TypeAhead UI control
        /// </summary>
        /// <param name="dataSource">The IQueryable source</param>
        /// <param name="fieldName">The field to filter</param>
        /// <param name="records">How many records, 0 to retrieve all</param>
        /// <returns>The filtered IQueryable</returns>
        public static IQueryable<string> CreateTypeAheadList(this IQueryable dataSource, string fieldName, int records = 8)
        {
            dataSource = dataSource
                .Select(fieldName + ".ToString()")
                .Distinct();

            return (records > 0 ? dataSource.Take(records) : dataSource) as IQueryable<string>;
        }
    }
}