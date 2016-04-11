using System.Linq;
using Effort;
using NUnit.Framework;
using Unosquare.Tubular.Tests.Database;

namespace Unosquare.Tubular.Tests
{
    [TestFixture]
    public class DataSourceFixture
    {
        private SampleEntities _context;
        private DataSourceRepository _repo;

        [SetUp]
        public void SetUp()
        {
            Effort.Provider.EffortProviderConfiguration.RegisterProvider();

            var connection = DbConnectionFactory.CreateTransient();
            _context = new SampleEntities(connection);
            _context.Fill();

            _repo = new DataSourceRepository();
            _repo.AddSource(_context.Things);
        }
        
        [Test]
        public void GetMetadata()
        {
            var metadata = _repo.GetMetadata();

            Assert.IsNotNull(metadata);
            Assert.IsNotNull(metadata.DataSources);
            Assert.AreEqual(metadata.DataSources.First().Name, typeof(Thing).Name);
            // TODO: Continue
        }
    }
}
