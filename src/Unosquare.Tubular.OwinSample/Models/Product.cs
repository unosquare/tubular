using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Unosquare.Tubular.Sample.Models
{
    public class Product
    {
        [Key]
        public int ProductID { get; set; }

        public string Name { get; set; }
    }
}