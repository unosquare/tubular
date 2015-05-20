namespace Unosquare.Tubular.Sample.Models
{
    using System;

    public class Order
    {
        public int OrderID { get; set; }
        public string CustomerName { get; set; }
        public string ShipperCity { get; set; }
        public bool IsShipped { get; set; }

        public decimal Amount { get; set; }
        public DateTime ShippedDate { get; set; }

        public string CreatedUserId { get; set; }

        public virtual SystemUser CreatedUser { get; set; }
    }
}