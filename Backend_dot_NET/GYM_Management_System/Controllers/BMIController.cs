using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;

namespace GYM_Management_System.Controllers
{
    public class BMIController : Controller
    {
        BMImodelDb BMIdb = new BMImodelDb();
        // GET: BMI
        public ActionResult Index()//bmi histroy
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            var bmi= BMIdb.BMIs.Where(model=>model.UserId==userId).ToList();
            return View(bmi);
        }
        public ActionResult Create()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            return View();
        }
        [HttpPost]
        //Calculate BMI
        public ActionResult Create(BMImodel bmi)//Bmi Body Mass Index
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            if (ModelState.IsValid)
            {
                float height = bmi.Height;
                float weight = bmi.Weight;
                float hM = height > 3.0f ? height / 100.0f : height;
                if (hM <= 0) hM = 1.75f;
                float bmiValue = (float)Math.Round(weight / (hM * hM), 1);

                string healthStatus = "";

                if (bmiValue < 18.5)
                {
                    healthStatus = "Underweight - Consider nutrient-rich calorie surplus and strength training.";
                }
                else if (bmiValue < 25.0)
                {
                    healthStatus = "Normal Weight - Maintain a balanced diet and stay active.";
                }
                else if (bmiValue < 30.0)
                {
                    healthStatus = "Overweight - Focus on portion control and regular aerobic exercise.";
                }
                else
                {
                    healthStatus = "Obese - Consult a healthcare professional and start guided activity.";
                }
                bmi.UserId = userId;
                bmi.Date = DateTime.Now;
                bmi.BMIscore = bmiValue;
                bmi.HealthStatus = healthStatus;

                BMIdb.BMIs.Add(bmi);
                var check = BMIdb.SaveChanges();
                if (check > 0)
                {
                    TempData["Msg"] = "<script>alert('BMIs Added Successfully')</script>";
                    return RedirectToAction("LatestBMI");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('BMIs Not Added Successfully')</script>";
                }
            }        
            return View(bmi);
        }
        public ActionResult Edit(int id)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            var bmi = BMIdb.BMIs.Find(id);
            if (bmi == null)
            {
                return HttpNotFound();
            }
            return View(bmi);
        }
        [HttpPost]
        public ActionResult Edit(BMImodel bmi)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            if (ModelState.IsValid == true)
            {
                float height = bmi.Height;
                float weight = bmi.Weight;
                float hM = height > 3.0f ? height / 100.0f : height;
                if (hM <= 0) hM = 1.75f;
                float bmiValue = (float)Math.Round(weight / (hM * hM), 1);

                string healthStatus = "";

                if (bmiValue < 18.5)
                {
                    healthStatus = "Underweight - Consider nutrient-rich calorie surplus and strength training.";
                }
                else if (bmiValue < 25.0)
                {
                    healthStatus = "Normal Weight - Maintain a balanced diet and stay active.";
                }
                else if (bmiValue < 30.0)
                {
                    healthStatus = "Overweight - Focus on portion control and regular aerobic exercise.";
                }
                else
                {
                    healthStatus = "Obese - Consult a healthcare professional and start guided activity.";
                }
                bmi.UserId = userId;
                bmi.Date = DateTime.Now;
                bmi.BMIscore = bmiValue;
                bmi.HealthStatus = healthStatus;

                BMIdb.Entry(bmi).State=EntityState.Modified;
                var check = BMIdb.SaveChanges();
                if (check > 0)
                {
                    TempData["Msg"] = "<script>alert('BMIs Added Successfully')</script>";
                    return RedirectToAction("Index");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('BMIs Not Added Successfully')</script>";
                }
            }

            return View(bmi);
        }
        public ActionResult Delete(int id)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            var bmi = BMIdb.BMIs.Find(id);
            if (bmi == null)
            {
                return HttpNotFound();
            }
            return View(bmi);
        }
        [HttpPost]
        public ActionResult Delete(BMImodel bmi)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            if (ModelState.IsValid==true)
            {
                bmi.UserId = userId;
                bmi.Date = DateTime.Now;
                BMIdb.Entry(bmi).State= EntityState.Deleted;
                var check= BMIdb.SaveChanges();
                if (check > 0)
                {
                    TempData["Msg"] = "<script>alert('BMIs Deleted')</script>";
                }
            }
            return View(bmi);
        }
        public ActionResult LatestBMI()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            var latestBMI = BMIdb.BMIs.Where(b => b.UserId == userId).OrderByDescending(b => b.Date).FirstOrDefault();
            if (latestBMI != null)
            {
                ViewBag.BMI = latestBMI.BMIscore.ToString("F1");
                ViewBag.BMICategory = GetBMICategory(latestBMI.BMIscore);
                ViewBag.BMIColor = GetBMIColor(latestBMI.BMIscore);
            }
            double bmiScore = latestBMI?.BMIscore ?? 22.0;
            ViewBag.BMIScore = bmiScore;
            ViewBag.BMICategory = GetBMICategory(bmiScore);
            ViewBag.BMIColor = GetBMIColor(bmiScore);
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
            else return "#e74c3c";                 // Red
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && BMIdb != null)
            {
                BMIdb.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
