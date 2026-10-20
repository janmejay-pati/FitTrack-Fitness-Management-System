using System;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class AuthController : ApiControllerBase
    {
        public class RegisterDto
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public int? Age { get; set; }
            public string Gender { get; set; }
            public float? Height { get; set; }
            public float? Weight { get; set; }
        }

        public class LoginDto
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class ChangePasswordDto
        {
            public string OldPassword { get; set; }
            public string NewPassword { get; set; }
            public string ConfirmPassword { get; set; }
        }

        [HttpPost]
        public ActionResult Register(RegisterDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password) || string.IsNullOrWhiteSpace(model.Name))
            {
                return Fail("Please provide name, valid email, and password.");
            }

            model.Email = model.Email.Trim().ToLowerInvariant();

            if (db.Users.Any(u => u.UserEmail.ToLower() == model.Email))
            {
                return Fail("An account with this email already exists.", 409);
            }

            var newUser = new Users_Table
            {
                UserName = model.Name.Trim(),
                UserEmail = model.Email,
                UserPassword = HashPassword(model.Password),
                UserAge = model.Age ?? 25,
                UserGender = string.IsNullOrWhiteSpace(model.Gender) ? "Not Specified" : model.Gender.Trim(),
                CreatedAt = DateTime.Now,
                Height = model.Height ?? 175f,
                Weight = model.Weight ?? 70f,
                Role = "User"
            };

            db.Users.Add(newUser);
            db.SaveChanges();

            // Set session
            Session["UserId"] = newUser.UserId.ToString();
            Session["Name"] = newUser.UserName;
            Session["Role"] = newUser.Role;

            // Welcome notification
            db.Notifications.Add(new Notification
            {
                UserId = newUser.UserId,
                Title = "Welcome to FitTrack!",
                Message = "Your account has been created. Calculate your BMI and log your first workout to get started!",
                Type = "success",
                CreatedAt = DateTime.Now
            });
            db.SaveChanges();

            return Success(new
            {
                userId = newUser.UserId,
                name = newUser.UserName,
                email = newUser.UserEmail,
                role = newUser.Role,
                age = newUser.UserAge,
                gender = newUser.UserGender,
                height = newUser.Height,
                weight = newUser.Weight,
                avatar = newUser.UserImage
            }, "Registration successful");
        }

        [HttpPost]
        public ActionResult Login(LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return Fail("Email and password are required.");
            }

            string email = model.Email.Trim().ToLowerInvariant();
            var user = db.Users.FirstOrDefault(u => u.UserEmail.ToLower() == email);

            if (user == null || !VerifyPassword(model.Password, user.UserPassword))
            {
                return Fail("Invalid email or password.", 401);
            }

            Session["UserId"] = user.UserId.ToString();
            Session["Name"] = user.UserName;
            Session["Role"] = user.Role;

            if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                Session["AdminId"] = user.UserId.ToString();
            }

            return Success(new
            {
                userId = user.UserId,
                name = user.UserName,
                email = user.UserEmail,
                role = user.Role,
                age = user.UserAge,
                gender = user.UserGender,
                height = user.Height,
                weight = user.Weight,
                avatar = user.UserImage
            }, "Login successful");
        }

        [HttpPost]
        public ActionResult AdminLogin(LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return Fail("Admin email and password are required.");
            }

            string email = model.Email.Trim().ToLowerInvariant();
            
            // Check Admins table or Users table with Admin role
            var adminUser = db.Users.FirstOrDefault(u => u.UserEmail.ToLower() == email && u.Role == "Admin");
            var adminEntry = db.Admins.FirstOrDefault(a => a.Email.ToLower() == email);

            bool verified = false;
            string adminName = "Administrator";
            int adminId = 0;

            if (adminUser != null && VerifyPassword(model.Password, adminUser.UserPassword))
            {
                verified = true;
                adminName = adminUser.UserName;
                adminId = adminUser.UserId;
            }
            else if (adminEntry != null && (adminEntry.Password == model.Password || VerifyPassword(model.Password, adminEntry.Password)))
            {
                verified = true;
                adminName = adminEntry.Name;
                adminId = adminEntry.Id;
            }

            if (!verified)
            {
                return Fail("Invalid admin credentials.", 401);
            }

            Session["UserId"] = adminId.ToString();
            Session["AdminId"] = adminId.ToString();
            Session["Name"] = adminName;
            Session["Role"] = "Admin";

            return Success(new
            {
                adminId = adminId,
                name = adminName,
                email = email,
                role = "Admin"
            }, "Admin authenticated");
        }

        [HttpGet]
        public ActionResult CurrentUser()
        {
            if (!CurrentUserId.HasValue)
            {
                return UnauthorizedResponse("Not logged in");
            }

            var user = db.Users.Find(CurrentUserId.Value);
            if (user == null)
            {
                Session.Clear();
                return UnauthorizedResponse("User account not found");
            }

            return Success(new
            {
                userId = user.UserId,
                name = user.UserName,
                email = user.UserEmail,
                role = user.Role ?? "User",
                age = user.UserAge,
                gender = user.UserGender,
                height = user.Height,
                weight = user.Weight,
                avatar = user.UserImage,
                createdAt = user.CreatedAt
            });
        }

        [HttpPost]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            return Success(null, "Logged out successfully");
        }

        [HttpPost]
        public ActionResult ChangePassword(ChangePasswordDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();

            if (model == null || string.IsNullOrEmpty(model.OldPassword) || string.IsNullOrEmpty(model.NewPassword))
            {
                return Fail("Current password and new password are required.");
            }

            if (model.NewPassword.Length < 6)
            {
                return Fail("New password must be at least 6 characters long.");
            }

            var user = db.Users.Find(CurrentUserId.Value);
            if (user == null) return NotFoundResponse("User not found");

            if (!VerifyPassword(model.OldPassword, user.UserPassword))
            {
                return Fail("Current password is incorrect.", 400);
            }

            user.UserPassword = HashPassword(model.NewPassword);
            db.SaveChanges();

            return Success(null, "Password updated successfully");
        }
    }
}
