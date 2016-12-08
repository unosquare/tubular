using System.ComponentModel.DataAnnotations;

namespace Unosquare.Tubular.AspNetCoreSample.Models
{
    public class Product
    {
        [Key]
        public int ProductID { get; set; }

        public string Name { get; set; }
    }
}
