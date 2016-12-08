using System.ComponentModel.DataAnnotations;

namespace Unosquare.Tubular.AspNetCoreSample.Models
{
    public class OrderDetail
    {
        [Key]
        public int OrderDetailID { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public int OrderId { get; set; }

        public int ProductID { get; set; }

        public virtual Order Order { get; set; }

        public virtual Product Product { get; set; }
    }
}
