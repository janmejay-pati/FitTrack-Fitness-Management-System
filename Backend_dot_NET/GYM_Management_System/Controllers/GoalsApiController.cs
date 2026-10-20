using System;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class GoalsApiController : ApiControllerBase
    {
        public class GoalDto
        {
            public int? Id { get; set; }
            public int CalorieGoal { get; set; }
            public int WorkoutGoal { get; set; }
            public int WaterIntakeGoal { get; set; }
            public DateTime? Date { get; set; }
        }

        [HttpGet]
        public ActionResult Get()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);

            var todayGoal = db.SetGoals
                .FirstOrDefault(g => g.UserId == userId && g.Date.Year == today.Year && g.Date.Month == today.Month && g.Date.Day == today.Day);

            var pastGoals = db.SetGoals
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.Date)
                .Take(20)
                .ToList()
                .Select(g => new
                {
                    id = g.Id,
                    calorieGoal = g.CalorieGoal,
                    workoutGoal = g.WorkoutGoal,
                    waterIntakeGoal = g.WaterIntakeGoal,
                    isCompleted = g.IsCompleted,
                    date = g.Date
                });

            // Calculate current today's progress
            int calBurnedToday = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.CaloriesBurned).DefaultIfEmpty(0).Sum() ?? 0;

            int workoutMinsToday = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.Duration).DefaultIfEmpty(0).Sum() ?? 0;

            int waterToday = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.AmountInMl).DefaultIfEmpty(0).Sum() ?? 0;

            return Success(new
            {
                current = todayGoal != null ? new
                {
                    id = todayGoal.Id,
                    calorieGoal = todayGoal.CalorieGoal,
                    workoutGoal = todayGoal.WorkoutGoal,
                    waterIntakeGoal = todayGoal.WaterIntakeGoal,
                    isCompleted = todayGoal.IsCompleted,
                    date = todayGoal.Date
                } : null,
                todayProgress = new
                {
                    caloriesBurned = calBurnedToday,
                    workoutMinutes = workoutMinsToday,
                    waterIntake = waterToday
                },
                history = pastGoals
            });
        }

        [HttpPost]
        public ActionResult Create(GoalDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null) return Fail("Goal parameters are required");

            int userId = CurrentUserId.Value;
            DateTime targetDate = model.Date ?? DateTime.Today;

            // Check if goal for today already exists
            var existing = db.SetGoals
                .FirstOrDefault(g => g.UserId == userId && g.Date.Year == targetDate.Year && g.Date.Month == targetDate.Month && g.Date.Day == targetDate.Day);

            if (existing != null)
            {
                existing.CalorieGoal = model.CalorieGoal > 0 ? model.CalorieGoal : existing.CalorieGoal;
                existing.WorkoutGoal = model.WorkoutGoal > 0 ? model.WorkoutGoal : existing.WorkoutGoal;
                existing.WaterIntakeGoal = model.WaterIntakeGoal > 0 ? model.WaterIntakeGoal : existing.WaterIntakeGoal;
                db.SaveChanges();

                return Success(new
                {
                    id = existing.Id,
                    calorieGoal = existing.CalorieGoal,
                    workoutGoal = existing.WorkoutGoal,
                    waterIntakeGoal = existing.WaterIntakeGoal,
                    date = existing.Date,
                    isCompleted = existing.IsCompleted
                }, "Daily goal updated");
            }

            var newGoal = new SetGoal
            {
                UserId = userId,
                CalorieGoal = model.CalorieGoal > 0 ? model.CalorieGoal : 2000,
                WorkoutGoal = model.WorkoutGoal > 0 ? model.WorkoutGoal : 45,
                WaterIntakeGoal = model.WaterIntakeGoal > 0 ? model.WaterIntakeGoal : 2500,
                Date = targetDate,
                IsCompleted = false
            };

            db.SetGoals.Add(newGoal);
            db.SaveChanges();

            return Success(new
            {
                id = newGoal.Id,
                calorieGoal = newGoal.CalorieGoal,
                workoutGoal = newGoal.WorkoutGoal,
                waterIntakeGoal = newGoal.WaterIntakeGoal,
                date = newGoal.Date,
                isCompleted = newGoal.IsCompleted
            }, "New daily goal established");
        }

        [HttpPost]
        public ActionResult ToggleComplete(int id)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var goal = db.SetGoals.FirstOrDefault(g => g.Id == id && g.UserId == userId);
            if (goal == null) return NotFoundResponse();

            goal.IsCompleted = !goal.IsCompleted;
            db.SaveChanges();

            if (goal.IsCompleted && !db.Achievements.Any(a => a.UserId == userId && a.BadgeKey == "goal_crusher"))
            {
                db.Achievements.Add(new Achievement
                {
                    UserId = userId,
                    BadgeKey = "goal_crusher",
                    Title = "Goal Crusher",
                    Description = "Crushed and completed your daily target goal!",
                    Icon = "target",
                    UnlockedAt = DateTime.Now
                });
                db.Notifications.Add(new Notification
                {
                    UserId = userId,
                    Title = "Badge Unlocked: Goal Crusher!",
                    Message = "You finished your daily targets. Outstanding discipline!",
                    Type = "success",
                    CreatedAt = DateTime.Now
                });
                db.SaveChanges();
            }

            return Success(new { id = goal.Id, isCompleted = goal.IsCompleted }, "Goal status toggled");
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var goal = db.SetGoals.FirstOrDefault(g => g.Id == id && g.UserId == userId);
            if (goal == null) return NotFoundResponse();

            db.SetGoals.Remove(goal);
            db.SaveChanges();

            return Success(null, "Goal removed");
        }
    }
}
