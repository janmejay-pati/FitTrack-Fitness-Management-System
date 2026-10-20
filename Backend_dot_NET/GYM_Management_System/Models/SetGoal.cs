using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GYM_Management_System.Models
{
    public class SetGoal
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CalorieGoal { get; set; }

        [Required]
        public int WorkoutGoal { get; set; }

        [Required]
        public int WaterIntakeGoal { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public Nullable<int> UserId { get; set; }
        public bool IsCompleted { get; set; } = false;
    }
}