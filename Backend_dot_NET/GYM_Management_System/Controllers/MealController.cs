using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.EnterpriseServices.CompensatingResourceManager;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;
using Microsoft.AspNet.Identity;

namespace GYM_Management_System.Controllers
{
    public class MealController : Controller
    {
        FitTrackDbContext db = new FitTrackDbContext();
        WaterIntakeLogDB waterIntakeDB = new WaterIntakeLogDB();
        SetGoalDB dailyGoalDB = new SetGoalDB();
        // GET: Meal
        public ActionResult Index()//List of all meals,calculate its calories and display
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            DateTime today= DateTime.Today;//today
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = today.AddDays(-1 * diff).Date;
            var weekEnd = weekStart.AddDays(6).Date;
            var monthStart = new DateTime(today.Year, today.Month, 1);

            var todyMeal = db.MealLogs.Where(model => model.UserId == userId && model.Date==today).OrderBy(m=>m.MealType).ToList();
            ViewBag.TodayMeals =todyMeal ?? new List<MealLog>();
            ViewBag.TodayCal = todyMeal.Sum(model => model.Calories);

            var weeklyMeal = db.MealLogs.Where(model => model.UserId == userId && model.Date>=weekStart && model.Date<=weekEnd).OrderBy(m=>m.Date).ToList();
            ViewBag.WeeklyMeals = weeklyMeal ?? new List<MealLog>();
            ViewBag.WeeklyCal = weeklyMeal.Sum(model => model.Calories);

            var monthlyMeal = db.MealLogs.Where(model => model.UserId == userId && model.Date >= monthStart).OrderBy(m => m.Date).ToList();
            ViewBag.MonthlyMeals = monthlyMeal ?? new List<MealLog>();
            ViewBag.MonthlyCal = monthlyMeal.Sum(model => model.Calories);

            return View();
        }
        public ActionResult Create()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            return View();
        }
        [HttpPost]
        public ActionResult Create(MealLog meal)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }

            int userId = Convert.ToInt32(Session["UserId"].ToString());
            meal.UserId = userId;

            if (ModelState.IsValid == true)
            {
                db.MealLogs.Add(meal);
                var check = db.SaveChanges();
                if (check > 0)
                {
                    TempData["EdMsg"] = "<script>alert('Meal Added Successfully')</script>";
                    return RedirectToAction("Index");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('Meal Not Added Try Again')</script>";
                }
                return RedirectToAction("Index");
            }
            return View(meal);
        }
        public ActionResult Edit(int? id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            MealLog meal = db.MealLogs.Find(id);
            if (meal == null || meal.UserId != Convert.ToInt32(Session["UserId"].ToString()))
            {
                return HttpNotFound();
            }
            return View(meal);
        }
        [HttpPost]
        public ActionResult Edit(MealLog meal)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            if (ModelState.IsValid)
            {
                meal.UserId = Convert.ToInt32(Session["userId"].ToString());
                db.Entry(meal).State = System.Data.Entity.EntityState.Modified;
                var check = db.SaveChanges();
                if (check > 0)
                {
                    TempData["EdMsg"] = "<script>alert('Meal Edited Successfully')</script>";
                    return RedirectToAction("Index");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('Meal Not Edited Try Again')</script>";
                }
                return View(meal);
            }
            return View(meal);
        }
        public ActionResult Details(int? id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            MealLog meal = db.MealLogs.Find(id);
            if (meal == null || meal.UserId != Convert.ToInt32(Session["UserId"].ToString()))
            {
                return HttpNotFound();
            }
            return View(meal);
        }

        public ActionResult Delete(int id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = int.Parse(Session["userId"].ToString());
            var meal = db.MealLogs.Where(model => model.Id == id).FirstOrDefault();
            if (meal == null || meal.UserId != Convert.ToInt32(Session["UserId"].ToString()))
            {
                return HttpNotFound();
            }
            return View(meal);
        }
        [HttpPost]
        public ActionResult Delete(MealLog meal)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            db.Entry(meal).State = System.Data.Entity.EntityState.Deleted;
            var check = db.SaveChanges();
            if (check > 0)
            {
                TempData["EdMsg"] = "<script>alert('Meal Deleted')</script>";
                return RedirectToAction("Index");
            }
            else
            {
                TempData["ErrMsg"] = "<script>alert('Try Again')</script>";
            }
            return View(meal);
        }

        //Water Intake
        public ActionResult WaterIntakeIndex()
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            DateTime today = DateTime.Today;//today
            var tomorrow=today.AddDays(1);
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = today.AddDays(-1 * diff).Date;
            var weekEnd = weekStart.AddDays(6).Date;
            var monthStart = new DateTime(today.Year, today.Month, 1);//optional

            var waterLog = waterIntakeDB.WaterTntakeLogs.Where(model => model.UserId == userId && model.Date >= weekStart && model.Date <= weekEnd).ToList();

            //progress bar          
            var goal = dailyGoalDB.SetGoals.FirstOrDefault(g => g.UserId == userId && g.Date.Year == today.Year && g.Date.Day == today.Day);

            int dailyGoal = goal != null ? goal.WaterIntakeGoal : 0;
            int weeklyGoal = dailyGoal * 7;

            var totalToday = waterIntakeDB.WaterTntakeLogs.Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow).Sum(m =>(int?)m.AmountInMl) ?? 0;

            var totalWeek = waterIntakeDB.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= weekStart && w.Date <= weekEnd)
                .Sum(w => (int?)w.AmountInMl) ?? 0;

            ViewBag.TotalToday = totalToday;
            ViewBag.TotalWeek = totalWeek;
            ViewBag.DailyGoal = dailyGoal;
            ViewBag.WeeklyGoal = weeklyGoal;

            return View(waterLog);

        }
        public ActionResult WiCreate()
        {
            if (Session["UserId"] == null) 
            {
                return RedirectToAction("Login", "Users");
            }
            return View();
        }
        [HttpPost]
        public ActionResult WiCreate(WaterTntakeLog model)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            if (ModelState.IsValid)
            {
                model.UserId = userId;
                model.Date = DateTime.Now;
                waterIntakeDB.WaterTntakeLogs.Add(model);
                waterIntakeDB.SaveChanges();
                return RedirectToAction("WaterIntakeIndex");
            }
            return View(model);
        }
        public ActionResult WiDetails(int id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            var water = waterIntakeDB.WaterTntakeLogs.Find(id);
            return View(water);
        }
        public ActionResult WiEdit(int id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            var water = waterIntakeDB.WaterTntakeLogs.Find(id);
            return View(water);
        }
        [HttpPost]
        public ActionResult WiEdit(WaterTntakeLog model)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            if (ModelState.IsValid)
            {
                model.UserId = userId;
                model.Date = DateTime.Now;
                waterIntakeDB.Entry(model).State=EntityState.Modified;
                waterIntakeDB.SaveChanges();
                return RedirectToAction("WaterIntakeIndex");
            }
            return View(model);
        }
        public ActionResult WiDelete(int id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            var water = waterIntakeDB.WaterTntakeLogs.Find(id);
            return View(water);
        }
        [HttpPost]
        public ActionResult WiDelete(WaterTntakeLog model)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            if (ModelState.IsValid)
            {
                model.UserId = userId;
                model.Date = DateTime.Now;
                waterIntakeDB.Entry(model).State = EntityState.Deleted;
                waterIntakeDB.SaveChanges();
                return RedirectToAction("WaterIntakeIndex");
            }
            return View(model);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (db != null) db.Dispose();
                if (waterIntakeDB != null) waterIntakeDB.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}