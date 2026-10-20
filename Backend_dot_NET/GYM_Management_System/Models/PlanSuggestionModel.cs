using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class PlanSuggestionModel
    {
        public List<WorkoutPlan> WorkoutPlans { get; set; }
        public List<DietPlan> DietPlans { get; set; }
        public string BmiCategory { get; set; }
    }
}