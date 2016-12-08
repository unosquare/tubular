using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Unosquare.Tubular.AspNetCoreSample.ApiModel;
using Unosquare.Tubular.AspNetCoreSample.Models;
using Unosquare.Tubular.ObjectModel;

namespace Unosquare.Tubular.AspNetCoreSample.Controllers
{
    [Route("api/[controller]")]
    public class OrdersController : Controller
    {
        private readonly SampleDbContext _context;

        public OrdersController(SampleDbContext context)
        {
            _context = context;
        }

        [HttpGet, Route("{id}")]
        public object Get(string id)
        {
            var orderId = int.Parse(id);
            var order = _context.Orders.Where(o => o.OrderId == orderId).FirstOrDefault();

            if (order == null) return NotFound();

            return order;
        }

        [HttpPost, Route("paged")]
        public object GridData([FromBody] GridDataRequest request)
        {
            return request.CreateGridDataResponse(_context.Orders);
        }

        private static IQueryable FormatOutput(IQueryable q)
        {
            var list = new List<OrderDto>();

            foreach (var i in q)
            {
                var item = i as OrderDto;

                if (item?.CustomerName == "Super La Playa")
                {
                    item.ShippedDate = "Blocked";
                    item.ShipperCity = "Blocked";
                    item.Amount = "Blocked";
                }

                list.Add(item);
            }

            return list.AsQueryable();
        }

        [HttpPost, Route("pagedwithformat")]
        public async Task<object> GridDataWithFormat([FromBody] GridDataRequest request)
        {
            // This is just a sample using a Task
            return await Task.Run(() =>
                                request.CreateGridDataResponse(
                                    _context.Orders.Select(x => new OrderDto
                                    {
                                        Amount = x.Amount.ToString(),
                                        CustomerName = x.CustomerName,
                                        IsShipped = x.IsShipped.ToString(),
                                        OrderId = x.OrderId,
                                        ShippedDate = x.ShippedDate.ToString(),
                                        ShipperCity = x.ShipperCity
                                    }), FormatOutput));
        }

        [HttpPut, Route("save")]
        public async Task<object> UpdateOrder([FromBody] GridDataUpdateRow<Order> request)
        {
            var order = _context.Orders.Where(o => o.OrderId == request.Old.OrderId).FirstOrDefault();

            if (order == null)
                return null;

            request.AdjustTimezoneOffset();

            order.Amount = request.New.Amount;
            order.CustomerName = request.New.CustomerName;
            order.IsShipped = request.New.IsShipped;
            order.ShippedDate = request.New.ShippedDate.Date;
            order.ShipperCity = request.New.ShipperCity;
            order.OrderType = request.New.OrderType;
            order.Comments = request.New.Comments;
            order.CarrierName = request.New.CarrierName;

            await _context.SaveChangesAsync();

            return new { Status = "OK" };
        }

        [HttpPost, Route("save")]
        public async Task<object> CreateOrder([FromBody] Order order)
        {
            var fixedOrder = order;  // TODO: (Order)Request.AdjustObjectTimeZone(order);
            _context.Orders.Add(fixedOrder);
            await _context.SaveChangesAsync();

            return new { Status = "OK" };
        }

        [HttpDelete, Route("save/{id}")]
        public async Task<object> DeleteOrder(string id)
        {
            var orderId = int.Parse(id);
            var orderDb = _context.Orders.Where(o => o.OrderId == orderId).FirstOrDefault();

            if (orderDb == null)
                return NotFound();

            _context.Orders.Remove(orderDb);

            await _context.SaveChangesAsync();

            return new { Status = "OK" };
        }

        [HttpGet, Route("cities")]
        public IEnumerable<object> GetCities()
        {
            return _context.Orders
                .Select(x => new
                {
                    Key = x.ShipperCity,
                    Label = x.ShipperCity.ToUpper()
                })
                .Distinct()
                .OrderBy(x => x.Label)
                .ToList();
        }

        [HttpGet, Route("chart")]
        public object GetChart()
        {
            return _context.Orders.ProvideMultipleSerieChartResponse(
                    label: x => x.ShipperCity,
                    serie: x => x.CustomerName,
                    value: x => x.Amount);
        }

        [HttpGet, Route("chartpie")]
        public object GetChartPie()
        {
            return _context.Orders.ProvideSingleSerieChartResponse(
                    label: x => x.CustomerName,
                    value: x => x.Amount,
                    serieName: "Customers");
        }
    }
}
