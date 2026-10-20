using System;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class AdminApiController : ApiControllerBase
    {
        public class SaveDietPlanDto
        {
            public int? Id { get; set; }
            public string PlanName { get; set; }
            public string Description { get; set; }
            public string MealType { get; set; }
            public string BmiCategory { get; set; }
            public int Calories { get; set; }
            public bool IsActive { get; set; } = true;
        }

        public class SaveWorkoutPlanDto
        {
            public int? Id { get; set; }
            public string PlanName { get; set; }
            public string Description { get; set; }
            public string IntensityLevel { get; set; }
            public string BmiCategory { get; set; }
            public int DurationMinutes { get; set; }
            public bool IsActive { get; set; } = true;
        }

        public class SaveTutorialDto
        {
            public int? Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string VideoUrl { get; set; }
            public string ThumbnailUrl { get; set; }
            public string Category { get; set; }
            public string Duration { get; set; }
        }

        public class BroadcastDto
        {
            public string Title { get; set; }
            public string Message { get; set; }
            public string Type { get; set; } = "info";
        }

        [HttpGet]
        public ActionResult GetStats()
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();

            int totalUsers = db.Users.Count(u => u.Role != "Admin");
            int totalWorkouts = db.Workouts.Count();
            int totalMeals = db.MealLogs.Count();
            int totalDietPlans = db.DietPlans.Count();
            int totalWorkoutPlans = db.WorkoutPlans.Count();
            int totalTutorials = db.VideoTutorials.Count();

            // Recent registrations
            var recentUsers = db.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(10)
                .ToList()
                .Select(u => new
                {
                    id = u.UserId,
                    name = u.UserName,
                    email = u.UserEmail,
                    role = u.Role,
                    createdAt = u.CreatedAt
                });

            return Success(new
            {
                totalUsers = totalUsers,
                totalWorkouts = totalWorkouts,
                totalMeals = totalMeals,
                totalPlans = totalDietPlans + totalWorkoutPlans,
                totalTutorials = totalTutorials,
                recentUsers = recentUsers
            });
        }

        [HttpGet]
        public ActionResult GetUsers()
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();

            var users = db.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToList()
                .Select(u => new
                {
                    id = u.UserId,
                    name = u.UserName,
                    email = u.UserEmail,
                    role = u.Role ?? "User",
                    age = u.UserAge,
                    gender = u.UserGender,
                    height = u.Height,
                    weight = u.Weight,
                    createdAt = u.CreatedAt
                });

            return Success(users);
        }

        [HttpPost]
        public ActionResult DeleteUser(int id)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();

            if (CurrentUserId.HasValue && CurrentUserId.Value == id)
            {
                return Fail("Cannot delete your own active administrator account.");
            }

            var user = db.Users.Find(id);
            if (user == null) return NotFoundResponse();

            db.Users.Remove(user);
            db.SaveChanges();

            return Success(null, "User account removed");
        }

        [HttpPost]
        public ActionResult SaveDietPlan(SaveDietPlanDto model)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();
            if (model == null || string.IsNullOrWhiteSpace(model.PlanName)) return Fail("Plan name is required");

            if (model.Id.HasValue && model.Id.Value > 0)
            {
                var plan = db.DietPlans.Find(model.Id.Value);
                if (plan == null) return NotFoundResponse();

                plan.PlanName = model.PlanName.Trim();
                plan.Description = model.Description;
                plan.MealType = string.IsNullOrWhiteSpace(model.MealType) ? "Lunch" : model.MealType.Trim();
                plan.BmiCategory = string.IsNullOrWhiteSpace(model.BmiCategory) ? "Normal" : model.BmiCategory.Trim();
                plan.Calories = model.Calories;
                plan.IsActive = model.IsActive;

                db.Entry(plan).State = EntityState.Modified;
                db.SaveChanges();

                return Success(plan, "Diet plan updated");
            }
            else
            {
                var plan = new DietPlan
                {
                    PlanName = model.PlanName.Trim(),
                    Description = model.Description,
                    MealType = string.IsNullOrWhiteSpace(model.MealType) ? "Lunch" : model.MealType.Trim(),
                    BmiCategory = string.IsNullOrWhiteSpace(model.BmiCategory) ? "Normal" : model.BmiCategory.Trim(),
                    Calories = model.Calories,
                    IsActive = model.IsActive,
                    UserId = 0
                };
                db.DietPlans.Add(plan);
                db.SaveChanges();

                return Success(plan, "Diet plan created");
            }
        }

        [HttpPost]
        public ActionResult DeleteDietPlan(int id)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();

            var plan = db.DietPlans.Find(id);
            if (plan == null) return NotFoundResponse();

            db.DietPlans.Remove(plan);
            db.SaveChanges();

            return Success(null, "Diet plan deleted");
        }

        [HttpPost]
        public ActionResult SaveWorkoutPlan(SaveWorkoutPlanDto model)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();
            if (model == null || string.IsNullOrWhiteSpace(model.PlanName)) return Fail("Plan name is required");

            if (model.Id.HasValue && model.Id.Value > 0)
            {
                var plan = db.WorkoutPlans.Find(model.Id.Value);
                if (plan == null) return NotFoundResponse();

                plan.PlanName = model.PlanName.Trim();
                plan.Description = model.Description;
                plan.IntensityLevel = string.IsNullOrWhiteSpace(model.IntensityLevel) ? "Medium" : model.IntensityLevel.Trim();
                plan.BmiCategory = string.IsNullOrWhiteSpace(model.BmiCategory) ? "Normal" : model.BmiCategory.Trim();
                plan.DurationMinutes = model.DurationMinutes > 0 ? model.DurationMinutes : 30;
                plan.IsActive = model.IsActive;

                db.Entry(plan).State = EntityState.Modified;
                db.SaveChanges();

                return Success(plan, "Workout plan updated");
            }
            else
            {
                var plan = new WorkoutPlan
                {
                    PlanName = model.PlanName.Trim(),
                    Description = model.Description,
                    IntensityLevel = string.IsNullOrWhiteSpace(model.IntensityLevel) ? "Medium" : model.IntensityLevel.Trim(),
                    BmiCategory = string.IsNullOrWhiteSpace(model.BmiCategory) ? "Normal" : model.BmiCategory.Trim(),
                    DurationMinutes = model.DurationMinutes > 0 ? model.DurationMinutes : 30,
                    IsActive = model.IsActive,
                    UserId = 0
                };
                db.WorkoutPlans.Add(plan);
                db.SaveChanges();

                return Success(plan, "Workout plan created");
            }
        }

        [HttpPost]
        public ActionResult DeleteWorkoutPlan(int id)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();

            var plan = db.WorkoutPlans.Find(id);
            if (plan == null) return NotFoundResponse();

            db.WorkoutPlans.Remove(plan);
            db.SaveChanges();

            return Success(null, "Workout plan deleted");
        }

        [HttpPost]
        public ActionResult SaveTutorial(SaveTutorialDto model)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();
            if (model == null || string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.VideoUrl))
            {
                return Fail("Title and video URL are required");
            }

            if (model.Id.HasValue && model.Id.Value > 0)
            {
                var tut = db.VideoTutorials.Find(model.Id.Value);
                if (tut == null) return NotFoundResponse();

                tut.Title = model.Title.Trim();
                tut.Description = model.Description;
                tut.VideoUrl = model.VideoUrl.Trim();
                tut.ThumbnailUrl = model.ThumbnailUrl;
                tut.Category = string.IsNullOrWhiteSpace(model.Category) ? "Workout" : model.Category.Trim();
                tut.Duration = string.IsNullOrWhiteSpace(model.Duration) ? "15 min" : model.Duration.Trim();

                db.Entry(tut).State = EntityState.Modified;
                db.SaveChanges();

                return Success(tut, "Tutorial updated");
            }
            else
            {
                var tut = new VideoTutorials
                {
                    Title = model.Title.Trim(),
                    Description = model.Description,
                    VideoUrl = model.VideoUrl.Trim(),
                    ThumbnailUrl = model.ThumbnailUrl,
                    Category = string.IsNullOrWhiteSpace(model.Category) ? "Workout" : model.Category.Trim(),
                    Duration = string.IsNullOrWhiteSpace(model.Duration) ? "15 min" : model.Duration.Trim()
                };
                db.VideoTutorials.Add(tut);
                db.SaveChanges();

                return Success(tut, "Tutorial created");
            }
        }

        [HttpPost]
        public ActionResult DeleteTutorial(int id)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();

            var tut = db.VideoTutorials.Find(id);
            if (tut == null) return NotFoundResponse();

            db.VideoTutorials.Remove(tut);
            db.SaveChanges();

            return Success(null, "Tutorial deleted");
        }

        [HttpPost]
        public ActionResult SendBroadcastNotification(BroadcastDto model)
        {
            if (!CurrentAdminId.HasValue) return ForbiddenResponse();
            if (model == null || string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.Message))
            {
                return Fail("Title and message are required");
            }

            var allUsers = db.Users.Select(u => u.UserId).ToList();
            foreach (var uid in allUsers)
            {
                db.Notifications.Add(new Notification
                {
                    UserId = uid,
                    Title = model.Title.Trim(),
                    Message = model.Message.Trim(),
                    Type = string.IsNullOrWhiteSpace(model.Type) ? "info" : model.Type.Trim(),
                    CreatedAt = DateTime.Now
                });
            }
            db.SaveChanges();

            return Success(null, $"Notification broadcast to {allUsers.Count} users");
        }
    }
}
