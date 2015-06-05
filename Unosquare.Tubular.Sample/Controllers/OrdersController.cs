namespace Unosquare.Tubular.Sample.Controllers
{
    using System.Data.Entity;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web.Http;
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

                return Ok(order);
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

        [HttpPut, Route("save")]
        public async Task<IHttpActionResult> UpdateOrder([FromBody] GridDataUpdateRow<Order> request)
        {
            using (var context = new SampleDbContext(false))
            {
                var order = await context.Orders.Where(o => o.OrderID == request.Old.OrderID).FirstOrDefaultAsync();

                if (order == null)
                    return NotFound();

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
                context.Orders.Add(order);
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