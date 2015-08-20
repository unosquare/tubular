namespace Unosquare.Tubular
{
    using System;

    /// <summary>
    /// Enums Sort directions
    /// </summary>
    public enum SortDirection
    {
        /// <summary>
        /// Not sorting
        /// </summary>
        None,
        /// <summary>
        /// Ascending sorting
        /// </summary>
        Ascending,
        /// <summary>
        /// Descending sorting
        /// </summary>
        Descending
    }

    /// <summary>
    /// Enum filtering operators
    /// </summary>
    public enum CompareOperators
    {
        /// <summary>
        /// None operator
        /// </summary>
        None,
        /// <summary>
        /// Autofiltering
        /// </summary>
        Auto,
        /// <summary>
        /// Equals operator
        /// </summary>
        Equals,
        /// <summary>
        /// Not Equals operator
        /// </summary>
        NotEquals,
        /// <summary>
        /// Contains filter
        /// </summary>
        Contains,
        /// <summary>
        /// StartsWith filter
        /// </summary>
        StartsWith,
        /// <summary>
        /// EndsWith filter
        /// </summary>
        EndsWith,
        /// <summary>
        /// Greather than or equal filter
        /// </summary>
        Gte,
        /// <summary>
        /// Greather than filter
        /// </summary>
        Gt,
        /// <summary>
        /// Less than or equal filter
        /// </summary>
        Lte,
        /// <summary>
        /// Less than filter
        /// </summary>
        Lt,
        /// <summary>
        /// Multiple options filter
        /// </summary>
        Multiple,
        /// <summary>
        /// Between values filter
        /// </summary>
        Between,
        /// <summary>
        /// Not Contains filter
        /// </summary>
        NotContains,
        /// <summary>
        /// Not StartsWith filter
        /// </summary>
        NotStartsWith,
        /// <summary>
        /// Not EndsWith filter
        /// </summary>
        NotEndsWith
    }

    /// <summary>
    /// Supported data types
    /// </summary>
    public enum DataType
    {
        /// <summary>
        /// String type
        /// </summary>
        String,
        /// <summary>
        /// Numeric type (int or float)
        /// </summary>
        Numeric,
        /// <summary>
        /// DataTime type
        /// </summary>
        DateTime,
        /// <summary>
        /// Only Date type
        /// </summary>
        Date,
        /// <summary>
        /// Boolean type
        /// </summary>
        Boolean
    }

    /// <summary>
    /// Aggregation Functions
    /// </summary>
    public enum AggregationFunction
    {
        /// <summary>
        /// None function
        /// </summary>
        None,
        /// <summary>
        /// Sum function
        /// </summary>
        Sum,
        /// <summary>
        /// Average function
        /// </summary>
        Average,
        /// <summary>
        /// Count function
        /// </summary>
        Count,
        /// <summary>
        /// Distinct Count function
        /// </summary>
        DistinctCount
    }

    /// <summary>
    /// Common properties
    /// </summary>
    public class Common
    {
        /// <summary>
        /// Defines primitive types
        /// </summary>
        public static readonly Type[] PrimitiveTypes =
        {
            typeof (string),
            typeof (DateTime),
            typeof (DateTimeOffset),
            typeof (bool),
            typeof (byte),
            typeof (sbyte),
            typeof (char),
            typeof (decimal),
            typeof (double),
            typeof (float),
            typeof (int),
            typeof (uint),
            typeof (long),
            typeof (ulong),
            typeof (short),
            typeof (ushort),
            typeof (DateTime?),
            typeof (DateTimeOffset?),
            typeof (bool?),
            typeof (byte?),
            typeof (sbyte?),
            typeof (char?),
            typeof (decimal?),
            typeof (double?),
            typeof (float?),
            typeof (int?),
            typeof (uint?),
            typeof (long?),
            typeof (ulong?),
            typeof (short?),
            typeof (ushort?),
            typeof (Guid),
            typeof (Guid?)
        };
    }
}