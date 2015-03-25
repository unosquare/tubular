using System.Data.Entity;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using Unosquare.Tubular.ObjectModel;
using Unosquare.Tubular.Sample.Models;

namespace Unosquare.Tubular.Sample.Controllers
{
    [RoutePrefix("api/orders")]
    public class OrdersController : ApiController
    {

        //[Authorize(Roles = "user")]
        [AllowAnonymous]
        [HttpGet, Route("")]
        public async Task<IHttpActionResult> Get()
        {
            var userPrincipal = this.ControllerContext.RequestContext.Principal as ClaimsPrincipal;

            var userName = userPrincipal.Identity.Name;
            var userRoles = userPrincipal.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);

            using (var context = new SampleDbContext(false))
            {
                return Ok(await context.Orders.AsNoTracking().ToListAsync());
            }
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
        [HttpPost, Route("paged")]
        public async Task<IHttpActionResult> GridData([FromBody] GridDataRequest request)
        {
            using (var context = new SampleDbContext(false))
            {
                //await Task.Delay(500);
                return Ok(await Task.Run(() => request.CreateGridDataResponse(context.Orders.AsNoTracking())));
            }
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [HttpGet, Route("html")]
        public IHttpActionResult GetHtml()
        {
            var content = new System.Text.StringBuilder();
            content.AppendLine("<!DOCTYPE html>");
            content.AppendLine("<html><head></head><body>HELLO!</body></html>");
            var response = new HttpResponseMessage()
            {
                Content = new StringContent(content.ToString(), System.Text.Encoding.UTF8, "text/html")
            };
            return ResponseMessage(response);
        }

        [AllowAnonymous]
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
