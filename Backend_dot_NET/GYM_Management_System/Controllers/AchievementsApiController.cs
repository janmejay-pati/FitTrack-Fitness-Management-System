using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class AchievementsApiController : ApiControllerBase
    {
        public class BadgeDefinition
        {
            public string Key { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Icon { get; set; }
            public int RequiredCount { get; set; }
        }

        [HttpGet]
        public ActionResult Get()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            // Fetch user activity metrics
            int workoutCount = db.Workouts.Count(w => w.UserId == userId);
            int mealCount = db.MealLogs.Count(m => m.UserId == userId);
            int bmiCount = db.BMIs.Count(b => b.UserId == userId);
            bool hasMaxWaterDay = db.WaterTntakeLogs
                .GroupBy(w => new { w.UserId, w.Date.Year, w.Date.Month, w.Date.Day })
                .Where(g => g.Key.UserId == userId)
                .Select(g => g.Sum(x => x.AmountInMl))
                .Any(sum => sum >= 2500);
            bool hasCompletedGoal = db.SetGoals.Any(g => g.UserId == userId && g.IsCompleted);

            // Existing unlocked achievements
            var existingKeys = db.Achievements
                .Where(a => a.UserId == userId)
                .ToDictionary(a => a.BadgeKey, a => a.UnlockedAt);

            var definitions = new List<BadgeDefinition>
            {
                new BadgeDefinition { Key = "first_workout", Title = "First Sweat", Description = "Log your first workout session", Icon = "zap", RequiredCount = 1 },
                new BadgeDefinition { Key = "consistency_master", Title = "Consistency Master", Description = "Complete 10 total workout sessions", Icon = "shield-check", RequiredCount = 10 },
                new BadgeDefinition { Key = "hydration_hero", Title = "Hydration Hero", Description = "Hit 2,500ml water intake in a day", Icon = "droplet", RequiredCount = 1 },
                new BadgeDefinition { Key = "goal_crusher", Title = "Goal Crusher", Description = "Successfully complete any daily health goal", Icon = "target", RequiredCount = 1 },
                new BadgeDefinition { Key = "nutrition_pro", Title = "Fuel Master", Description = "Log at least 5 meals to track nutrition", Icon = "utensils", RequiredCount = 5 },
                new BadgeDefinition { Key = "bmi_explorer", Title = "Self Awareness", Description = "Calculate your Body Mass Index (BMI)", Icon = "activity", RequiredCount = 1 }
            };

            bool changed = false;

            var result = new List<object>();

            foreach (var b in definitions)
            {
                bool eligible = false;
                int currentProgress = 0;

                switch (b.Key)
                {
                    case "first_workout":
                        eligible = workoutCount >= 1;
                        currentProgress = Math.Min(1, workoutCount);
                        break;
                    case "consistency_master":
                        eligible = workoutCount >= 10;
                        currentProgress = Math.Min(10, workoutCount);
                        break;
                    case "hydration_hero":
                        eligible = hasMaxWaterDay;
                        currentProgress = hasMaxWaterDay ? 1 : 0;
                        break;
                    case "goal_crusher":
                        eligible = hasCompletedGoal;
                        currentProgress = hasCompletedGoal ? 1 : 0;
                        break;
                    case "nutrition_pro":
                        eligible = mealCount >= 5;
                        currentProgress = Math.Min(5, mealCount);
                        break;
                    case "bmi_explorer":
                        eligible = bmiCount >= 1;
                        currentProgress = Math.Min(1, bmiCount);
                        break;
                }

                DateTime? unlockedAt = null;

                if (existingKeys.ContainsKey(b.Key))
                {
                    unlockedAt = existingKeys[b.Key];
                }
                else if (eligible)
                {
                    // Auto-unlock and persist
                    var ach = new Achievement
                    {
                        UserId = userId,
                        BadgeKey = b.Key,
                        Title = b.Title,
                        Description = b.Description,
                        Icon = b.Icon,
                        UnlockedAt = DateTime.Now
                    };
                    db.Achievements.Add(ach);
                    unlockedAt = ach.UnlockedAt;
                    changed = true;
                }

                result.Add(new
                {
                    key = b.Key,
                    title = b.Title,
                    description = b.Description,
                    icon = b.Icon,
                    isUnlocked = unlockedAt.HasValue,
                    unlockedAt = unlockedAt,
                    currentProgress = currentProgress,
                    requiredCount = b.RequiredCount,
                    progressPercentage = Math.Min(100, (int)((currentProgress / (double)b.RequiredCount) * 100))
                });
            }

            if (changed)
            {
                db.SaveChanges();
            }

            return Success(result);
        }
    }
}
