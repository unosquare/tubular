using System.Data.Common;

namespace Unosquare.Tubular.Tests.Database
{
    using System.Data.Entity;

    public class SampleEntities : DbContext
    {
        public SampleEntities(DbConnection connection)
            : base(connection, true)
        {
        }

        public DbSet<Thing> Things { get; set; }
    }
}