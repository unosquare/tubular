using System;

namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Defines a DataSource join configuration implementation
    /// </summary>
    public interface IDataSourceJoinConfig
    {
        /// <summary>
        /// The Source name
        /// </summary>
        string Name1 { get; }

        /// <summary>
        /// The Destination name
        /// </summary>
        string Name2 { get; }

        /// <summary>
        /// The Source key
        /// </summary>
        string Key1 { get; }

        /// <summary>
        /// The Destination key
        /// </summary>
        string Key2 { get; }

        /// <summary>
        /// The join selector (a valida Linq Dynamic string query)
        /// </summary>
        string Selector { get; }

        /// <summary>
        /// The partial Join selector
        /// </summary>
        string Selector2 { get; }
    }

    /// <summary>
    /// Defines a generic DataSource join configuration scheme
    /// </summary>
    public class DataSourceJoinConfig : IDataSourceJoinConfig
    {
        private readonly string _firstKey;
        private readonly string _secondKey;

        /// <summary>
        /// Instances a new DataSource Join Config
        /// </summary>
        /// <param name="firstSet"></param>
        /// <param name="firstKey"></param>
        /// <param name="secondSet"></param>
        /// <param name="secondKey"></param>
        public DataSourceJoinConfig(string firstSet, string firstKey, string secondSet, string secondKey)
        {
            _firstKey = firstKey;
            _secondKey = secondKey;
            Name1 = firstSet;
            Name2 = secondSet;
        }

        /// <summary>
        /// The Source name
        /// </summary>
        public string Name1 { get; private set; }

        /// <summary>
        /// The Destination name
        /// </summary>
        public string Name2 { get; private set; }

        /// <summary>
        /// The Source key
        /// </summary>
        public string Key1
        {
            get { return Name1 + "." + _firstKey; }
        }

        /// <summary>
        /// The destination key
        /// </summary>
        public string Key2
        {
            get { return Name2 + "." + _secondKey; }
        }


        /// <summary>
        /// The join selector (a valida Linq Dynamic string query)
        /// </summary>
        public string Selector
        {
            get { return String.Format("new ({0} as {0}, {1} as {1})", Name1, Name2); }
        }

        /// <summary>
        /// The partial Join selector
        /// </summary>
        public string Selector2
        {
            get { return String.Format(", {0} as {0})", Name2); }
        }
    }

    /// <summary>
    /// Defines a generic DataSource join configuration scheme
    /// </summary>
    public class DataSourceJoinConfig<T1, T2> : IDataSourceJoinConfig
    {
        private readonly string _firstKey;
        private readonly string _secondKey;

        /// <summary>
        /// Instances a new DataSource Join Config
        /// </summary>
        /// <param name="firstKey"></param>
        /// <param name="secondKey"></param>
        public DataSourceJoinConfig(string firstKey, string secondKey)
        {
            _firstKey = firstKey;
            _secondKey = secondKey;
        }

        /// <summary>
        /// The Source name
        /// </summary>
        public string Name1
        {
            get { return typeof (T1).Name; }
        }

        /// <summary>
        /// The Destination name
        /// </summary>
        public string Name2
        {
            get { return typeof (T2).Name; }
        }

        /// <summary>
        /// The Source key
        /// </summary>
        public string Key1
        {
            get { return Name1 + "." + _firstKey; }
        }

        /// <summary>
        /// The destination key
        /// </summary>
        public string Key2
        {
            get { return Name2 + "." + _secondKey; }
        }

        /// <summary>
        /// The join selector (a valida Linq Dynamic string query)
        /// </summary>
        public string Selector
        {
            get { return String.Format("new ({0} as {0}, {1} as {1})", Name1, Name2); }
        }

        /// <summary>
        /// The partial Join selector
        /// </summary>
        public string Selector2
        {
            get { return String.Format(", {0} as {0})", Name2); }
        }
    }
}