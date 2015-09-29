using System.Data.Entity;

namespace Unosquare.Tubular.Sample.Models
{
    public class SampleDbContext : DbContext
    {
        public SampleDbContext() : base("SampleDbContext") { }

        public SampleDbContext(bool lazyLoadingEnable)
        {
            Configuration.LazyLoadingEnabled = lazyLoadingEnable;
        }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<SystemUser> SystemUsers { get; set; }
        public DbSet<SystemRole> SystemRoles { get; set; }
    }
}