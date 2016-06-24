namespace Unosquare.Tubular.Sample.ApiModels
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public string CustomerName { get; set; }
        public string ShipperCity { get; set; }
        public string IsShipped { get; set; }

        public string Amount { get; set; }
        public string ShippedDate { get; set; }
    }
}