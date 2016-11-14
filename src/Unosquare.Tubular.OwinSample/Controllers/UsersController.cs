namespace Unosquare.Tubular.Sample.Controllers
{
    using System.Web.Http;
    using Unosquare.Tubular.ObjectModel;
    using Unosquare.Tubular.Sample.Models;

    [RoutePrefix("api/users")]
    public class UsersController : ApiController
    {
        [HttpPost, Route("paged")]
        public IHttpActionResult GridData([FromBody] GridDataRequest request)
        {
            using (var context = new SampleDbContext())
            {
                return Ok(request.CreateGridDataResponse(context.SystemUsers.AsNoTracking()));
            }
        }
    }
}