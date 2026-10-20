using GYM_Management_System.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;

namespace GYM_Management_System.Controllers
{
    public class VideoController : Controller
    {
        VideoTutorialsDB db = new VideoTutorialsDB();
        // GET: Video for User
        public ActionResult WorkoutTutorial(string search,string category)
        {
            //Where(m=>m.Category== "Workout" ||m.Category=="Yoga" ||m.Category=="Cardio"||m.Category=="Diet")
            var video = db.VideoTutorials.AsQueryable();
            if (!string.IsNullOrEmpty(search))
            {
                video = video.Where(m=>m.Title.Contains(search));
            }
            return View(video.ToList());
        }
        //Can create diet video tutorials
        // thumbnail https://img.youtube.com/vi/-hSma-BRzoo/0.jpg
        //Admin Create This
        public ActionResult Index(string search)
        {
            //if (Session["AdminId"] == null)
            //{
            //    return RedirectToAction("AdminLogin", "Admin");
            //}
            //int adminId = Convert.ToInt32(Session["AdminId"].ToString());
            var video = db.VideoTutorials.Where(m => m.Category == "Workout" || m.Category == "Yoga" || m.Category == "Cardio" || m.Category == "Diet");
            if (!string.IsNullOrEmpty(search))
            {
                video = video.Where(m => m.Title.Contains(search));
            }
            return View(video.ToList());
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
        public ActionResult Create(VideoTutorials video)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            if (ModelState.IsValid)
            {
                db.VideoTutorials.Add(video);
                var x=db.SaveChanges();
                if (x > 0)
                {
                    TempData["SavMsg"] = "<script>alert('Video Save Successfully')</script>";
                    return RedirectToAction("Index");
                }
                else
                {
                    TempData["ErrMsg"] = "<script>alert('Video Does not Save')</script>";
                    return View();  

                }
            }
            return View(video);
        }
        public ActionResult Edit(int? id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var video= db.VideoTutorials.Where(model=>model.Id==id).FirstOrDefault();
            if (video == null)
            {
                return HttpNotFound();
            }
            return View(video);
        }
        [HttpPost]
        public ActionResult Edit(int id,VideoTutorials video)
        {
            if (id != video.Id)
            {
                return HttpNotFound();
            }
            if (ModelState.IsValid)
            {
                db.Entry(video).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(video);
        }
        public ActionResult Details(int? id)
        {
            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var show = db.VideoTutorials.Find(id);
            if (show == null)
            {
                return HttpNotFound();
            }
            return View(show);
        }
        public ActionResult Delete(int? id)
        {

            if (Session["AdminId"] == null)
            {
                return RedirectToAction("AdminLogin", "Admin");
            }
            var show = db.VideoTutorials.Find(id);
            if (show == null)
            {
                return HttpNotFound();
            }
            return View(show);
        }
        
        [HttpPost]
        public ActionResult Delete(int id)
        {
            var show = db.VideoTutorials.Find(id);
            if (show == null)
            {
                return HttpNotFound();
            }
            db.VideoTutorials.Remove(show);
            var x = db.SaveChanges();
            if (x > 0)
            {
                TempData["Msg"] = "<script>alert('Video Delete Successfully')</script>";
                return RedirectToAction("Index");
            }
            else
            {
                TempData["ErrMsg"] = "<script>alert('Try Again..')</script>";
            }
            return View(show);
        }
       

    }
}