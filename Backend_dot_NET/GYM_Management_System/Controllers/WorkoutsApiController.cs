using System;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class WorkoutsApiController : ApiControllerBase
    {
        public class WorkoutDto
        {
            public int? Id { get; set; }
            public string Exercise { get; set; }
            public string ExerciseType { get; set; }
            public int Duration { get; set; }
            public int CaloriesBurned { get; set; }
            public DateTime? Date { get; set; }
            public string Intensity { get; set; }
        }

        [HttpGet]
        public ActionResult GetMyWorkouts(string category = null, string search = null)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var query = db.Workouts.Where(w => w.UserId == userId);

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(w => w.ExerciseType.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.ToLower();
                query = query.Where(w => w.Exercise.ToLower().Contains(s));
            }

            var workouts = query
                .OrderByDescending(w => w.Date)
                .ToList()
                .Select(w => new
                {
                    id = w.Id,
                    exercise = w.Exercise,
                    exerciseType = w.ExerciseType,
                    duration = w.Duration,
                    caloriesBurned = w.CaloriesBurned,
                    date = w.Date,
                    intensity = w.Intensity
                });

            return Success(workouts);
        }

        [HttpPost]
        public ActionResult Create(WorkoutDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null || string.IsNullOrWhiteSpace(model.Exercise))
            {
                return Fail("Exercise name is required.");
            }

            int userId = CurrentUserId.Value;

            var workout = new Workout
            {
                UserId = userId,
                Exercise = model.Exercise.Trim(),
                ExerciseType = string.IsNullOrWhiteSpace(model.ExerciseType) ? "Cardio" : model.ExerciseType.Trim(),
                Duration = Math.Max(1, model.Duration),
                CaloriesBurned = Math.Max(1, model.CaloriesBurned),
                Date = model.Date ?? DateTime.Now,
                Intensity = string.IsNullOrWhiteSpace(model.Intensity) ? "Medium" : model.Intensity.Trim()
            };

            db.Workouts.Add(workout);
            db.SaveChanges();

            // Gamification check: First Workout
            CheckAchievements(userId);

            return Success(new
            {
                id = workout.Id,
                exercise = workout.Exercise,
                exerciseType = workout.ExerciseType,
                duration = workout.Duration,
                caloriesBurned = workout.CaloriesBurned,
                date = workout.Date,
                intensity = workout.Intensity
            }, "Workout logged successfully");
        }

        [HttpPost]
        public ActionResult Update(WorkoutDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null || !model.Id.HasValue) return Fail("Workout ID is required");

            int userId = CurrentUserId.Value;
            var workout = db.Workouts.FirstOrDefault(w => w.Id == model.Id.Value && w.UserId == userId);

            if (workout == null) return NotFoundResponse("Workout not found or access denied");

            workout.Exercise = string.IsNullOrWhiteSpace(model.Exercise) ? workout.Exercise : model.Exercise.Trim();
            workout.ExerciseType = string.IsNullOrWhiteSpace(model.ExerciseType) ? workout.ExerciseType : model.ExerciseType.Trim();
            workout.Duration = model.Duration > 0 ? model.Duration : workout.Duration;
            workout.CaloriesBurned = model.CaloriesBurned > 0 ? model.CaloriesBurned : workout.CaloriesBurned;
            if (model.Date.HasValue) workout.Date = model.Date.Value;
            workout.Intensity = string.IsNullOrWhiteSpace(model.Intensity) ? workout.Intensity : model.Intensity.Trim();

            db.Entry(workout).State = EntityState.Modified;
            db.SaveChanges();

            return Success(new
            {
                id = workout.Id,
                exercise = workout.Exercise,
                exerciseType = workout.ExerciseType,
                duration = workout.Duration,
                caloriesBurned = workout.CaloriesBurned,
                date = workout.Date,
                intensity = workout.Intensity
            }, "Workout updated successfully");
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var workout = db.Workouts.FirstOrDefault(w => w.Id == id && w.UserId == userId);
            if (workout == null) return NotFoundResponse("Workout not found or access denied");

            db.Workouts.Remove(workout);
            db.SaveChanges();

            return Success(null, "Workout deleted successfully");
        }

        private void CheckAchievements(int userId)
        {
            int count = db.Workouts.Count(w => w.UserId == userId);
            if (count == 1 && !db.Achievements.Any(a => a.UserId == userId && a.BadgeKey == "first_workout"))
            {
                db.Achievements.Add(new Achievement
                {
                    UserId = userId,
                    BadgeKey = "first_workout",
                    Title = "First Sweat",
                    Description = "Logged your very first workout in FitTrack!",
                    Icon = "award",
                    UnlockedAt = DateTime.Now
                });
                db.Notifications.Add(new Notification
                {
                    UserId = userId,
                    Title = "Badge Unlocked: First Sweat!",
                    Message = "Congratulations on logging your first workout! Keep the momentum going.",
                    Type = "success",
                    CreatedAt = DateTime.Now
                });
                db.SaveChanges();
            }
        }
    }
}
