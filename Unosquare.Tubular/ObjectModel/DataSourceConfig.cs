using System;
using System.Collections.Generic;
using System.Linq;

namespace Unosquare.Tubular.ObjectModel
{
    /// <summary>
    /// Defines a DataSource config implementation
    /// </summary>
    public interface IDataSourceConfig
    {
        /// <summary>
        /// Gets the DataSource
        /// </summary>
        /// <returns></returns>
        IQueryable GetSource();

        /// <summary>
        /// Defines the Joins
        /// </summary>
        List<IDataSourceJoinConfig> Joins { get; set; }

        /// <summary>
        /// The DataSource name
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Get the Columns
        /// </summary>
        List<GridColumn> Columns { get; }
    }

    /// <summary>
    /// Defines a generic DataSource with a IQueryable source
    /// </summary>
    public class DataSourceConfig : IDataSourceConfig
    {
        private readonly IQueryable _dataSource;
        private readonly Type _type;

        /// <summary>
        /// Instances a new DataSourceConfig
        /// </summary>
        /// <param name="source"></param>
        /// <param name="type"></param>
        public DataSourceConfig(IQueryable source, Type type)
        {
            _dataSource = source;
            _type = type;

            Name = _type.Name;
            Joins = new List<IDataSourceJoinConfig>();
        }

        /// <summary>
        /// The DataSource name
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Defines the Joins
        /// </summary>
        public List<IDataSourceJoinConfig> Joins { get; set; }

        /// <summary>
        /// Gets the DataSource
        /// </summary>
        /// <returns></returns>
        public IQueryable GetSource()
        {
            return _dataSource;
        }

        internal static List<GridColumn> GetColumnsFromType(Type type)
        {
            return type.GetProperties().Where(x => x.CanRead && Common.PrimitiveTypes.Contains(x.PropertyType))
                .Select(
                    y =>
                        new GridColumn
                        {
                            Name = y.Name,
                            DataType =
                                CodeGenerator.GetDataTypeFromString(
                                    (Nullable.GetUnderlyingType(y.PropertyType) ?? y.PropertyType).Name)
                        }).OrderBy(x => x.Name).ToList();
        }

        /// <summary>
        /// Get the columns
        /// </summary>
        public List<GridColumn> Columns
        {
            get { return GetColumnsFromType(_type); }
        }
    }

    /// <summary>
    /// Defines a generic DataSource with a internal IQueryable source
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
            Name = typeof (T).Name;
            Joins = new List<IDataSourceJoinConfig>();
        }

        /// <summary>
        /// The DataSource name
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Defines the Joins
        /// </summary>
        public List<IDataSourceJoinConfig> Joins { get; set; }

        /// <summary>
        /// Gets the DataSource
        /// </summary>
        /// <returns></returns>
        public IQueryable GetSource()
        {
            return _dataSource;
        }

        /// <summary>
        /// Get the columns
        /// </summary>
        public List<GridColumn> Columns
        {
            get { return DataSourceConfig.GetColumnsFromType(typeof (T)); }
        }
    }
}