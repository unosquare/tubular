namespace Unosquare.Tubular.Tests
{
    using System.Linq;
    using NUnit.Framework;
    using Database;

    [TestFixture]
    public class ChartFixture
    {
        IQueryable<Thing> sut;
        private const string ColorTest = "red";

        [SetUp]
        public void SetUp()
        {
            sut = SampleEntities.GenerateData().AsQueryable();
        }

        

        [Test]
        public void GetSingleSerieChart()
        {
            
            var chartObj = sut.ProvideSingleSerieChartResponse(
                label: x => x.Color,
                value: x => x.DecimalNumber);

            var query = sut.Where(x => x.Color == ColorTest).Sum(x => x.DecimalNumber);

            Assert.IsNotNull(chartObj);

            var colorIndex = chartObj.Labels.ToList().IndexOf(ColorTest);

            Assert.IsTrue(colorIndex >= 0);

            var value = chartObj.Data[colorIndex];

            Assert.AreEqual(value, query);
        }
    }
}
