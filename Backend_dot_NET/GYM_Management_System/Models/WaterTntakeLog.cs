using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class WaterTntakeLog
    {
        public int Id { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public int AmountInMl { get; set; }//250ml,500ml

        public int UserId { get; set; }
    }
}