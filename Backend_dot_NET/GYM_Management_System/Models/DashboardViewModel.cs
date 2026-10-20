using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class DashboardViewModel
    {
        public List<Workout> Workouts { get; set; }
        public List<MealLog> MealLogs { get; set; }
        public BMImodel LatestBMI { get; set; }

        //public float BMIValue { get; set; }

        //public string BMICategory { get; set; }

        //public int CaloriesConsumed { get; set; }

        //public int CaloriesBurned { get; set; }
        //public int WorkoutCount { get; set; }

    }
}