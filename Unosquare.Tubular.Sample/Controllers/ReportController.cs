namespace Unosquare.Tubular.Sample.Controllers
{
    using System.Web.Http;
    using Unosquare.Tubular.ObjectModel;
    using Unosquare.Tubular.Sample.Application;
    using Unosquare.Tubular.Sample.Models;

    [RoutePrefix("api/reports")]
    public class ReportController : ApiController
    {
        private readonly SampleDbContext _database = new SampleDbContext();
        private readonly DataSourceRepository _dataSources;

        public ReportController()
        {
            _dataSources = _database.GetDataSourceRepository();
            // Adding additional relation
            //_dataSources.First(x => x.Name == typeof (Order).Name)
            //.Joins.Add(new DataSourceJoinConfig("Order", "WarehouseID", "Warehouse", "WarehouseID"));
            //.WithJoin<Order, Warehouse, int>(x => x.WarehouseID.Value, x => x.WarehouseID);
        }

        [HttpGet, Route("datasources")]
        public IHttpActionResult GetDataSources()
        {
            return Ok(_dataSources.GetMetadata());
        }

        [HttpPost, Route("getmarkup")]
        public IHttpActionResult GetMarkup(DataSourceItemModel[] data)
        {
            var columns = _dataSources.GenerateModels(data);

            var options = Common.DefaultGridOptions;
            options.DataUrl = "api/reports/proxy";
            options.RequestMethod = "POST";

            var markup = CodeGenerator.GenerateGrid(columns, options);

            return Ok(markup);
        }

        [HttpPost, Route("proxy")]
        public IHttpActionResult GetProxyData([FromBody] GridDataRequest model)
        {
            return Ok(_dataSources.CreateGridDataResponseFromDataSource(model));
        }
    }
}