using System;
using System.Linq;
using System.Linq.Expressions;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular
{
    /// <summary>
    /// Fluent Extension Methods
    /// </summary>
    public static class FluentExtension
    {
        /// <summary>
        /// Adds a Source to a DataSourceList
        /// </summary>
        /// <typeparam name="T">The DataSource Type</typeparam>
        /// <param name="list">The DataSourceList where the DataSource will be add</param>
        /// <param name="source">The IQueryable to add</param>
        /// <returns></returns>
        public static DataSourceConfig<T> AddSource<T>(this DataSourceList list, IQueryable<T> source) where T : class
        {
            var config = new DataSourceConfig<T>(source);
            list.Add(config);
            return config;
        }

        /// <summary>
        /// Add a Join to DataSource
        /// </summary>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T2"></typeparam>
        /// <typeparam name="T3"></typeparam>
        /// <param name="config"></param>
        /// <param name="key1"></param>
        /// <param name="key2"></param>
        /// <returns></returns>
        public static DataSourceConfig<T1> WithJoin<T1, T2, T3>(this DataSourceConfig<T1> config,
            Expression<Func<T1, T3>> key1, Expression<Func<T1, T3>> key2)
            where T1 : class
        {
            var expression1 = (MemberExpression) key1.Body;
            var expression2 = (MemberExpression) key2.Body;

            config.Joins.Add(new DataSourceJoinConfig<T1, T2>(expression1.Member.Name, expression2.Member.Name));

            return config;
        }

        /// <summary>
        /// Add a Join to DataSource
        /// </summary>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T2"></typeparam>
        /// <param name="config"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        public static DataSourceConfig<T1> WithJoin<T1, T2>(this DataSourceConfig<T1> config, string key)
            where T1 : class
        {
            config.Joins.Add(new DataSourceJoinConfig<T1, T2>(key, key));

            return config;
        }

        /// <summary>
        /// Add a Join to DataSource
        /// </summary>
        /// <typeparam name="T1"></typeparam>
        /// <typeparam name="T2"></typeparam>
        /// <param name="config"></param>
        /// <param name="key1"></param>
        /// <param name="key2"></param>
        /// <returns></returns>
        public static DataSourceConfig<T1> WithJoin<T1, T2>(this DataSourceConfig<T1> config, string key1, string key2)
            where T1 : class
        {
            config.Joins.Add(new DataSourceJoinConfig<T1, T2>(key1, key2));

            return config;
        }
    }
}