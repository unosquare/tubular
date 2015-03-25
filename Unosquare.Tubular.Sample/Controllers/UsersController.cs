using System.Threading.Tasks;
using System.Web.Http;
using Unosquare.Tubular.ObjectModel;
using Unosquare.Tubular.Sample.Models;

namespace Unosquare.Tubular.Sample.Controllers
{
    [RoutePrefix("api/users")]
    public class UsersController : ApiController
    {

        [AllowAnonymous]
        [HttpPost, Route("paged")]
        public async Task<IHttpActionResult> GridData([FromBody] GridDataRequest request)
        {
            using (var context = new SampleDbContext(false))
            {
                return Ok(await Task.Run(() => request.CreateGridDataResponse(context.SystemUsers.AsNoTracking())));
            }
        }

    }
}
