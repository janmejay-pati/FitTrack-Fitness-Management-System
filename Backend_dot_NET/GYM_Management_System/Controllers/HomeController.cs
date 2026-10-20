using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using System.Data.Entity;
using static System.Data.Entity.Infrastructure.Design.Executor;

namespace GYM_Management_System.Controllers
{
    public class HomeController : Controller
    {
        FitTrackDbContext db = new FitTrackDbContext();

        // GET: / or /Home/Index (Root Landing Page)
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        // GET: /Home/About
        [HttpGet]
        public ActionResult About()
        {
            ViewBag.Message = "FitTrack is a modern fitness tracking platform designed to empower your wellness journey.";
            return View();
        }

        // GET: /Home/Contact
        [HttpGet]
        public ActionResult Contact()
        {
            ViewBag.Message = "Get in touch with the FitTrack support team.";
            return View();
        }

        //daily dashboard
        public ActionResult DailyDashboard(string period="Today")
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"]);
            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            DateTime weekStart = today.AddDays(-1 * diff).Date;
            DateTime weekEnd = weekStart.AddDays(7).Date;
            DateTime monthStart = new DateTime(today.Year, today.Month, 1);

            // BMI
            var latestBMI = db.BMIs.Where(b => b.UserId == userId).OrderByDescending(b => b.Date).FirstOrDefault();
            if (latestBMI == null)
            {
                var user = db.Users.Find(userId);
                float h = user != null && user.Height.HasValue && user.Height.Value > 0 ? user.Height.Value : 175f;
                float w = user != null && user.Weight.HasValue && user.Weight.Value > 0 ? user.Weight.Value : 70f;
                float hM = h > 3 ? h / 100f : h;
                double score = Math.Round(w / (hM * hM), 1);
                string status = BMIApiController.GetBmiCategory(score);

                latestBMI = new BMImodel
                {
                    UserId = userId,
                    Height = h,
                    Weight = w,
                    BMIscore = (float)score,
                    HealthStatus = status,
                    Date = DateTime.Now
                };
                db.BMIs.Add(latestBMI);
                db.SaveChanges();
            }
            ViewBag.Period = period;

            double bmiScore = latestBMI != null ? latestBMI.BMIscore : 22.0;
            ViewBag.BMIScore = bmiScore;
            ViewBag.BMICategory = GetBMICategory(bmiScore);
            ViewBag.BMIColor = GetBMIColor(bmiScore);

            // Today
            var caloriesToday = db.MealLogs.Where(m => m.UserId == userId && m.Date >= today && m.Date < tomorrow).Sum(m => (int?)m.Calories) ?? 0;
            var workoutToday = db.Workouts.Where(m => m.UserId == userId && m.Date >= today && m.Date < tomorrow).Count();
            var burnedToday = db.Workouts.Where(m => m.UserId == userId && m.Date >= today && m.Date < tomorrow).Sum(m => (int?)m.CaloriesBurned) ?? 0;

            ViewBag.TodayCalories = caloriesToday;
            ViewBag.TodayWorkouts = workoutToday;
            ViewBag.TodayBurned = burnedToday;

            //Weekly
            var caloriesWeek = db.MealLogs.Where(m => m.UserId == userId && m.Date >= weekStart && m.Date < weekEnd).Sum(m => (int?)m.Calories) ?? 0;
            var workoutWeek = db.Workouts.Where(m => m.UserId == userId && m.Date >= weekStart && m.Date < weekEnd).Count();
            var burnedWeek = db.Workouts.Where(m => m.UserId == userId && m.Date >= weekStart && m.Date < weekEnd).Sum(m => (int?)m.CaloriesBurned) ?? 0;

            ViewBag.WeekCalories = caloriesWeek;
            ViewBag.WeekWorkouts = workoutWeek;
            ViewBag.WeekBurned = burnedWeek;

            //Monthly
            var caloriesMonth = db.MealLogs.Where(m => m.UserId == userId && m.Date >= monthStart).Sum(m => (int?)m.Calories) ?? 0;
            var workoutMonth = db.Workouts.Where(m => m.UserId == userId && m.Date >= monthStart).Count();
            var burnedMonth = db.Workouts.Where(m => m.UserId == userId && m.Date >= monthStart).Sum(m => (int?)m.CaloriesBurned) ?? 0;

            ViewBag.MonthCalories = caloriesMonth;
            ViewBag.MonthWorkouts = workoutMonth;
            ViewBag.MonthBurned = burnedMonth;

            //daily goal
            var goal = db.SetGoals.FirstOrDefault(g => g.UserId == userId && g.Date >= today && g.Date < tomorrow)
                    ?? db.SetGoals.Where(g => g.UserId == userId).OrderByDescending(g => g.Date).FirstOrDefault();
            
            int caloriesGoal = goal != null ? goal.CalorieGoal : 0;
            int workoutGoal = goal != null ? goal.WorkoutGoal : 0;
            int waterIntakeGoal = goal != null ? goal.WaterIntakeGoal : 0;
            ViewBag.CalorieGoal = caloriesGoal;
            ViewBag.WorkoutGoal = workoutGoal;
            ViewBag.WaterIntakeGoal = waterIntakeGoal;

            //Cong-Msg
            bool goalReached = caloriesToday >= caloriesGoal && burnedToday >= workoutGoal && caloriesGoal > 0 && workoutGoal > 0;
            ViewBag.Goal = goalReached;
            if (goalReached)
            {
                TempData["GoalMsg"] = $"Congratulations! You’ve reached today’s goals! You consumed {caloriesToday} Kcal and burned {burnedToday} Kcal today.";
            }

            return View(latestBMI);
        }

        private string GetBMICategory(double bmi)
        {
            if (bmi < 18.5) return "Underweight";
            else if (bmi < 24.9) return "Normal";
            else if (bmi < 29.9) return "Overweight";
            else return "Obese";
        }

        private string GetBMIColor(double bmi)
        {
            if (bmi < 18.5) return "#3498db";      // Blue
            else if (bmi < 24.9) return "#2ecc71"; // Green
            else if (bmi < 29.9) return "#f1c40f"; // Yellow
            else return "#e74c3c";                 // Red
        }
    }
}