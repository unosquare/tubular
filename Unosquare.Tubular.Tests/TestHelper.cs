using Effort;
using NUnit.Framework;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Unosquare.Tubular.ObjectModel;
using Unosquare.Tubular.Tests.Database;

namespace Unosquare.Tubular.Tests
{
    [TestFixture]
    public class TestHelper
    {
        private SampleEntities _context;
        private const int PageSize = 10;
        private const string SearchText = "Name - 1";

        [SetUp]
        public void SetUp()
        {
            Effort.Provider.EffortProviderConfiguration.RegisterProvider();

            var connection = DbConnectionFactory.CreateTransient();
            _context = new SampleEntities(connection);
            _context.Fill();
        }

        private void SimpleListTest(bool ignoreTimezone)
        {
            var dataSource = _context.Things;
            var data = dataSource.Take(PageSize).ToList();
            var timezoneOffset = 300;

            Assert.AreEqual(PageSize, data.Count, "Set has 10 items");

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 0,
                Search = new Filter(),
                Columns = Thing.GetColumns(),
                TimezoneOffset = timezoneOffset
            };

            var response = request.CreateGridDataResponse(dataSource);

            Assert.AreEqual(data.Count, response.Payload.Count, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");

            Assert.AreEqual(ignoreTimezone ? data.First().Date : data.First().Date.AddMinutes(-timezoneOffset),
                response.Payload.First()[2], "Same date at first item");

            Assert.AreEqual(dataSource.Count(), response.TotalRecordCount, "Total rows matching");
        }

        [Test]
        public void SimpleList()
        {
            SimpleListTest(false);
        }

        [Test]
        public void SimpleListIgnoreTimezoneOffset()
        {
            // Ignore timezone adjustment
            TubularDefaultSettings.AdjustTimezoneOffset = false;
            SimpleListTest(true);
            TubularDefaultSettings.AdjustTimezoneOffset = true;
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

            Assert.AreEqual(dataSource.Count(x => x.Name.Contains(SearchText)), response.FilteredRecordCount,
                "Total filtered rows matching");
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
            var tubularData = dataSource.CreateTypeAheadList("Number");

            Assert.AreEqual(data.Count, tubularData.Count(), "Same length");
            Assert.AreEqual(data.First(), tubularData.First(), "Same first item");

            var dataFiltered =
                dataSource.Where(x => x.Name.Contains(SearchText))
                    .Select(x => x.Name)
                    .Distinct()
                    .Take(elementsCount)
                    .ToList();
            var tubularDataFiltered = dataSource.CreateTypeAheadList("Name", SearchText);

            Assert.AreEqual(dataFiltered.Count, tubularDataFiltered.Count(), "Same length");
            Assert.AreEqual(dataFiltered.First(), tubularDataFiltered.First(), "Same first item");
        }

        [Test]
        public void TestListSimpleSearch()
        {
            var dataSource = new List<Thing>
            {
                new Thing {Name = SearchText + "1"},
                new Thing {Name = SearchText.ToLower() + "2"},
                new Thing {Name = SearchText.ToUpper() + "3"},
                new Thing {Name = SearchText + "4"},
                new Thing {Name = "ODOR"}
            };

            var data =
                dataSource.Where(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant()))
                    .Take(PageSize)
                    .ToList();

            var request = new GridDataRequest()
            {
                Take = PageSize,
                Skip = 30,
                Search = new Filter()
                {
                    Operator = CompareOperators.Auto,
                    Text = SearchText
                },
                Columns = Thing.GetColumns()
            };


            var response = request.CreateGridDataResponse(dataSource.AsQueryable());

            Assert.AreEqual(dataSource.Count, response.TotalRecordCount, "Same length");
            Assert.AreEqual(data.First().Id, response.Payload.First().First(), "Same first item");
            Assert.AreEqual(data.Count, response.FilteredRecordCount, "Total filtered rows matching");
        }

        [Test]
        public void TestSimpleSearch2()
        {
            var dataSource = new List<Thing>();

            for (var i = 0; i < 422; i++)
            {
                dataSource.Add(new Thing {Color = "red"});
                dataSource.Add(new Thing {Color = "blue"});
                dataSource.Add(new Thing {Color = "yellow"});
            }

            var columns = new[]
            {
                new GridColumn
                {
                    Name = "Color",
                    Sortable = true,
                    Searchable = true,
                    DataType = DataType.String,
                    SortOrder = 2
                },
                new GridColumn {Name = "Id"}
            };
            var request = new GridDataRequest()
            {
                Columns = columns,
                TimezoneOffset = 300,
                Take = 100,
                Skip = 300,
                Search = new Filter()
                {
                    Operator = CompareOperators.Auto,
                    Text = "red"
                }

            };
            var response = request.CreateGridDataResponse(dataSource.AsQueryable());
            Assert.AreEqual(4, response.CurrentPage);
        }

        [Test]
        public void TestArraySimpleSearch()
        {
            var dataSource = new[]
            {
                new Thing {Name = SearchText + "1"},
                new Thing {Name = SearchText.ToLower() + "2"},
                new Thing {Name = SearchText.ToUpper() + "3"},
                new Thing {Name = SearchText + "4"},
                new Thing {Name = "ODOR"}
            };

            var data =
                dataSource.Where(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant()))
                    .Take(PageSize)
                    .ToList();

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

            Assert.AreEqual(dataSource.Count(x => x.Name.ToLowerInvariant().Contains(SearchText.ToLowerInvariant())),
                response.FilteredRecordCount, "Total filtered rows matching");
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

            Assert.AreEqual(dataSource.Sum(x => x.Number), (double) response.AggregationPayload["Number"],
                "Same average number");
            Assert.AreEqual(dataSource.Sum(x => x.DecimalNumber), (decimal) response.AggregationPayload["DecimalNumber"],
                "Same average decimal number");
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

            Assert.AreEqual(dataSource.Select(x => x.Id).Distinct().Count(), (int) response.AggregationPayload["Id"],
                "Id same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Number).Distinct().Count(),
                (int) response.AggregationPayload["Number"], "Number same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.DecimalNumber).Distinct().Count(),
                (int) response.AggregationPayload["DecimalNumber"], "DecimalNumber same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Name).Distinct().Count(), (int) response.AggregationPayload["Name"],
                "Name same distinct count");
            Assert.AreEqual(dataSource.Select(x => x.Date).Distinct().Count(), (int) response.AggregationPayload["Date"],
                "Date same distinct count");
        }
    }
}