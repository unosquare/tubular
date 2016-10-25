namespace Unosquare.Tubular.Sample.Controllers
{
    using System.Data.Entity;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using System.Web.Http;
    using Unosquare.Tubular.Sample.ApiModels;
    using Unosquare.Tubular.ObjectModel;
    using Unosquare.Tubular.Sample.Models;

    [RoutePrefix("api/orders")]
    public class OrdersController : ApiController
    {
        [HttpGet, Route("{id}")]
        public async Task<IHttpActionResult> Get(string id)
        {
            using (var context = new SampleDbContext())
            {
                context.Configuration.LazyLoadingEnabled = false;

                var orderId = int.Parse(id);
                var order = await context.Orders.AsNoTracking().Where(o => o.OrderId == orderId).FirstOrDefaultAsync();

                if (order == null) return NotFound();

                return Ok(Request.AdjustObjectTimeZone(order));
            }
        }

        [HttpPost, Route("paged")]
        public IHttpActionResult GridData([FromBody] GridDataRequest request)
        {
            using (var context = new SampleDbContext())
            {
                return Ok(request.CreateGridDataResponse(context.Orders));
            }
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
        public async Task<IHttpActionResult> GridDataWithFormat([FromBody] GridDataRequest request)
        {
            // This is just a sample using a Task
            using (var context = new SampleDbContext())
            {
                return
                    Ok(
                        await
                            Task.Run(
                                () =>
                                    request.CreateGridDataResponse(
                                        context.Orders.AsNoTracking().Select(x => new OrderDto
                                        {
                                            Amount = x.Amount.ToString(),
                                            CustomerName = x.CustomerName,
                                            IsShipped = x.IsShipped.ToString(),
                                            OrderId = x.OrderId,
                                            ShippedDate = x.ShippedDate.ToString(),
                                            ShipperCity = x.ShipperCity
                                        }), FormatOutput)));
            }
        }

        [HttpPut, Route("save")]
        public async Task<IHttpActionResult> UpdateOrder([FromBody] GridDataUpdateRow<Order> request)
        {
            using (var context = new SampleDbContext())
            {
                var order = await context.Orders.Where(o => o.OrderId == request.Old.OrderId).FirstOrDefaultAsync();

                if (order == null)
                    return NotFound();

                request.AdjustTimezoneOffset();

                order.Amount = request.New.Amount;
                order.CustomerName = request.New.CustomerName;
                order.IsShipped = request.New.IsShipped;
                order.ShippedDate = request.New.ShippedDate.Date;
                order.ShipperCity = request.New.ShipperCity;
                order.OrderType = request.New.OrderType;
                order.Comments = request.New.Comments;
                order.CarrierName = request.New.CarrierName;
                
                await context.SaveChangesAsync();

                return Ok(new
                {
                    Status = "OK"
                });
            }
        }

        [HttpPost, Route("save")]
        public async Task<IHttpActionResult> CreateOrder([FromBody] Order order)
        {
            using (var context = new SampleDbContext())
            {
                var fixedOrder = (Order) Request.AdjustObjectTimeZone(order);
                context.Orders.Add(fixedOrder);
                await context.SaveChangesAsync();

                return Ok(new
                {
                    Status = "OK"
                });
            }
        }

        [HttpDelete, Route("save/{id}")]
        public async Task<IHttpActionResult> DeleteOrder(string id)
        {
            using (var context = new SampleDbContext())
            {
                var orderId = int.Parse(id);
                var orderDb = await context.Orders.Where(o => o.OrderId == orderId).FirstOrDefaultAsync();

                if (orderDb == null)
                    return NotFound();

                context.Orders.Remove(orderDb);

                await context.SaveChangesAsync();

                return Ok(new
                {
                    Status = "OK"
                });
            }
        }

        [HttpGet, Route("cities")]
        public async Task<IHttpActionResult> GetCities()
        {
            using (var context = new SampleDbContext())
            {
                return Ok(await context.Orders
                    .AsNoTracking()
                    .Select(x => new
                    {
                        Key = x.ShipperCity,
                        Label = x.ShipperCity.ToUpper()
                    })
                    .Distinct()
                    .OrderBy(x => x)
                    .ToListAsync());
            }
        }

        [HttpGet, Route("chart")]
        public IHttpActionResult GetChart()
        {
            using (var context = new SampleDbContext())
            {
                return
                    Ok(context.Orders.ProvideMultipleSerieChartResponse(
                        label: x => x.ShipperCity,
                        serie: x => x.CustomerName,
                        value: x => x.Amount));
            }
        }

        [HttpGet, Route("chartpie")]
        public IHttpActionResult GetChartPie()
        {
            using (var context = new SampleDbContext())
            {
                return
                    Ok(context.Orders.ProvideSingleSerieChartResponse(
                        label: x => x.CustomerName,
                        value: x => x.Amount,
                        serieName: "Customers"));
            }
        }
    }
}