using System.Collections.Generic;

namespace Unosquare.Tubular.Sample.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class Order
    {
        public Order()
        {
            Details = new HashSet<OrderDetail>();
        }

        [Key]
        public int OrderID { get; set; }

        public string CustomerName { get; set; }
        public string ShipperCity { get; set; }
        public bool IsShipped { get; set; }

        public decimal Amount { get; set; }
        public DateTime ShippedDate { get; set; }

        public string CreatedUserId { get; set; }

        public virtual SystemUser CreatedUser { get; set; }

        public ICollection<OrderDetail> Details { get; set; }
    }
}