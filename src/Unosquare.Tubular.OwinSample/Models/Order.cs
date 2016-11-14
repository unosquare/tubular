namespace Unosquare.Tubular.Sample.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class Order
    {
        public Order()
        {
            Details = new HashSet<OrderDetail>();
        }

        [Key]
        public int OrderId { get; set; }

        public string CustomerName { get; set; }
        public string CarrierName { get; set; }

        public bool IsShipped { get; set; }

        public decimal Amount { get; set; }
        public DateTime ShippedDate { get; set; }

        public string CreatedUserId { get; set; }

        public int? WarehouseId { get; set; }

        public int OrderType { get; set; }
        
        public string Address { get; set; }
        public string ShipperCity { get; set; }
        public string PhoneNumber { get; set; }
        public string PostalCode { get; set; }

        public string Comments { get; set; }
        
        public virtual SystemUser CreatedUser { get; set; }

        public ICollection<OrderDetail> Details { get; set; }
    }
}