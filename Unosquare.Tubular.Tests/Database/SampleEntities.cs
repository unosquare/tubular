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
            var colors = new[] {"red", "yellow", "blue"};
            var category = new[] {"A", "B"};

            for (var i = 0; i < 100; i++)
            {
                var rand = new Random();
                Things.Add(new Thing()
                {
                    Date = DateTime.Now.AddDays(-i),
                    Id = i,
                    Name = "Name - " + i,
                    Bool = (i%2) == 0,
                    DecimalNumber = (i%3 == 0) ? 10.100m : 20.2002m,
                    Number = rand.NextDouble()*20,
                    Category = category[rand.Next(0, category.Length - 1)],
                    Color = colors[rand.Next(0, colors.Length - 1)],
                });
            }

            SaveChanges();
        }

        public DbSet<Thing> Things { get; set; }
    }
}