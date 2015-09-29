namespace Unosquare.Tubular
{
    using System;
    using System.Linq;
    using System.Linq.Expressions;
    using Unosquare.Tubular.ObjectModel;

    /// <summary>
    /// Fluent Extension Methods
    /// </summary>
    public static class FluentExtension
    {
        /// <summary>
        /// Adds a Data Source to a DataSourceConfig
        /// </summary>
        /// <param name="list">The DataSourceList where the DataSource will be add</param>
        /// <param name="source">The IQueryable to add</param>
        /// <param name="type"></param>
        /// <returns></returns>
        public static DataSourceConfig AddSource(this DataSourceRepository list, IQueryable source, Type type)
        {
            var config = new DataSourceConfig(source, type);
            list.Add(config);
            return config;
        }

        /// <summary>
        /// Adds a generic Data Source to a DataSourceConfig
        /// </summary>
        /// <typeparam name="T">The DataSource Type</typeparam>
        /// <param name="list">The DataSourceList where the DataSource will be add</param>
        /// <param name="source">The IQueryable to add</param>
        /// <returns></returns>
        public static DataSourceConfig<T> AddSource<T>(this DataSourceRepository list, IQueryable<T> source)
            where T : class
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
            Expression<Func<T1, T3>> key1, Expression<Func<T2, T3>> key2)
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

        /// <summary>
        /// Sets a Secure URL to Grid Options
        /// </summary>
        /// <param name="options"></param>
        /// <param name="url"></param>
        /// <param name="method"></param>
        /// <returns></returns>
        public static GridOptions WithSecureUrl(this GridOptions options, string url, string method = "POST")
        {
            options.RequireAuthentication = true;
            options.DataUrl = url;
            options.RequestMethod = method;

            return options;
        }

        /// <summary>
        /// Verifies all the joins in the Repository
        /// </summary>
        /// <param name="repo"></param>
        /// <returns></returns>
        public static DataSourceRepository VerifyJoins(this DataSourceRepository repo)
        {
            foreach (var datasource in repo)
            {
                foreach (var join in datasource.Joins)
                {
                    var fk = repo.FirstOrDefault(x => x.Name == join.Name2);

                    if (fk == null) continue;

                    var validJoin = fk.Joins.Any(x => x.Name2 == datasource.Name);

                    if (validJoin == false)
                    {
                        fk.Joins.Add(new DataSourceJoinConfig(join.Name2, join.Key2, join.Name1,
                            join.Key1));
                    }
                }
            }

            return repo;
        }
    }
}