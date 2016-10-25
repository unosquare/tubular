namespace Unosquare.Tubular.Sample.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.OrderDetails",
                c => new
                    {
                        OrderDetailID = c.Int(nullable: false, identity: true),
                        Description = c.String(),
                        Quantity = c.Int(nullable: false),
                        Price = c.Decimal(nullable: false, precision: 18, scale: 2),
                        OrderId = c.Int(nullable: false),
                        ProductID = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.OrderDetailID)
                .ForeignKey("dbo.Orders", t => t.OrderId, cascadeDelete: true)
                .ForeignKey("dbo.Products", t => t.ProductID, cascadeDelete: true)
                .Index(t => t.OrderId)
                .Index(t => t.ProductID);
            
            CreateTable(
                "dbo.Orders",
                c => new
                    {
                        OrderId = c.Int(nullable: false, identity: true),
                        CustomerName = c.String(),
                        CarrierName = c.String(),
                        IsShipped = c.Boolean(nullable: false),
                        Amount = c.Decimal(nullable: false, precision: 18, scale: 2),
                        ShippedDate = c.DateTime(nullable: false),
                        CreatedUserId = c.String(maxLength: 50),
                        WarehouseId = c.Int(),
                        OrderType = c.Int(nullable: false),
                        Address = c.String(),
                        ShipperCity = c.String(),
                        PhoneNumber = c.String(),
                        PostalCode = c.String(),
                        Comments = c.String(),
                    })
                .PrimaryKey(t => t.OrderId)
                .ForeignKey("dbo.SystemUsers", t => t.CreatedUserId)
                .Index(t => t.CreatedUserId);
            
            CreateTable(
                "dbo.SystemUsers",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 50),
                        UserName = c.String(nullable: false, maxLength: 50),
                        Password = c.String(nullable: false, maxLength: 50),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.SystemRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 50),
                        Name = c.String(nullable: false, maxLength: 50),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Products",
                c => new
                    {
                        ProductID = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                    })
                .PrimaryKey(t => t.ProductID);
            
            CreateTable(
                "dbo.Warehouses",
                c => new
                    {
                        WarehouseID = c.Int(nullable: false, identity: true),
                        Location = c.String(),
                    })
                .PrimaryKey(t => t.WarehouseID);
            
            CreateTable(
                "dbo.SystemRoleSystemUsers",
                c => new
                    {
                        SystemRole_Id = c.String(nullable: false, maxLength: 50),
                        SystemUser_Id = c.String(nullable: false, maxLength: 50),
                    })
                .PrimaryKey(t => new { t.SystemRole_Id, t.SystemUser_Id })
                .ForeignKey("dbo.SystemRoles", t => t.SystemRole_Id, cascadeDelete: true)
                .ForeignKey("dbo.SystemUsers", t => t.SystemUser_Id, cascadeDelete: true)
                .Index(t => t.SystemRole_Id)
                .Index(t => t.SystemUser_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.OrderDetails", "ProductID", "dbo.Products");
            DropForeignKey("dbo.OrderDetails", "OrderId", "dbo.Orders");
            DropForeignKey("dbo.Orders", "CreatedUserId", "dbo.SystemUsers");
            DropForeignKey("dbo.SystemRoleSystemUsers", "SystemUser_Id", "dbo.SystemUsers");
            DropForeignKey("dbo.SystemRoleSystemUsers", "SystemRole_Id", "dbo.SystemRoles");
            DropIndex("dbo.SystemRoleSystemUsers", new[] { "SystemUser_Id" });
            DropIndex("dbo.SystemRoleSystemUsers", new[] { "SystemRole_Id" });
            DropIndex("dbo.Orders", new[] { "CreatedUserId" });
            DropIndex("dbo.OrderDetails", new[] { "ProductID" });
            DropIndex("dbo.OrderDetails", new[] { "OrderId" });
            DropTable("dbo.SystemRoleSystemUsers");
            DropTable("dbo.Warehouses");
            DropTable("dbo.Products");
            DropTable("dbo.SystemRoles");
            DropTable("dbo.SystemUsers");
            DropTable("dbo.Orders");
            DropTable("dbo.OrderDetails");
        }
    }
}
