using System;
using System.Collections.Generic;
using System.Linq;

namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Defines a datasource config implementation
    /// </summary>
    public interface IDataSourceConfig
    {
        /// <summary>
        /// Gets the datasource
        /// </summary>
        /// <returns></returns>
        IQueryable GetSource();
        /// <summary>
        /// Defines the Joins
        /// </summary>
        List<IDataSourceJoinConfig> Joins { get; set; }
        /// <summary>
        /// The Datasource name
        /// </summary>
        string Name { get; }
    }

    /// <summary>
    /// Defines a generic datasource with a internal IQueryable source
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class DataSourceConfig<T> : IDataSourceConfig where T : class
    {
        private readonly IQueryable<T> _dataSource;

        /// <summary>
        /// Instances a new DataSourceConfig
        /// </summary>
        /// <param name="source"></param>
        public DataSourceConfig(IQueryable<T> source)
        {
            _dataSource = source;
            Name = typeof(T).Name;
        }

        /// <summary>
        /// The Datasource name
        /// </summary>
        public string Name { get; }

        /// <summary>
        /// Defines the Joins
        /// </summary>
        public List<IDataSourceJoinConfig> Joins { get; set; }

        /// <summary>
        /// Gets the datasource
        /// </summary>
        /// <returns></returns>
        public IQueryable GetSource()
        {
            return _dataSource;
        }
    }

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
        string Key1 { get;  }
        /// <summary>
        /// The Destination key
        /// </summary>
        string Key2 { get; }
        /// <summary>
        /// The join selector (a valida Linq Dynamic string query)
        /// </summary>
        string Selector { get; }
    }


    /// <summary>
    /// Defines a DataSource join configuration scheme
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
            get { return typeof(T1).Name; }
        }

        /// <summary>
        /// The Destination name
        /// </summary>
        public string Name2
        {
            get { return typeof(T2).Name; }
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
    }

}
