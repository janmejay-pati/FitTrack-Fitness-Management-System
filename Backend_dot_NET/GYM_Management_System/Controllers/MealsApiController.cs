using System;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class MealsApiController : ApiControllerBase
    {
        public class MealDto
        {
            public int? Id { get; set; }
            public string FoodItems { get; set; }
            public int Calories { get; set; }
            public string MealType { get; set; }
            public DateTime? Date { get; set; }
        }

        [HttpGet]
        public ActionResult GetMyMeals(string mealType = null, string search = null)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var query = db.MealLogs.Where(m => m.UserId == userId);

            if (!string.IsNullOrWhiteSpace(mealType) && !mealType.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(m => m.MealType.ToLower() == mealType.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.ToLower();
                query = query.Where(m => m.FoodItems.ToLower().Contains(s));
            }

            var meals = query
                .OrderByDescending(m => m.Date)
                .ToList()
                .Select(m => new
                {
                    id = m.Id,
                    foodItems = m.FoodItems,
                    calories = m.Calories,
                    mealType = m.MealType,
                    date = m.Date
                });

            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);
            var todayMeals = db.MealLogs.Where(m => m.UserId == userId && m.Date >= today && m.Date < tomorrow).ToList();

            var summary = new
            {
                totalToday = todayMeals.Sum(m => m.Calories),
                breakfast = todayMeals.Where(m => string.Equals(m.MealType, "Breakfast", StringComparison.OrdinalIgnoreCase)).Sum(m => m.Calories),
                lunch = todayMeals.Where(m => string.Equals(m.MealType, "Lunch", StringComparison.OrdinalIgnoreCase)).Sum(m => m.Calories),
                dinner = todayMeals.Where(m => string.Equals(m.MealType, "Dinner", StringComparison.OrdinalIgnoreCase)).Sum(m => m.Calories),
                snacks = todayMeals.Where(m => string.Equals(m.MealType, "Snacks", StringComparison.OrdinalIgnoreCase)).Sum(m => m.Calories)
            };

            return Success(new
            {
                meals = meals,
                summary = summary
            });
        }

        [HttpPost]
        public ActionResult Create(MealDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null || string.IsNullOrWhiteSpace(model.FoodItems))
            {
                return Fail("Food item name or description is required.");
            }

            int userId = CurrentUserId.Value;

            var meal = new MealLog
            {
                UserId = userId,
                FoodItems = model.FoodItems.Trim(),
                Calories = Math.Max(1, model.Calories),
                MealType = string.IsNullOrWhiteSpace(model.MealType) ? "Lunch" : model.MealType.Trim(),
                Date = model.Date ?? DateTime.Now
            };

            db.MealLogs.Add(meal);
            db.SaveChanges();

            return Success(new
            {
                id = meal.Id,
                foodItems = meal.FoodItems,
                calories = meal.Calories,
                mealType = meal.MealType,
                date = meal.Date
            }, "Meal logged successfully");
        }

        [HttpPost]
        public ActionResult Update(MealDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null || !model.Id.HasValue) return Fail("Meal ID is required");

            int userId = CurrentUserId.Value;
            var meal = db.MealLogs.FirstOrDefault(m => m.Id == model.Id.Value && m.UserId == userId);

            if (meal == null) return NotFoundResponse("Meal log not found or access denied");

            meal.FoodItems = string.IsNullOrWhiteSpace(model.FoodItems) ? meal.FoodItems : model.FoodItems.Trim();
            meal.Calories = model.Calories > 0 ? model.Calories : meal.Calories;
            meal.MealType = string.IsNullOrWhiteSpace(model.MealType) ? meal.MealType : model.MealType.Trim();
            if (model.Date.HasValue) meal.Date = model.Date.Value;

            db.Entry(meal).State = EntityState.Modified;
            db.SaveChanges();

            return Success(new
            {
                id = meal.Id,
                foodItems = meal.FoodItems,
                calories = meal.Calories,
                mealType = meal.MealType,
                date = meal.Date
            }, "Meal updated successfully");
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var meal = db.MealLogs.FirstOrDefault(m => m.Id == id && m.UserId == userId);
            if (meal == null) return NotFoundResponse("Meal log not found or access denied");

            db.MealLogs.Remove(meal);
            db.SaveChanges();

            return Success(null, "Meal deleted successfully");
        }
    }
}
