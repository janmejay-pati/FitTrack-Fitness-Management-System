using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GYM_Management_System.Controllers
{
    public class AdminController : Controller
    {
        AdminDb db=new AdminDb();
        // GET: Admin
        public ActionResult Index()
        {
            if (Session["AdminId"] == null && (Session["Role"] == null || Session["Role"].ToString() != "Admin"))
            {
                return RedirectToAction("AdminLogin");
            }
            int Id = Convert.ToInt32(Session["AdminId"] ?? Session["UserId"] ?? 0);
            var admin = db.Admins.Find(Id);
            if (admin == null)
            {
                using (var userDb = new FitTrackDbContext())
                {
                    var userAdmin = userDb.Users.FirstOrDefault(u => u.UserId == Id && u.Role == "Admin")
                                 ?? userDb.Users.FirstOrDefault(u => u.Role == "Admin");
                    if (userAdmin != null)
                    {
                        admin = new Admin
                        {
                            Id = userAdmin.UserId,
                            Name = userAdmin.UserName,
                            Email = userAdmin.UserEmail
                        };
                    }
                    else
                    {
                        admin = db.Admins.FirstOrDefault();
                    }
                }
            }
            if (admin == null)
            {
                admin = new Admin
                {
                    Id = 1,
                    Name = Session["Name"]?.ToString() ?? "Administrator",
                    Email = "admin@fittrack.com"
                };
            }
            return View(admin);
        }
        public ActionResult AdminLogin()
        {
            return View();
        }
        [HttpPost]
        public ActionResult AdminLogin(Admin admin)
        {
            if (admin == null || string.IsNullOrWhiteSpace(admin.Email) || string.IsNullOrWhiteSpace(admin.Password))
            {
                ViewBag.ErrorMessage = "Please enter administrator email and password.";
                return View(admin);
            }

            string email = admin.Email.Trim().ToLowerInvariant();
            var show = db.Admins.FirstOrDefault(model => model.Email.ToLower() == email);
            if (show != null && (show.Password == admin.Password || ApiControllerBase.VerifyPassword(admin.Password, show.Password)))
            {
                Session["UserId"] = show.Id.ToString();
                Session["AdminId"] = show.Id.ToString();
                Session["Name"] = show.Name;
                Session["Role"] = "Admin";
                TempData["SuccessMessage"] = $"Welcome, Admin {show.Name}!";
                return RedirectToAction("Index");
            }

            // Check Users table for Admin role
            using (var userDb = new FitTrackDbContext())
            {
                var userAdmin = userDb.Users.FirstOrDefault(u => u.UserEmail.ToLower() == email && u.Role == "Admin");
                if (userAdmin != null && ApiControllerBase.VerifyPassword(admin.Password, userAdmin.UserPassword))
                {
                    Session["UserId"] = userAdmin.UserId.ToString();
                    Session["AdminId"] = userAdmin.UserId.ToString();
                    Session["Name"] = userAdmin.UserName;
                    Session["Role"] = "Admin";
                    TempData["SuccessMessage"] = $"Welcome, Administrator {userAdmin.UserName}!";
                    return RedirectToAction("Index");
                }
            }

            ViewBag.ErrorMessage = "Invalid administrator credentials. Access denied.";
            return View(admin);
        }

        public ActionResult Logout()
        {
            Session.Clear();
            return RedirectToAction("AdminLogin");
        }
        public ActionResult Create()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Create(Admin admin)
        {

            if (ModelState.IsValid == true)
            {
                db.Admins.Add(admin);
                var x = db.SaveChanges();
                if (x > 0)
                {
                    TempData["SavMsg"] = "<script>alert('Register Successfully')</script>";
                    return RedirectToAction("AdminLogin");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('Try Again')</script>";
                }
                return View();
            }
            return View(admin);
        }
        public ActionResult Edit(int? id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            int Id = Convert.ToInt32(Session["AdminId"]);
            var admin = db.Admins.Find(Id);
            if (admin == null)
            {
                return HttpNotFound();
            }
            return View(admin);
        }
        [HttpPost]
        public ActionResult Edit(int id, Admin admin)
        {
            if (id != admin.Id)
            {
                return HttpNotFound();
            }
            if (ModelState.IsValid)
            {
                db.Entry(admin).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(admin);
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