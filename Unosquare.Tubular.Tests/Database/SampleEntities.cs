namespace Unosquare.Tubular.Tests.Database
{
    using System;
    using System.Data.Entity;
    using System.Data.Common;

    public class SampleEntities : DbContext
    {
        public SampleEntities(DbConnection connection)
            : base(connection, true)
        {
        }

        public void Fill()
        {
            for (var i = 0; i < 100; i++)
            {
                Things.Add(new Thing()
                {
                    Date = DateTime.Now.AddDays(-i),
                    Id = i,
                    Name = "Name - " + i,
                    Bool = (i % 2) == 0,
                    DecimalNumber = (i % 3 == 0) ? 10.100m : 20.2002m,
                    Number = (new Random()).NextDouble() * 20
                });
            }

            SaveChanges();
        }

        public DbSet<Thing> Things { get; set; }
    }
}