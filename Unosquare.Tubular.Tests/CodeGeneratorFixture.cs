using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;

namespace Unosquare.Tubular.Tests
{
    [TestFixture]
    public class CodeGeneratorFixture
    {
        public object Model = new
        {
            Id = 8,
            Name = "Guzman Webster",
            Company = "IDEGO",
            Email = "guzmanwebster@idego.com",
            Phone = "+1 (869) 428-2675",
            Birthday = new DateTime(1996, 3, 1, 1, 57, 47),
            IsOwner = false
        };

        [Test]
        public void CreateColumns()
        {
            var columns = CodeGenerator.CreateColumns(Model);

            Assert.IsNotNull(columns, "It is not null");
            Assert.AreEqual(columns.Count, 7, "It has 7 columns");
        }

        [Test]
        public void GenerateFieldsArray()
        {
            var columns = CodeGenerator.CreateColumns(Model);
            var fields = CodeGenerator.GenerateFieldsArray(columns);

            Assert.IsNotNull(fields, "It is not null");
            Assert.AreEqual(fields.Count, 7, "It has 7 fields");
            Assert.AreEqual(fields[0],
                "\r\n\t<tb-numeric-editor name=\"Id\"\r\n\t\tlabel=\"Id\" show-label=\"True\"\r\n\t\tplaceholder=\"\"\r\n\t\trequired=\"True\"\r\n\t\tread-only=\"False\"\r\n\t\tformat=\"\"\r\n\t\thelp=\"\">\r\n\t</tb-numeric-editor>",
                "First field is equal");
        }

        [Test]
        public void GenerateCells()
        {
            var columns = CodeGenerator.CreateColumns(Model);
            var cells = CodeGenerator.GenerateCells(columns, "Inline");

            Assert.IsNotNull(cells, "It is not null");
            Assert.AreEqual(cells,
                "\r\n\t\t<tb-cell-template column-name=\"Id\">\r\n\t\t\t<tb-numeric-editor is-editing=\"row.$isEditing\" value=\"row.Id\"></tb-numeric-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Name\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Name\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Company\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Company\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Email\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Email\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Phone\">\r\n\t\t\t<tb-simple-editor is-editing=\"row.$isEditing\" value=\"row.Phone\"></tb-simple-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"Birthday\">\r\n\t\t\t<tb-date-time-editor is-editing=\"row.$isEditing\" value=\"row.Birthday\"></tb-date-time-editor>\r\n\t\t</tb-cell-template>\r\n\t\t<tb-cell-template column-name=\"IsOwner\">\r\n\t\t\t<tb-checkbox-field is-editing=\"row.$isEditing\" value=\"row.IsOwner\"></tb-checkbox-field>\r\n\t\t</tb-cell-template>",
                "Value match");
        }
    }
}