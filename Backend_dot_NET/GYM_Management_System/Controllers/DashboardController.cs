using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GYM_Management_System.Controllers
{
    public class DashboardController : Controller
    {
        FitTrackDbContext db = new FitTrackDbContext();

        // GET: Dashboard
        // after login redirect here
        public ActionResult Index()
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = int.Parse(Session["UserId"].ToString());

            var mealLogs = db.MealLogs.Where(m => m.UserId == userId).ToList();
            var workout = db.Workouts.Where(m => m.UserId == userId).ToList();
            var latestBMI = db.BMIs.Where(m => m.UserId == userId).OrderByDescending(m => m.Date).FirstOrDefault();

            // Check if BMI is available or not; if not, create a default BMI to prevent error
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

            ViewBag.BMIscore = latestBMI.BMIscore;
            ViewBag.HealthStatus = latestBMI.HealthStatus;
            ViewBag.Height = latestBMI.Height;
            ViewBag.Weight = latestBMI.Weight;
            ViewBag.Date = latestBMI.Date;

            var viewModel = new DashboardViewModel
            {
                Workouts = workout,
                MealLogs = mealLogs,
                LatestBMI = latestBMI,
            };

            // Water Intake
            DateTime today = DateTime.Today;
            var tomorrow = today.AddDays(1);
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = today.AddDays(-1 * diff).Date;
            var weekEnd = weekStart.AddDays(7).Date;

            var waterLog = db.WaterTntakeLogs.Where(model => model.UserId == userId && model.Date >= weekStart && model.Date < weekEnd).ToList();

            // progress bar          
            var goal = db.SetGoals.FirstOrDefault(g => g.UserId == userId && g.Date >= today && g.Date < tomorrow)
                    ?? db.SetGoals.Where(g => g.UserId == userId).OrderByDescending(g => g.Date).FirstOrDefault();

            int dailyGoal = goal != null && goal.WaterIntakeGoal > 0 ? goal.WaterIntakeGoal : 2500;
            int weeklyGoal = dailyGoal * 7;

            var totalToday = db.WaterTntakeLogs.Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow).Sum(m => (int?)m.AmountInMl) ?? 0;

            var totalWeek = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= weekStart && w.Date < weekEnd)
                .Sum(w => (int?)w.AmountInMl) ?? 0;

            ViewBag.TotalToday = totalToday;
            ViewBag.TotalWeek = totalWeek;
            ViewBag.DailyGoal = dailyGoal;
            ViewBag.WeeklyGoal = weeklyGoal;

            return View(viewModel);
        }

        // Set Goal
        public ActionResult SetGoal()
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            return View();
        }

        [HttpPost]
        public ActionResult SetGoal(SetGoal goal)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }

            if (ModelState.IsValid == true)
            {
                int userId = Convert.ToInt32(Session["UserId"].ToString());
                goal.UserId = userId;
                goal.Date = DateTime.Now;

                db.SetGoals.Add(goal);
                var check = db.SaveChanges();
                if (check > 0)
                {
                    TempData["EdMsg"] = "<script>alert('Goal Set Successfully')</script>";
                    return RedirectToAction("DailyDashboard", "Home");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('Goal Not Set Try Again')</script>";
                }
                return RedirectToAction("Index");
            }
            return View(goal);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && db != null)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}