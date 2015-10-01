using System.ComponentModel.DataAnnotations;

namespace Unosquare.Tubular.Sample.Models
{
    public class Warehouse
    {
        [Key]
        public int WarehouseID { get; set; }

        public string Location { get; set; }
    }
}