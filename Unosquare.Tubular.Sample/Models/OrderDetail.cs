namespace Unosquare.Tubular.Sample.Models
{
    using System.ComponentModel.DataAnnotations;

    public class OrderDetail
    {
        [Key]
        public int OrderDetailID { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public int OrderID { get; set; }

        public virtual Order Order { get; set; }
    }
}