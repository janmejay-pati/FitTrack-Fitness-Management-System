using System;
using System.Security.Cryptography;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public abstract class ApiControllerBase : Controller
    {
        protected FitTrackDbContext db = new FitTrackDbContext();

        protected int? CurrentUserId
        {
            get
            {
                if (Session["UserId"] == null) return null;
                int id;
                if (int.TryParse(Session["UserId"].ToString(), out id)) return id;
                return null;
            }
        }

        protected int? CurrentAdminId
        {
            get
            {
                if (Session["AdminId"] != null)
                {
                    int aid;
                    if (int.TryParse(Session["AdminId"].ToString(), out aid)) return aid;
                }

                // Check if CurrentUserId has Admin role
                if (CurrentUserId.HasValue)
                {
                    var user = db.Users.Find(CurrentUserId.Value);
                    if (user != null && string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
                    {
                        return user.UserId;
                    }
                }
                return null;
            }
        }

        protected JsonResult Success(object data = null, string message = "Success")
        {
            return Json(new
            {
                success = true,
                message = message,
                data = data
            }, JsonRequestBehavior.AllowGet);
        }

        protected JsonResult Fail(string message = "Request failed", int statusCode = 400)
        {
            Response.StatusCode = statusCode;
            Response.TrySkipIisCustomErrors = true;
            return Json(new
            {
                success = false,
                message = message
            }, JsonRequestBehavior.AllowGet);
        }

        protected JsonResult UnauthorizedResponse(string message = "Authentication required")
        {
            return Fail(message, 401);
        }

        protected JsonResult ForbiddenResponse(string message = "Access denied: insufficient permissions")
        {
            return Fail(message, 403);
        }

        protected JsonResult NotFoundResponse(string message = "Resource not found")
        {
            return Fail(message, 404);
        }

        // --- Password Security Utilities ---
        public static string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password)) return string.Empty;
            byte[] salt = new byte[16];
            using (var rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(salt);
            }
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000))
            {
                byte[] hash = pbkdf2.GetBytes(20);
                byte[] hashBytes = new byte[36];
                Array.Copy(salt, 0, hashBytes, 0, 16);
                Array.Copy(hash, 0, hashBytes, 16, 20);
                return Convert.ToBase64String(hashBytes);
            }
        }

        public static bool VerifyPassword(string enteredPassword, string storedHash)
        {
            if (string.IsNullOrEmpty(enteredPassword) || string.IsNullOrEmpty(storedHash)) return false;

            // Check if plain text match (for legacy testing seeds)
            if (enteredPassword == storedHash) return true;

            try
            {
                byte[] hashBytes = Convert.FromBase64String(storedHash);
                if (hashBytes.Length != 36) return false;

                byte[] salt = new byte[16];
                Array.Copy(hashBytes, 0, salt, 0, 16);

                using (var pbkdf2 = new Rfc2898DeriveBytes(enteredPassword, salt, 10000))
                {
                    byte[] hash = pbkdf2.GetBytes(20);
                    for (int i = 0; i < 20; i++)
                    {
                        if (hashBytes[i + 16] != hash[i]) return false;
                    }
                    return true;
                }
            }
            catch
            {
                return false;
            }
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
