using System;
using System.ComponentModel.DataAnnotations;

namespace GYM_Management_System.Models
{
    public class Achievement
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string BadgeKey { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public DateTime UnlockedAt { get; set; } = DateTime.Now;
    }
}
