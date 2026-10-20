using GYM_Management_System.Models;
using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GYM_Management_System.Controllers
{
    public class UsersController : ApiControllerBase
    {
        public class LoginDto
        {
            private string _email;
            public string Email { get => _email; set => _email = value; }
            public string UserEmail { get => _email; set => _email = value; }

            private string _password;
            public string Password { get => _password; set => _password = value; }
            public string UserPassword { get => _password; set => _password = value; }
        }

        public class RegisterDto
        {
            private string _name;
            public string Name { get => _name; set => _name = value; }
            public string UserName { get => _name; set => _name = value; }

            private string _email;
            public string Email { get => _email; set => _email = value; }
            public string UserEmail { get => _email; set => _email = value; }

            private string _password;
            public string Password { get => _password; set => _password = value; }
            public string UserPassword { get => _password; set => _password = value; }

            private int? _age;
            public int? Age { get => _age; set => _age = value; }
            public int? UserAge { get => _age; set => _age = value; }

            private string _gender;
            public string Gender { get => _gender; set => _gender = value; }
            public string UserGender { get => _gender; set => _gender = value; }

            public float? Height { get; set; }
            public float? Weight { get; set; }
        }

        public class ChangePasswordDto
        {
            public string OldPassword { get; set; }
            public string NewPassword { get; set; }
            public string ConfirmPassword { get; set; }
        }

        private bool IsJsonRequest()
        {
            return (Request.ContentType != null && Request.ContentType.Contains("application/json")) ||
                   (Request.AcceptTypes != null && Request.AcceptTypes.Any(t => t.Contains("application/json"))) ||
                   Request.IsAjaxRequest();
        }

        // GET: Users
        [HttpGet]
        public ActionResult Index()
        {
            if (IsJsonRequest())
            {
                var users = db.Users.ToList().Select(u => new
                {
                    userId = u.UserId,
                    name = u.UserName,
                    email = u.UserEmail,
                    role = u.Role,
                    createdAt = u.CreatedAt
                });
                return Success(users);
            }
            return View(db.Users.ToList());
        }

        [HttpGet]
        public ActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Register(RegisterDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                if (IsJsonRequest()) return Fail("Please provide name, valid email, and password.");
                ViewBag.ErrorMessage = "Please provide your name, a valid email, and a password.";
                return View();
            }

            string email = model.Email.Trim().ToLowerInvariant();
            if (db.Users.Any(u => u.UserEmail.ToLower() == email))
            {
                if (IsJsonRequest()) return Fail("An account with this email already exists.", 409);
                ViewBag.ErrorMessage = "An account with this email address already exists. Please log in.";
                return View();
            }

            var newUser = new Users_Table
            {
                UserName = string.IsNullOrWhiteSpace(model.Name) ? email.Split('@')[0] : model.Name.Trim(),
                UserEmail = email,
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

            if (IsJsonRequest())
            {
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

            TempData["SuccessMessage"] = "Your account was created successfully! Welcome to FitTrack.";
            return RedirectToAction("Index", "Dashboard");
        }

        [HttpGet]
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Login(LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                if (IsJsonRequest()) return Fail("Email and password are required.");
                ViewBag.ErrorMessage = "Please enter both your email address and password.";
                return View();
            }

            string email = model.Email.Trim().ToLowerInvariant();
            var user = db.Users.FirstOrDefault(u => u.UserEmail.ToLower() == email);

            if (user == null || !VerifyPassword(model.Password, user.UserPassword))
            {
                if (IsJsonRequest()) return Fail("Invalid email or password.", 401);
                ViewBag.ErrorMessage = "Invalid email or password. Please verify your credentials and try again.";
                return View();
            }

            Session["UserId"] = user.UserId.ToString();
            Session["Name"] = user.UserName;
            Session["Role"] = user.Role;

            if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                Session["AdminId"] = user.UserId.ToString();
            }

            if (IsJsonRequest())
            {
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

            TempData["SuccessMessage"] = $"Welcome back, {user.UserName}!";
            return RedirectToAction("Index", "Dashboard");
        }

        [HttpPost]
        public ActionResult AdminLogin(LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return Fail("Admin email and password are required.");
            }

            string email = model.Email.Trim().ToLowerInvariant();
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
            }, "Admin login successful");
        }

        [HttpGet]
        public ActionResult CurrentUser()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();

            var user = db.Users.Find(CurrentUserId.Value);
            if (user == null) return NotFoundResponse();

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
                avatar = user.UserImage
            });
        }

        [HttpPost]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();

            if (IsJsonRequest())
            {
                return Success(null, "Logged out successfully");
            }
            return RedirectToAction("Login", "Users");
        }

        [HttpGet]
        public ActionResult ChangePassword()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Users");
            return View();
        }

        [HttpPost]
        public ActionResult ChangePassword(ChangePasswordDto model)
        {
            if (!CurrentUserId.HasValue)
            {
                if (IsJsonRequest()) return UnauthorizedResponse();
                return RedirectToAction("Login", "Users");
            }

            if (model == null || string.IsNullOrWhiteSpace(model.OldPassword) || string.IsNullOrWhiteSpace(model.NewPassword))
            {
                if (IsJsonRequest()) return Fail("Please provide both old and new passwords.");
                return View();
            }

            int userId = CurrentUserId.Value;
            var user = db.Users.Find(userId);
            if (user == null)
            {
                if (IsJsonRequest()) return NotFoundResponse();
                return View();
            }

            if (!VerifyPassword(model.OldPassword, user.UserPassword))
            {
                if (IsJsonRequest()) return Fail("Current password does not match.");
                TempData["Msg"] = "<script>alert('Old Password is Incorrect')</script>";
                return View();
            }

            if (model.NewPassword.Length < 6)
            {
                if (IsJsonRequest()) return Fail("New password must be at least 6 characters.");
                return View();
            }

            user.UserPassword = HashPassword(model.NewPassword);
            db.SaveChanges();

            if (IsJsonRequest())
            {
                return Success(null, "Password changed successfully.");
            }

            TempData["PassMsg"] = "<script>alert('Password Changed Successfully')</script>";
            return RedirectToAction("Login");
        }

        // Profile display
        [HttpGet]
        public new ActionResult Profile()
        {
            return RedirectToAction("UserProfile");
        }

        [HttpGet]
        public ActionResult UserProfile()
        {
            if (!CurrentUserId.HasValue) return RedirectToAction("Login");
            var user = db.Users.Find(CurrentUserId.Value);
            if (user == null) return HttpNotFound();
            return View("Profile", user);
        }

        [HttpGet]
        public ActionResult EditProfile(int? id)
        {
            if (!CurrentUserId.HasValue) return RedirectToAction("Login");
            var user = db.Users.Find(id ?? CurrentUserId.Value);
            if (user == null) return HttpNotFound();
            return View(user);
        }

        [HttpPost]
        public ActionResult EditProfile(Users_Table model, HttpPostedFileBase imageFile)
        {
            if (!CurrentUserId.HasValue) return RedirectToAction("Login");
            var user = db.Users.Find(CurrentUserId.Value);
            if (user != null)
            {
                if (imageFile != null && imageFile.ContentLength > 0)
                {
                    var fileName = Path.GetFileName(imageFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/Images/Uploads/"), fileName);
                    imageFile.SaveAs(path);
                    user.UserImage = "/Images/Uploads/" + fileName;
                }
                user.UserName = model.UserName;
                user.UserEmail = model.UserEmail;
                db.SaveChanges();
            }
            return RedirectToAction("UserProfile");
        }

        [HttpPost]
        public ActionResult Delete(int? id)
        {
            if (!CurrentUserId.HasValue) return RedirectToAction("Login");
            int targetId = id ?? CurrentUserId.Value;
            var user = db.Users.Find(targetId);
            if (user != null)
            {
                db.Users.Remove(user);
                db.SaveChanges();
            }
            Session.Clear();
            return RedirectToAction("Index");
        }
    }
}