namespace Unosquare.Tubular.Sample.Controllers
{
    using System;
    using System.Linq;
    using System.Web.Http;
    using Unosquare.Tubular.ObjectModel;
    using Unosquare.Tubular.Sample.Application;
    using Unosquare.Tubular.Sample.Models;

    [RoutePrefix("api/reports")]
    public class ReportController : ApiController
    {
        private readonly SampleDbContext _database = new SampleDbContext(false);
        private DataSourceRepository _dataSources;

        public ReportController()
        {
            _dataSources = _database.GetDataSourceRepository();
        }

        public class ReportColumn
        {
            public AggregationFunction Aggregation { get; set; }
            public string Column { get; set; }
            public string DataSource { get; set; }
            public string DataType { get; set; }
        }

        [HttpGet, Route("datasources")]
        public IHttpActionResult GetDataSources()
        {
            return Ok(new
            {
                DataSources = _dataSources,
                AggregationFunctions = Enum.GetNames(typeof (AggregationFunction))
            });
        }

        [HttpPost, Route("getmarkup")]
        public IHttpActionResult GetMarkup(ReportColumn[] data)
        {
            var columns = data.Select(column => new ModelColumn
            {
                DataType = CodeGenerator.GetDataTypeFromString(column.DataType),
                Name = column.DataSource + "_" + column.Column,
                Label = column.Column.Humanize(),
                Template = "{{row." + column.DataSource + "_" + column.Column + "}}",
                EditorType = CodeGenerator.GetEditorTypeByDataType(CodeGenerator.GetDataTypeFromString(column.DataType)),
                Visible = true,
                Sortable = true,
                Searchable = column.DataType.ToLower() == "string",
                MetaAggregate = column.Aggregation
            }).ToList();

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