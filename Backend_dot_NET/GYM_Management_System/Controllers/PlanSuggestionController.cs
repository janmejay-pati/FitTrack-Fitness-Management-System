using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GYM_Management_System.Controllers
{
    //[Authorize(Roles ="Admin")]
    public class PlanSuggestionController : Controller//admin controller
    {
        FitTrackDbContext db = new FitTrackDbContext();

        // GET: PlanSuggestion
        public ActionResult Suggestion()// this display plans based on BMI for a specific user 
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"]);

            var bmiRecord = db.BMIs.Where(x => x.UserId == userId).OrderByDescending(x => x.Date).FirstOrDefault();
            if (bmiRecord == null)
            {
                var user = db.Users.Find(userId);
                float h = user != null && user.Height.HasValue && user.Height.Value > 0 ? user.Height.Value : 175f;
                float w = user != null && user.Weight.HasValue && user.Weight.Value > 0 ? user.Weight.Value : 70f;
                float hM = h > 3 ? h / 100f : h;
                double score = Math.Round(w / (hM * hM), 1);
                string status = BMIApiController.GetBmiCategory(score);

                bmiRecord = new BMImodel
                {
                    UserId = userId,
                    Height = h,
                    Weight = w,
                    BMIscore = (float)score,
                    HealthStatus = status,
                    Date = DateTime.Now
                };
                db.BMIs.Add(bmiRecord);
                db.SaveChanges();
            }

            string category = GetBMICategory(bmiRecord.BMIscore);
            var workoutPlan = db.WorkoutPlans.Where(w => w.BmiCategory == category).ToList();
            var dietPlan = db.DietPlans.Where(w => w.BmiCategory == category).ToList();

            var model = new PlanSuggestionModel
            {
                WorkoutPlans = workoutPlan,
                DietPlans = dietPlan
            };

            return View(model);
        }
        private string GetBMICategory(double bmi)
        {
            if (bmi < 18.5) return "Underweight";
            else if (bmi < 24.9) return "Normal";
            else if (bmi < 29.9) return "Overweight";
            else return "Obese";
        }
        //All CRUD Operation for Workout plan it is done by the Admin
        public ActionResult Index()
        {
            return View(db.WorkoutPlans.ToList());
        }
        public ActionResult Create()
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            return View();
        }
        [HttpPost]
        public ActionResult Create(WorkoutPlan sug)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid == true)
            {
                db.WorkoutPlans.Add(sug);
                var x = db.SaveChanges();
                if (x > 0)
                {
                    return RedirectToAction("Index");
                }
            }
            return View(sug);
        }
        public ActionResult Edit(int id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var suggestion = db.WorkoutPlans.Find(id);
            if (suggestion == null)
            {
                return HttpNotFound();
            }
            return View(suggestion);
        }
        [HttpPost]
        public ActionResult Edit(WorkoutPlan sug)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid == true)
            {
                db.Entry(sug).State = System.Data.Entity.EntityState.Modified;
                var x = db.SaveChanges();
                if (x > 0)
                {
                    return RedirectToAction("Index");
                }
            }
            return View(sug);
        }
        public ActionResult Details(int id)
        {
            var suggestion = db.WorkoutPlans.Find(id);
            if (suggestion == null)
            {
                return HttpNotFound();
            }
            return View(suggestion);
        }
        public ActionResult Delete(int id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var suggestion = db.WorkoutPlans.Find(id);
            if (suggestion == null)
            {
                return HttpNotFound();
            }
            return View(suggestion);
        }
        [HttpPost]
        public ActionResult Delete(WorkoutPlan sug)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid == true)
            {
                db.Entry(sug).State = System.Data.Entity.EntityState.Deleted;
                var x = db.SaveChanges();
                if (x > 0)
                {
                    return RedirectToAction("Index");
                }
            }
            return View(sug);
        }

        //All CRUD operation of Diet Plans, that is done by Admin Also
        public ActionResult DietPlanIndex()
        {
            return View(db.DietPlans.ToList());
        }
        public ActionResult CreateDietPlan()
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            return View();
        }
        [HttpPost]
        public ActionResult CreateDietPlan(DietPlan sug)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid == true)
            {
                db.DietPlans.Add(sug);
                var x = db.SaveChanges();
                if (x > 0)
                {
                    return RedirectToAction("DietPlanIndex");
                }
            }
            return View(sug);
        }
        public ActionResult EditDietPlan(int id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var suggestion = db.DietPlans.Find(id);
            if (suggestion == null)
            {
                return HttpNotFound();
            }
            return View(suggestion);
        }
        [HttpPost]
        public ActionResult EditDietPlan(DietPlan sug)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid == true)
            {
                db.Entry(sug).State = System.Data.Entity.EntityState.Modified;
                var x = db.SaveChanges();
                if (x > 0)
                {
                    return RedirectToAction("DietPlanIndex");
                }
            }
            return View(sug);
        }
        public ActionResult DietPlanDetails(int id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var suggestion = db.DietPlans.Find(id);
            if (suggestion == null)
            {
                return HttpNotFound();
            }
            return View(suggestion);
        }
        public ActionResult DeleteDietPlan(int id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var suggestion = db.DietPlans.Find(id);
            if (suggestion == null)
            {
                return HttpNotFound();
            }
            return View(suggestion);
        }
        [HttpPost]
        public ActionResult DeleteDietPlan(DietPlan sug)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid == true)
            {
                db.Entry(sug).State = System.Data.Entity.EntityState.Deleted;
                var x = db.SaveChanges();
                if (x > 0)
                {
                    return RedirectToAction("DietPlanIndex");
                }
            }
            return View(sug);
        }
    }
}