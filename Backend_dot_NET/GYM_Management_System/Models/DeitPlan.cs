using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class DietPlan
    {
        public int Id { get; set; }
        public string PlanName { get; set; }
        public string Description { get; set; }
        public string MealType { get; set; }//Breakfast,lunch,dinner,snacks
        public string BmiCategory { get; set; }
        public int UserId { get; set; }
        public int Calories { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }
}