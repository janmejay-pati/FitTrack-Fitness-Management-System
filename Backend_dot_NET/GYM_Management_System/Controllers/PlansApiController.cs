using System;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class PlansApiController : ApiControllerBase
    {
        [HttpGet]
        public ActionResult GetDietPlans(string category = null)
        {
            var query = db.DietPlans.Where(d => d.IsActive);

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(d => d.BmiCategory.ToLower() == category.ToLower());
            }

            var plans = query
                .OrderBy(d => d.Id)
                .ToList()
                .Select(d => new
                {
                    id = d.Id,
                    planName = d.PlanName,
                    description = d.Description,
                    mealType = d.MealType,
                    bmiCategory = d.BmiCategory,
                    calories = d.Calories
                });

            return Success(plans);
        }

        [HttpGet]
        public ActionResult GetWorkoutPlans(string category = null, string intensity = null)
        {
            var query = db.WorkoutPlans.Where(w => w.IsActive);

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(w => w.BmiCategory.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(intensity) && !intensity.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(w => w.IntensityLevel.ToLower() == intensity.ToLower());
            }

            var plans = query
                .OrderBy(w => w.Id)
                .ToList()
                .Select(w => new
                {
                    id = w.Id,
                    planName = w.PlanName,
                    description = w.Description,
                    intensityLevel = w.IntensityLevel,
                    bmiCategory = w.BmiCategory,
                    durationMinutes = w.DurationMinutes
                });

            return Success(plans);
        }

        [HttpGet]
        public ActionResult GetRecommendedPlans()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var latestBmi = db.BMIs
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Date)
                .FirstOrDefault();

            string category = "Normal";
            double score = 22.0;

            if (latestBmi != null)
            {
                score = latestBmi.BMIscore;
                category = BMIApiController.GetBmiCategory(latestBmi.BMIscore);
            }
            else
            {
                var user = db.Users.Find(userId);
                if (user != null && user.Height.HasValue && user.Weight.HasValue && user.Height > 0)
                {
                    float hM = user.Height.Value > 3 ? user.Height.Value / 100f : user.Height.Value;
                    score = user.Weight.Value / (hM * hM);
                    category = BMIApiController.GetBmiCategory(score);
                }
            }

            var dietPlans = db.DietPlans
                .Where(d => d.IsActive && d.BmiCategory.ToLower() == category.ToLower())
                .ToList()
                .Select(d => new
                {
                    id = d.Id,
                    planName = d.PlanName,
                    description = d.Description,
                    mealType = d.MealType,
                    bmiCategory = d.BmiCategory,
                    calories = d.Calories
                });

            var workoutPlans = db.WorkoutPlans
                .Where(w => w.IsActive && w.BmiCategory.ToLower() == category.ToLower())
                .ToList()
                .Select(w => new
                {
                    id = w.Id,
                    planName = w.PlanName,
                    description = w.Description,
                    intensityLevel = w.IntensityLevel,
                    bmiCategory = w.BmiCategory,
                    durationMinutes = w.DurationMinutes
                });

            return Success(new
            {
                bmiCategory = category,
                bmiScore = Math.Round(score, 1),
                dietPlans = dietPlans,
                workoutPlans = workoutPlans
            });
        }
    }
}
