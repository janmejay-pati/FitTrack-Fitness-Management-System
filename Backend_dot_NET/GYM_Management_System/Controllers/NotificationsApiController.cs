using System;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class NotificationsApiController : ApiControllerBase
    {
        [HttpGet]
        public ActionResult Get()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var list = db.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(25)
                .ToList()
                .Select(n => new
                {
                    id = n.Id,
                    title = n.Title,
                    message = n.Message,
                    type = n.Type,
                    isRead = n.IsRead,
                    createdAt = n.CreatedAt
                });

            int unreadCount = db.Notifications.Count(n => n.UserId == userId && !n.IsRead);

            return Success(new
            {
                notifications = list,
                unreadCount = unreadCount
            });
        }

        [HttpPost]
        public ActionResult MarkAsRead(int id)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var item = db.Notifications.FirstOrDefault(n => n.Id == id && n.UserId == userId);
            if (item != null)
            {
                item.IsRead = true;
                db.SaveChanges();
            }

            return Success(null, "Marked as read");
        }

        [HttpPost]
        public ActionResult MarkAllAsRead()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var unread = db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToList();
            foreach (var n in unread)
            {
                n.IsRead = true;
            }
            db.SaveChanges();

            return Success(null, "All marked as read");
        }
    }
}
