namespace Unosquare.Tubular.Sample.Application
{
    using EntityFramework.MappingAPI.Extensions;
    using System;
    using System.Data.Entity;
    using System.Linq;
    using System.Reflection;
    using Unosquare.Tubular.ObjectModel;

    public static class Extensions
    {
        /// <summary>
        /// Sample method to extract DataSourceRepository from a EF DbContext
        /// </summary>
        /// <param name="context"></param>
        /// <param name="ignoreTypes"></param>
        /// <returns></returns>
        public static DataSourceRepository GetDataSourceRepository(this DbContext context, Type[] ignoreTypes = null)
        {
            var repo = new DataSourceRepository();

            var dbsets = context.GetType().GetProperties().Where(p => p.PropertyType.GetTypeInfo().IsGenericType
                                                                      &&
                                                                      p.PropertyType.GetGenericTypeDefinition() ==
                                                                      typeof (DbSet<>))
                .Select(
                    x =>
                        new
                        {
                            DbSet = (x.GetValue(context) as IQueryable),
                            PropertyType = x.PropertyType.GetGenericArguments().First()
                        })
                .ToList();

            if (dbsets.Any() == false) return repo;
            if (ignoreTypes == null) ignoreTypes = new Type[0];

            foreach (var dbset in dbsets.Where(dbset => ignoreTypes.Any(x => x == dbset.PropertyType) == false))
            {
                var dataSourceConfig = repo.AddSource(dbset.DbSet, dbset.PropertyType);

                var tableInfo = context.Db(dbset.PropertyType);

                if (tableInfo == null || tableInfo.Fks.Any() == false) continue;

                foreach (var fk in tableInfo.Fks)
                {
                    dataSourceConfig.Joins.Add(new DataSourceJoinConfig(dbset.PropertyType.Name, fk.PropertyName,
                        fk.FkTargetColumn.EntityMap.Type.Name, fk.FkTargetColumn.PropertyName));
                }
            }

            repo.VerifyJoins();

            return repo;
        }
    }
}