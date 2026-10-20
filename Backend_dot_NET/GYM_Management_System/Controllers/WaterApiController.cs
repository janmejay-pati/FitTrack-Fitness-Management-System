using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class WaterApiController : ApiControllerBase
    {
        public class AddWaterDto
        {
            public int AmountInMl { get; set; }
        }

        [HttpGet]
        public ActionResult GetToday()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);

            var todayLogs = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .OrderByDescending(w => w.Date)
                .ToList();

            int totalToday = todayLogs.Sum(w => w.AmountInMl);

            var goal = db.SetGoals
                .FirstOrDefault(g => g.UserId == userId && g.Date.Year == today.Year && g.Date.Month == today.Month && g.Date.Day == today.Day);

            int targetGoal = goal != null && goal.WaterIntakeGoal > 0 ? goal.WaterIntakeGoal : 2500;
            int percentage = Math.Min(100, (int)((totalToday / (double)targetGoal) * 100));

            return Success(new
            {
                totalToday = totalToday,
                goal = targetGoal,
                progressPercentage = percentage,
                logs = todayLogs.Select(l => new
                {
                    id = l.Id,
                    amount = l.AmountInMl,
                    time = l.Date.ToString("hh:mm tt"),
                    date = l.Date
                })
            });
        }

        [HttpGet]
        public ActionResult GetHistory()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            DateTime today = DateTime.Today;
            var history = new List<object>();

            for (int i = 6; i >= 0; i--)
            {
                DateTime day = today.AddDays(-i);
                DateTime nextDay = day.AddDays(1);

                int sum = db.WaterTntakeLogs
                    .Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.AmountInMl)
                    .DefaultIfEmpty(0)
                    .Sum() ?? 0;

                history.Add(new
                {
                    day = day.ToString("ddd"),
                    date = day.ToString("yyyy-MM-dd"),
                    amount = sum
                });
            }

            return Success(history);
        }

        [HttpPost]
        public ActionResult Add(AddWaterDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null || model.AmountInMl <= 0)
            {
                return Fail("Water amount must be positive.");
            }

            int userId = CurrentUserId.Value;

            var log = new WaterTntakeLog
            {
                UserId = userId,
                AmountInMl = model.AmountInMl,
                Date = DateTime.Now
            };

            db.WaterTntakeLogs.Add(log);
            db.SaveChanges();

            // Check for Hydration Hero achievement
            CheckHydrationAchievement(userId);

            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);
            int totalToday = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Sum(w => w.AmountInMl);

            return Success(new
            {
                id = log.Id,
                amount = log.AmountInMl,
                totalToday = totalToday,
                date = log.Date
            }, $"{model.AmountInMl}ml added");
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var log = db.WaterTntakeLogs.FirstOrDefault(w => w.Id == id && w.UserId == userId);
            if (log == null) return NotFoundResponse();

            db.WaterTntakeLogs.Remove(log);
            db.SaveChanges();

            return Success(null, "Water log deleted");
        }

        private void CheckHydrationAchievement(int userId)
        {
            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);
            int totalToday = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Sum(w => w.AmountInMl);

            if (totalToday >= 2500 && !db.Achievements.Any(a => a.UserId == userId && a.BadgeKey == "hydration_hero"))
            {
                db.Achievements.Add(new Achievement
                {
                    UserId = userId,
                    BadgeKey = "hydration_hero",
                    Title = "Hydration Hero",
                    Description = "Reached daily hydration goal of 2500ml!",
                    Icon = "droplet",
                    UnlockedAt = DateTime.Now
                });
                db.Notifications.Add(new Notification
                {
                    UserId = userId,
                    Title = "Badge Unlocked: Hydration Hero!",
                    Message = "You've successfully hit your 2500ml daily hydration target. Great work!",
                    Type = "success",
                    CreatedAt = DateTime.Now
                });
                db.SaveChanges();
            }
        }
    }
}
