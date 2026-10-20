using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class BMImodel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public float Height { get; set; }

        [Required]
        public float Weight { get; set; }

        public float BMIscore { get; set; }

        public string HealthStatus { get; set; }

        public DateTime Date { get; set; }

        public int UserId { get; set; }
    }
}