using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class WorkoutPlan
    {

        public int Id { get; set; }
        public string PlanName { get; set; }
        public string Description { get; set; }
        public string IntensityLevel { get; set; }//low,medium,high
        public string BmiCategory { get; set; }//Underweight,normal,overweight,obese
        public int UserId { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public bool IsActive { get; set; } = true;
    }
}