using NUnit.Framework;
using System;
using System.Linq;
using Effort;
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
                    Number = (new Random()).NextDouble() * i
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
            var dataSource = _context.Things.Where(x => x.Name.Contains(SearchText));
            var data = dataSource.Take(PageSize).ToList();

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

            Assert.AreEqual(dataSource.Count(), response.FilteredRecordCount, "Total filtered rows matching");
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

            var data = dataSource.Select(x => x.Number.ToString()).Take(elementsCount).ToList();
            var tubularData = dataSource.CreateTypeAheadList("Number", elementsCount);

            Assert.AreEqual(data.Count, tubularData.Count(), "Same length");
            Assert.AreEqual(data.First(), tubularData.First(), "Same first item");

            var dataFiltered = dataSource.Where(x => x.Name.Contains(SearchText)).Select(x => x.Name).Take(elementsCount).ToList();
            var tubularDataFiltered = dataSource.CreateTypeAheadList("Name", SearchText, elementsCount);

            Assert.AreEqual(dataFiltered.Count, tubularDataFiltered.Count(), "Same length");
            Assert.AreEqual(dataFiltered.First(), tubularDataFiltered.First(), "Same first item");
        }
    }
}
