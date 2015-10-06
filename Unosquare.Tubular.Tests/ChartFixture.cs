using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Effort;
using NUnit.Framework;
using Unosquare.Tubular.Tests.Database;

namespace Unosquare.Tubular.Tests
{
    [TestFixture]
    public class ChartFixture
    {
        private SampleEntities _context;
        private const string ColorTest = "red";

        [SetUp]
        public void SetUp()
        {
            Effort.Provider.EffortProviderConfiguration.RegisterProvider();

            var connection = DbConnectionFactory.CreateTransient();
            _context = new SampleEntities(connection);
            _context.Fill();
        }

        [Test]
        public void GetSingleSerieChart()
        {
            var chartObj = _context.Things.ProvideSingleSerieChartResponse(
                label: x => x.Color,
                value: x => x.DecimalNumber);

            var query = _context.Things.Where(x => x.Color == ColorTest).Sum(x => x.DecimalNumber);

            Assert.IsNotNull(chartObj);

            var colorIndex = chartObj.Labels.ToList().IndexOf(ColorTest);

            Assert.IsTrue(colorIndex >= 0);

            var value = chartObj.Data[colorIndex];

            Assert.AreEqual(value, query);
        }
    }
}
