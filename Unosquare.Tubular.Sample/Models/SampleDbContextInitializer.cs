namespace Unosquare.Tubular.Sample.Models
{
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;

    public class SampleDbContextInitializer : DropCreateDatabaseIfModelChanges<SampleDbContext>
    {
        protected override void Seed(SampleDbContext context)
        {
            var roles = new List<SystemRole>
            {
                new SystemRole() {Id = "user", Name = "User"},
                new SystemRole() {Id = "admin", Name = "Administrator"},
                new SystemRole() {Id = "observer", Name = "Observer"},
            };

            context.SystemRoles.AddRange(roles);
            context.SaveChanges();

            var users = new List<SystemUser>()
            {
                new SystemUser() {Id = "mariodivece", UserName = "admin@unosquare.com", Password = "pass.word1"},
                new SystemUser() {Id = "johnshapiro", UserName = "john@unosquare.com", Password = "pass.word1"},
                new SystemUser() {Id = "luisgomez", UserName = "luis@unosquare.com", Password = "pass.word1"},
            };

            foreach (var user in users)
            {
                roles.ForEach(r => user.Roles.Add(r));
            }

            context.SystemUsers.AddRange(users);
            context.SaveChanges();

            var shipperCities = new[]
            {
                "Guadalajara, JAL, Mexico", "Los Angeles, CA, USA", "Portland, OR, USA", "Leon, GTO, Mexico",
                "Boston, MA, USA"
            };
            var companies = new[]
            {"Unosquare LLC", "Advanced Technology Systems", "Super La Playa", "Vesta", "Microsoft", "Oxxo"};

            var rand = new Random();

            for (var i = 0; i < 500; i ++)
            {
                var order = new Order
                {
                    OrderID = 10000 + i,
                    CreatedUserId = users[rand.Next(users.Count - 1)].Id,
                    CustomerName = companies[rand.Next(companies.Length - 1)],
                    IsShipped = rand.Next(10) > 5,
                    ShipperCity = shipperCities[rand.Next(companies.Length - 1)],
                    Amount = rand.Next(100),
                    ShippedDate = DateTime.Now.AddDays(1 - rand.Next(10))
                };

                context.Orders.Add(order);
            }

            context.SaveChanges();
        }
    }
}