using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class Suggestion
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string BmiRange { get; set; }
        public string  Type { get; set; }//workout or diet
    }
}