using System;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class BMIApiController : ApiControllerBase
    {
        public class BmiInputDto
        {
            public float Height { get; set; } // Can be cm (e.g. 175) or meters (e.g. 1.75)
            public float Weight { get; set; } // in kg
        }

        [HttpGet]
        public ActionResult GetHistory()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var history = db.BMIs
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Date)
                .ToList()
                .Select(b => new
                {
                    id = b.Id,
                    height = b.Height,
                    weight = b.Weight,
                    bmiScore = Math.Round(b.BMIscore, 1),
                    healthStatus = b.HealthStatus,
                    category = GetBmiCategory(b.BMIscore),
                    color = GetBmiColor(b.BMIscore),
                    date = b.Date
                });

            return Success(history);
        }

        [HttpGet]
        public ActionResult GetLatest()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var latest = db.BMIs
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Date)
                .FirstOrDefault();

            if (latest == null)
            {
                // Fallback to user height & weight if available
                var user = db.Users.Find(userId);
                if (user != null && user.Height.HasValue && user.Weight.HasValue && user.Height > 0)
                {
                    float hM = user.Height.Value > 3 ? user.Height.Value / 100f : user.Height.Value;
                    float score = user.Weight.Value / (hM * hM);
                    return Success(new
                    {
                        height = user.Height.Value,
                        weight = user.Weight.Value,
                        bmiScore = Math.Round(score, 1),
                        healthStatus = GetDefaultStatus(score),
                        category = GetBmiCategory(score),
                        color = GetBmiColor(score),
                        date = DateTime.Now
                    });
                }
                return Success(null, "No BMI records found");
            }

            return Success(new
            {
                id = latest.Id,
                height = latest.Height,
                weight = latest.Weight,
                bmiScore = Math.Round(latest.BMIscore, 1),
                healthStatus = latest.HealthStatus,
                category = GetBmiCategory(latest.BMIscore),
                color = GetBmiColor(latest.BMIscore),
                date = latest.Date
            });
        }

        [HttpPost]
        public ActionResult CalculateAndSave(BmiInputDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null || model.Height <= 0 || model.Weight <= 0)
            {
                return Fail("Please enter valid positive numbers for height and weight.");
            }

            int userId = CurrentUserId.Value;

            // Height normalization: if entered in cm (> 3), convert to meters for formula
            float heightInM = model.Height > 3 ? model.Height / 100f : model.Height;
            float bmiScore = model.Weight / (heightInM * heightInM);

            string category = GetBmiCategory(bmiScore);
            string status = GetDetailedStatus(category, bmiScore);

            var record = new BMImodel
            {
                UserId = userId,
                Height = model.Height,
                Weight = model.Weight,
                BMIscore = (float)Math.Round(bmiScore, 1),
                HealthStatus = status,
                Date = DateTime.Now
            };

            db.BMIs.Add(record);

            // Update user profile height & weight
            var user = db.Users.Find(userId);
            if (user != null)
            {
                user.Height = model.Height;
                user.Weight = model.Weight;
            }

            db.SaveChanges();

            // Fetch suggested plans
            var suggestedDiet = db.DietPlans.Where(d => d.BmiCategory == category && d.IsActive).ToList();
            var suggestedWorkouts = db.WorkoutPlans.Where(w => w.BmiCategory == category && w.IsActive).ToList();

            return Success(new
            {
                id = record.Id,
                height = record.Height,
                weight = record.Weight,
                bmiScore = record.BMIscore,
                category = category,
                color = GetBmiColor(bmiScore),
                healthStatus = status,
                date = record.Date,
                suggestedDietPlans = suggestedDiet,
                suggestedWorkoutPlans = suggestedWorkouts
            }, "BMI calculated and recorded successfully");
        }

        public static string GetBmiCategory(double bmi)
        {
            if (bmi < 18.5) return "Underweight";
            if (bmi < 25.0) return "Normal";
            if (bmi < 30.0) return "Overweight";
            return "Obese";
        }

        public static string GetBmiColor(double bmi)
        {
            if (bmi < 18.5) return "#3b82f6"; // Blue
            if (bmi < 25.0) return "#10b981"; // Emerald Green
            if (bmi < 30.0) return "#f59e0b"; // Amber / Orange
            return "#ef4444";                 // Red
        }

        private string GetDefaultStatus(double bmi)
        {
            return GetDetailedStatus(GetBmiCategory(bmi), bmi);
        }

        private string GetDetailedStatus(string category, double bmi)
        {
            switch (category)
            {
                case "Underweight":
                    return "Underweight: Consider a nutrient-dense calorie surplus with targeted resistance training to build healthy muscle mass.";
                case "Normal":
                    return "Optimal Healthy Weight: Excellent job! Continue your balanced nutrition and consistent weekly physical activity.";
                case "Overweight":
                    return "Overweight: Aim for a moderate caloric deficit, increase daily hydration, and combine cardio with strength workouts.";
                case "Obese":
                default:
                    return "Obese: Focus on progressive low-impact exercise, structured whole-food meal planning, and consult a physician if needed.";
            }
        }
    }
}
