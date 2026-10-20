using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class DashboardApiController : ApiControllerBase
    {
        [HttpGet]
        public ActionResult GetStats()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);

            // Today's metrics
            int caloriesConsumedToday = db.MealLogs
                .Where(m => m.UserId == userId && m.Date >= today && m.Date < tomorrow)
                .Select(m => (int?)m.Calories)
                .DefaultIfEmpty(0)
                .Sum() ?? 0;

            int caloriesBurnedToday = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.CaloriesBurned)
                .DefaultIfEmpty(0)
                .Sum() ?? 0;

            int workoutsTodayCount = db.Workouts
                .Count(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow);

            int totalWorkoutMinutesToday = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.Duration)
                .DefaultIfEmpty(0)
                .Sum() ?? 0;

            int waterTodayMl = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.AmountInMl)
                .DefaultIfEmpty(0)
                .Sum() ?? 0;

            // Latest BMI
            var latestBmi = db.BMIs
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Date)
                .FirstOrDefault();

            // Daily Goal
            var goal = db.SetGoals
                .FirstOrDefault(g => g.UserId == userId && g.Date.Year == today.Year && g.Date.Month == today.Month && g.Date.Day == today.Day);

            int targetCalories = goal != null && goal.CalorieGoal > 0 ? goal.CalorieGoal : 2000;
            int targetWorkouts = goal != null && goal.WorkoutGoal > 0 ? goal.WorkoutGoal : 45;
            int targetWater = goal != null && goal.WaterIntakeGoal > 0 ? goal.WaterIntakeGoal : 2500;

            // Activity Streak (days)
            int streak = CalculateStreak(userId);

            return Success(new
            {
                caloriesConsumed = caloriesConsumedToday,
                caloriesBurned = caloriesBurnedToday,
                netCalories = caloriesConsumedToday - caloriesBurnedToday,
                workoutsCount = workoutsTodayCount,
                workoutMinutes = totalWorkoutMinutesToday,
                waterIntake = waterTodayMl,
                streak = streak,
                latestBmi = latestBmi != null ? new
                {
                    score = Math.Round(latestBmi.BMIscore, 1),
                    status = latestBmi.HealthStatus,
                    height = latestBmi.Height,
                    weight = latestBmi.Weight,
                    date = latestBmi.Date
                } : null,
                goals = new
                {
                    calorieGoal = targetCalories,
                    calorieProgress = Math.Min(100, targetCalories > 0 ? (int)((caloriesBurnedToday / (double)targetCalories) * 100) : 0),
                    workoutGoal = targetWorkouts,
                    workoutProgress = Math.Min(100, targetWorkouts > 0 ? (int)((totalWorkoutMinutesToday / (double)targetWorkouts) * 100) : 0),
                    waterGoal = targetWater,
                    waterProgress = Math.Min(100, targetWater > 0 ? (int)((waterTodayMl / (double)targetWater) * 100) : 0),
                    isGoalMet = (caloriesBurnedToday >= targetCalories || totalWorkoutMinutesToday >= targetWorkouts) && waterTodayMl >= targetWater
                }
            });
        }

        [HttpGet]
        public ActionResult GetWeeklyProgress()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            DateTime today = DateTime.Today;
            var days = new List<object>();

            for (int i = 6; i >= 0; i--)
            {
                DateTime day = today.AddDays(-i);
                DateTime nextDay = day.AddDays(1);

                int calBurned = db.Workouts
                    .Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.CaloriesBurned)
                    .DefaultIfEmpty(0)
                    .Sum() ?? 0;

                int calConsumed = db.MealLogs
                    .Where(m => m.UserId == userId && m.Date >= day && m.Date < nextDay)
                    .Select(m => (int?)m.Calories)
                    .DefaultIfEmpty(0)
                    .Sum() ?? 0;

                int waterMl = db.WaterTntakeLogs
                    .Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.AmountInMl)
                    .DefaultIfEmpty(0)
                    .Sum() ?? 0;

                int minutes = db.Workouts
                    .Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.Duration)
                    .DefaultIfEmpty(0)
                    .Sum() ?? 0;

                days.Add(new
                {
                    day = day.ToString("ddd"),
                    date = day.ToString("yyyy-MM-dd"),
                    caloriesBurned = calBurned,
                    caloriesConsumed = calConsumed,
                    waterIntake = waterMl,
                    workoutMinutes = minutes
                });
            }

            return Success(days);
        }

        [HttpGet]
        public ActionResult GetRecentActivity()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var recentWorkouts = db.Workouts
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.Date)
                .Take(5)
                .ToList()
                .Select(w => new
                {
                    id = w.Id,
                    type = "workout",
                    title = w.Exercise,
                    category = w.ExerciseType,
                    intensity = w.Intensity,
                    duration = w.Duration,
                    calories = w.CaloriesBurned,
                    date = w.Date
                });

            var recentMeals = db.MealLogs
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Date)
                .Take(5)
                .ToList()
                .Select(m => new
                {
                    id = m.Id,
                    type = "meal",
                    title = m.FoodItems,
                    category = m.MealType,
                    calories = m.Calories,
                    date = m.Date
                });

            return Success(new
            {
                workouts = recentWorkouts,
                meals = recentMeals
            });
        }

        private int CalculateStreak(int userId)
        {
            var cutoff = DateTime.Today.AddDays(-120);
            var workoutDates = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= cutoff)
                .Select(w => DbFunctions.TruncateTime(w.Date))
                .Distinct()
                .ToList();

            var mealDates = db.MealLogs
                .Where(m => m.UserId == userId && m.Date >= cutoff)
                .Select(m => DbFunctions.TruncateTime(m.Date))
                .Distinct()
                .ToList();

            var activeDays = new HashSet<DateTime>(
                workoutDates.Concat(mealDates)
                    .Where(d => d.HasValue)
                    .Select(d => d.Value.Date)
            );

            int streak = 0;
            DateTime checkDate = DateTime.Today;

            if (!activeDays.Contains(checkDate))
            {
                checkDate = checkDate.AddDays(-1);
            }

            while (activeDays.Contains(checkDate) && streak < 365)
            {
                streak++;
                checkDate = checkDate.AddDays(-1);
            }

            return streak;
        }
    }
}
