namespace Unosquare.Tubular.Sample.Controllers
{
    using System.Data.Entity;
    using System.Linq;
    using System.Threading.Tasks;
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
            using (var context = new SampleDbContext(false))
            {
                var orderId = int.Parse(id);
                var order = await context.Orders.AsNoTracking().Where(o => o.OrderID == orderId).FirstOrDefaultAsync();

                if (order == null)
                    return NotFound();

                return Ok(Request.AdjustObjectTimeZone(order));
            }
        }

        [HttpPost, Route("paged")]
        public async Task<IHttpActionResult> GridData([FromBody] GridDataRequest request)
        {
            using (var context = new SampleDbContext(false))
            {
                return Ok(await Task.Run(() => request.CreateGridDataResponse(context.Orders.AsNoTracking())));
            }
        }

        private IQueryable FormatOutput(IQueryable q)
        {
            var subset = (q as IQueryable<OrderDto>).ToArray();

            foreach (var item in subset)
            {
                if (item.CustomerName == "Super La Playa")
                {
                    item.ShippedDate = "Blocked";
                    item.ShipperCity = "Blocked";
                    item.Amount = "Blocked";
                }
            }

            return subset.AsQueryable();
        }

        [HttpPost, Route("pagedwithformat")]
        public async Task<IHttpActionResult> GridDataWithFormat([FromBody] GridDataRequest request)
        {
            using (var context = new SampleDbContext(false))
            {
                return Ok(await Task.Run(() => request.CreateGridDataResponse(context.Orders.AsNoTracking().Select(x => new OrderDto
                {
                    Amount = x.Amount.ToString(),
                    CustomerName = x.CustomerName,
                    IsShipped = x.IsShipped.ToString(),
                    OrderID = x.OrderID,
                    ShippedDate = x.ShippedDate.ToString(),
                    ShipperCity = x.ShipperCity
                }), FormatOutput)));
            }
        }

        [HttpPut, Route("save")]
        public async Task<IHttpActionResult> UpdateOrder([FromBody] GridDataUpdateRow<Order> request)
        {
            using (var context = new SampleDbContext(false))
            {
                var order = await context.Orders.Where(o => o.OrderID == request.Old.OrderID).FirstOrDefaultAsync();

                if (order == null)
                    return NotFound();

                request.AdjustTimezoneOffset();

                order.Amount = request.New.Amount;
                order.CustomerName = request.New.CustomerName;
                order.IsShipped = request.New.IsShipped;
                order.ShippedDate = request.New.ShippedDate;
                order.ShipperCity = request.New.ShipperCity;

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
            using (var context = new SampleDbContext(false))
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
            using (var context = new SampleDbContext(false))
            {
                var orderId = int.Parse(id);
                var orderDb = await context.Orders.Where(o => o.OrderID == orderId).FirstOrDefaultAsync();

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
            using (var context = new SampleDbContext(false))
            {
                return
                    Ok(
                        await
                            context.Orders.AsNoTracking()
                                .Select(x => x.ShipperCity)
                                .Distinct()
                                .OrderBy(x => x)
                                .ToListAsync());
            }
        }
    }
}