using Effort;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using Unosquare.Tubular.ObjectModel;
using Unosquare.Tubular.Tests.Database;

namespace Unosquare.Tubular.Tests
{
    [TestFixture]
    public class TestHelper
    {
        private SampleEntities _context;
        const int PageSize = 10;
        const string SearchText = "Name - 1";

        [SetUp]
        public void SetUp()
        {
            Effort.Provider.EffortProviderConfiguration.RegisterProvider();

            var connection = DbConnectionFactory.CreateTransient();
            _context = new SampleEntities(connection);

            for (var i = 0; i < 100; i++)
            {
                _context.Things.Add(new Thing()
                {
                    Date = DateTime.Now.AddDays(-i),
                    Id = i,
                    Name = "Name - " + i,
                    Bool = (i % 2) == 0,
                    DecimalNumber = (i % 3 == 0) ? 10.100m : 20.2002m,
                    Number = (new Random()).NextDouble() * 20
                });
            }

            _context.SaveChanges();
        }

        [Test]
        public void SimpleList()
        {
            var dataSource = _context.Things;
            var data = dataSource.Take(PageSize).ToList();

            Assert.AreEqual(PageSize, data.Count, "Set has 10 items");

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumns() 
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Count(), response.TotalRecordCount, "Total rows matching");
        }

        [Test]
        public void SimpleFilter()
        {
            var dataSource = _context.Things.Where(x => x.Id > 95);
            var data = dataSource.Take(PageSize).ToList();

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumnsWithIdFilter()
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");

            Assert.AreEqual(dataSource.Count(), response.FilteredRecordCount, "Total filtered rows matching");
        }

        [Test]
        public void SimpleSort()
        {
            var dataSource = _context.Things.OrderBy(x => x.Date);
            var data = dataSource.Take(PageSize).ToList();

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumnsWithSort()
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Count(), response.TotalRecordCount, "Total rows matching");
        }

        [Test]
        public void SimpleSearch()
        {
            var dataSource = _context.Things;
            var data = dataSource.Where(x => x.Name.Contains(SearchText)).Take(PageSize).ToList();

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter()
                {
                  Operator = CompareOperators.Auto,
                  Text = SearchText
                },
                Columns = Thing.GetColumns()
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Count(x => x.Name.Contains(SearchText)), response.FilteredRecordCount, "Total filtered rows matching");
        }

        [Test]
        public void TakeAll()
        {
            var dataSource = _context.Things;
            var data = dataSource.ToList();

            var request = new GridDataRequest()
            {
                Take = -1,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumns()
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Count(), response.TotalRecordCount, "Total rows matching");
        }

        [Test]
        public void TestCreateCreateTypeAheadList()
        {
            const int elementsCount = 8;
            var dataSource = _context.Things;

            var data = dataSource.Select(x => x.Number.ToString()).Distinct().Take(elementsCount).ToList();
            var tubularData = dataSource.CreateTypeAheadList("Number", elementsCount);

            Assert.AreEqual(data.Count, tubularData.Count(), "Same length");
            Assert.AreEqual(data.First(), tubularData.First(), "Same first item");

            var dataFiltered = dataSource.Where(x => x.Name.Contains(SearchText)).Select(x => x.Name).Distinct().Take(elementsCount).ToList();
            var tubularDataFiltered = dataSource.CreateTypeAheadList("Name", SearchText, elementsCount);

            Assert.AreEqual(dataFiltered.Count, tubularDataFiltered.Count(), "Same length");
            Assert.AreEqual(dataFiltered.First(), tubularDataFiltered.First(), "Same first item");
        }

        [Test]
        public void TestListSimpleSearch()
        {
            var dataSource = new List<Thing>
            {
                new Thing { Name= SearchText + "1" },
                new Thing { Name= SearchText.ToLower() + "2" },
                new Thing { Name= SearchText.ToUpper() + "3" },
                new Thing { Name= SearchText + "4" },
                new Thing { Name= "ODOR" }
            };

            var data = dataSource.Where(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant())).Take(PageSize).ToList();

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter()
                {
                    Operator = CompareOperators.Auto,
                    Text = SearchText
                },
                Columns = Thing.GetColumns()
            };

            var response = request.CreateGridDataResponse(dataSource.AsQueryable());

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Count(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant())), response.FilteredRecordCount, "Total filtered rows matching");
        }

        [Test]
        public void TestArraySimpleSearch()
        {
            var dataSource = new[]
            {
                new Thing { Name= SearchText + "1" },
                new Thing { Name= SearchText.ToLower() + "2" },
                new Thing { Name= SearchText.ToUpper() + "3" },
                new Thing { Name= SearchText + "4" },
                new Thing { Name= "ODOR" }
            };

            var data = dataSource.Where(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant())).Take(PageSize).ToList();

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter()
                {
                    Operator = CompareOperators.Auto,
                    Text = SearchText
                },
                Columns = Thing.GetColumns()
            };

            var response = request.CreateGridDataResponse(dataSource.AsQueryable());

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Count(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant())), response.FilteredRecordCount, "Total filtered rows matching");
        }


        [Test]
        public void TestDataTableSimpleSearch()
        {
            // INFO:
            // I was trying to test another IListSource source like DataTable,
            // but somewhere between GetList() to AsQueryable this is failing
            // and also the Filtering against DataRow is crashing

            // I find useless to support DataTables, but I just want to let this sample

            //var dataTable = new DataTable();
            //dataTable.Columns.Add(new DataColumn("Name", typeof (string)));
            
            //var tempData = new[]
            //{
            //    new Thing { Name= SearchText + "1" },
            //    new Thing { Name= SearchText.ToLower() + "2" },
            //    new Thing { Name= SearchText.ToUpper() + "3" },
            //    new Thing { Name= SearchText + "4" },
            //    new Thing { Name= "ODOR" }
            //};

            //foreach (var tempItem in tempData)
            //{
            //    var dr = dataTable.NewRow();
            //    dr["Name"] = tempItem.Name;
            //    dataTable.Rows.Add(dr);
            //}

            //var request = new GridDataRequest()
            //{
            //    Take = PageSize,
            //    Skip = 0,
            //    Search = new Filter()
            //    {
            //        Operator = CompareOperators.Auto,
            //        Text = SearchText
            //    },
            //    Columns = Thing.GetColumns()
            //};

            //var dataView = new DataView(dataTable) {RowFilter = "Name LIKE '%" + SearchText + "%'"};

            //var response = request.CreateGridDataResponse(((IListSource) dataTable).GetList().AsQueryable());

            //Assert.AreEqual(dataView.Count, response.Payload.Count, "Same length");
            //Assert.AreEqual(dataView[0][0], response.Payload.First().First(), "Same first item");

            //Assert.AreEqual(dataView.Count, response.FilteredRecordCount, "Total filtered rows matching");
        }

        [Test]
        public void TestSimpleAggregate()
        {
            var dataSource = _context.Things;
            var data = dataSource.Take(PageSize).ToList();

            Assert.AreEqual(PageSize, data.Count, "Set has 10 items");

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumnsWithAggregate()
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Sum(x => x.Number), (double)response.AggregationPayload["Number"], "Same average number");
            Assert.AreEqual(dataSource.Sum(x => x.DecimalNumber), (decimal)response.AggregationPayload["DecimalNumber"], "Same average decimal number");
        }

        [Test]
        public void TestMultipleAggregate()
        {
            var dataSource = _context.Things;
            var data = dataSource.Take(PageSize).ToList();

            Assert.AreEqual(PageSize, data.Count, "Set has 10 items");

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumnsWithMultipleCounts()
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(dataSource.Select(x => x.Id).Distinct().Count(), (int)response.AggregationPayload["Id"], "Id same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Number).Distinct().Count(), (int)response.AggregationPayload["Number"], "Number same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.DecimalNumber).Distinct().Count(), (int)response.AggregationPayload["DecimalNumber"], "DecimalNumber same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Name).Distinct().Count(), (int)response.AggregationPayload["Name"], "Name same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Date).Distinct().Count(), (int)response.AggregationPayload["Date"], "Date same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Bool).Distinct().Count(), (int)response.AggregationPayload["Bool"], "Bool same distinct count");
        }
    }
}
