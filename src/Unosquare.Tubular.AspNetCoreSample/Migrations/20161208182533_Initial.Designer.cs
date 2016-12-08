using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Unosquare.Tubular.AspNetCoreSample.Models;

namespace Unosquare.Tubular.AspNetCoreSample.Migrations
{
    [DbContext(typeof(SampleDbContext))]
    [Migration("20161208182533_Initial")]
    partial class Initial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.0-rtm-22752")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Unosquare.Tubular.AspNetCoreSample.Models.Order", b =>
                {
                    b.Property<int>("OrderId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Address");

                    b.Property<decimal>("Amount");

                    b.Property<string>("CarrierName");

                    b.Property<string>("Comments");

                    b.Property<string>("CreatedUserId");

                    b.Property<string>("CustomerName");

                    b.Property<bool>("IsShipped");

                    b.Property<int>("OrderType");

                    b.Property<string>("PhoneNumber");

                    b.Property<string>("PostalCode");

                    b.Property<DateTime>("ShippedDate");

                    b.Property<string>("ShipperCity");

                    b.Property<int?>("WarehouseId");

                    b.HasKey("OrderId");

                    b.ToTable("Orders");
                });

            modelBuilder.Entity("Unosquare.Tubular.AspNetCoreSample.Models.OrderDetail", b =>
                {
                    b.Property<int>("OrderDetailID")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description");

                    b.Property<int>("OrderId");

                    b.Property<decimal>("Price");

                    b.Property<int>("ProductID");

                    b.Property<int>("Quantity");

                    b.HasKey("OrderDetailID");

                    b.HasIndex("OrderId");

                    b.HasIndex("ProductID");

                    b.ToTable("OrderDetails");
                });

            modelBuilder.Entity("Unosquare.Tubular.AspNetCoreSample.Models.Product", b =>
                {
                    b.Property<int>("ProductID")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name");

                    b.HasKey("ProductID");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("Unosquare.Tubular.AspNetCoreSample.Models.OrderDetail", b =>
                {
                    b.HasOne("Unosquare.Tubular.AspNetCoreSample.Models.Order", "Order")
                        .WithMany("Details")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Unosquare.Tubular.AspNetCoreSample.Models.Product", "Product")
                        .WithMany()
                        .HasForeignKey("ProductID")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
