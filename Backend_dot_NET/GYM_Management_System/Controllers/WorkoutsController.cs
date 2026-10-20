using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Web;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class WorkoutsController : Controller
    {
        private FitTrackDbContext db = new FitTrackDbContext();

        // GET: Workouts
        public ActionResult Index()
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());

            DateTime today = DateTime.Today;//today
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = today.AddDays(-1 * diff).Date;
            var weekEnd = weekStart.AddDays(6).Date;
            var monthStart = new DateTime(today.Year, today.Month, 1);

            var workout=db.Workouts.Where(model=>model.UserId==userId).ToList();
            ViewBag.TodayWorkouts=workout.Where(m=>m.Date==today).ToList();
            ViewBag.WeeklyWorkouts= workout.Where(m => m.Date >=weekStart &&m.Date<=weekEnd).ToList();
            ViewBag.MonthlyWorkouts = workout.Where(m => m.Date >= monthStart).OrderBy(m => m.Date).ToList();
            return View(workout);
        }

        // GET: Workouts/Details/5
        public ActionResult Details(int? id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            Workout workout = db.Workouts.Find(id);
            if (workout == null || workout.UserId != Convert.ToInt32(Session["UserId"].ToString()))
            {
                return HttpNotFound();
            }
            return View(workout);
        }

        // GET: Workouts/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Workouts/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Workout workout)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }

            int userId = Convert.ToInt32(Session["UserId"].ToString());
            workout.UserId = userId;

            if (ModelState.IsValid==true)
            {
                
                db.Workouts.Add(workout);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(workout);
        }

        // GET: Workouts/Edit/5
        public ActionResult Edit(int? id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            //int userId = Convert.ToInt32(Session["UserId"].ToString());
            Workout workout = db.Workouts.Find(id);
            if (workout == null || workout.UserId != Convert.ToInt32(Session["UserId"].ToString()))
            {
                return HttpNotFound();
            }
            return View(workout);
        }

        // POST: Workouts/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit( Workout workout)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            if (ModelState.IsValid==true)
            {
                workout.UserId = Convert.ToInt32(Session["userId"].ToString());
                db.Entry(workout).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(workout);
        }

        // GET: Workouts/Delete/5
        public ActionResult Delete(int? id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            //int userId = Convert.ToInt32(Session["UserId"].ToString());
            Workout workout = db.Workouts.Find(id);
            if (workout == null || workout.UserId != Convert.ToInt32(Session["UserId"].ToString()))
            {
                return HttpNotFound();
            }
            return View(workout);
        }

        // POST: Workouts/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Login", "Users");
            }
            int userId = Convert.ToInt32(Session["UserId"].ToString());
            Workout workout = db.Workouts.Find(id);
            db.Workouts.Remove(workout);
            db.SaveChanges();
            return RedirectToAction("Index");
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
