using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class FitnessApiController : ApiControllerBase
    {
        public class ScoreResult
        {
            public int Score { get; set; }
            public int WorkoutScore { get; set; }
            public int NutritionScore { get; set; }
            public int HydrationScore { get; set; }
            public int GoalScore { get; set; }
            public int StreakScore { get; set; }
            public bool HasData { get; set; }
        }

        public class TimelineEvent
        {
            public string Id { get; set; }
            public string Type { get; set; } // workout, meal, water, bmi, goal, achievement
            public string Title { get; set; }
            public string Description { get; set; }
            public string Category { get; set; }
            public string Timestamp { get; set; }
            public object Metrics { get; set; }
        }

        // GET: /FitnessApi/GetIntelligence
        [HttpGet]
        public ActionResult GetIntelligence()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            DateTime today = DateTime.Today;
            DateTime tomorrow = today.AddDays(1);
            DateTime weekAgo = today.AddDays(-7);
            DateTime twoWeeksAgo = today.AddDays(-14);
            DateTime monthAgo = today.AddDays(-30);

            // 1. Calculate Personal Fitness Score (Current week vs Previous week)
            var currentScore = CalculateScoreForWindow(userId, weekAgo, tomorrow);
            var prevScore = CalculateScoreForWindow(userId, twoWeeksAgo, weekAgo);

            int? trend = null;
            if (currentScore.HasData && prevScore.HasData)
            {
                trend = currentScore.Score - prevScore.Score;
            }

            string evaluation = "Beginner";
            if (currentScore.Score >= 85) evaluation = "Elite Performance";
            else if (currentScore.Score >= 70) evaluation = "Optimal Progress";
            else if (currentScore.Score >= 50) evaluation = "Consistent Momentum";
            else if (currentScore.Score >= 30) evaluation = "Building Habits";

            // 2. Progress Intelligence Metrics
            var workoutDays = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= weekAgo && w.Date < tomorrow)
                .Select(w => w.Date)
                .ToList()
                .Select(d => d.Date)
                .Distinct()
                .Count();
            int workoutConsistency = Math.Min(100, (int)((workoutDays / 7.0) * 100));

            var mealDays = db.MealLogs
                .Where(m => m.UserId == userId && m.Date >= weekAgo && m.Date < tomorrow)
                .Select(m => m.Date)
                .ToList()
                .Select(d => d.Date)
                .Distinct()
                .Count();
            int nutritionConsistency = Math.Min(100, (int)((mealDays / 7.0) * 100));

            // Hydration days meeting target (2000ml)
            var waterEntries = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= weekAgo && w.Date < tomorrow)
                .Select(w => new { w.Date, w.AmountInMl })
                .ToList();
            var waterByDay = waterEntries
                .GroupBy(w => w.Date.Date)
                .Select(g => g.Sum(x => x.AmountInMl))
                .ToList();
            int hydDaysMeeting = waterByDay.Count(amt => amt >= 2000);
            int hydrationConsistency = Math.Min(100, (int)((hydDaysMeeting / 7.0) * 100));

            // Today's Goal adherence
            var todayGoal = db.SetGoals
                .FirstOrDefault(g => g.UserId == userId && g.Date.Year == today.Year && g.Date.Month == today.Month && g.Date.Day == today.Day);

            int calBurnedToday = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.CaloriesBurned).DefaultIfEmpty(0).Sum() ?? 0;

            int workoutMinsToday = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.Duration).DefaultIfEmpty(0).Sum() ?? 0;

            int waterToday = db.WaterTntakeLogs
                .Where(w => w.UserId == userId && w.Date >= today && w.Date < tomorrow)
                .Select(w => (int?)w.AmountInMl).DefaultIfEmpty(0).Sum() ?? 0;

            int targetCalories = todayGoal != null && todayGoal.CalorieGoal > 0 ? todayGoal.CalorieGoal : 2000;
            int targetMins = todayGoal != null && todayGoal.WorkoutGoal > 0 ? todayGoal.WorkoutGoal : 45;
            int targetWater = todayGoal != null && todayGoal.WaterIntakeGoal > 0 ? todayGoal.WaterIntakeGoal : 2500;

            int calProg = Math.Min(100, (int)((calBurnedToday / (double)targetCalories) * 100));
            int minProg = Math.Min(100, (int)((workoutMinsToday / (double)targetMins) * 100));
            int watProg = Math.Min(100, (int)((waterToday / (double)targetWater) * 100));
            int goalProgress = (int)Math.Round((calProg + minProg + watProg) / 3.0);

            int overallConsistency = (int)Math.Round(
                (workoutConsistency * 0.35) + 
                (nutritionConsistency * 0.25) + 
                (hydrationConsistency * 0.20) + 
                (goalProgress * 0.20)
            );

            // 7-Day Day-by-Day Historical Comparison
            var weeklyTrends = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                DateTime day = today.AddDays(-i);
                DateTime nextDay = day.AddDays(1);

                int cBurn = db.Workouts.Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.CaloriesBurned).DefaultIfEmpty(0).Sum() ?? 0;
                int cCons = db.MealLogs.Where(m => m.UserId == userId && m.Date >= day && m.Date < nextDay)
                    .Select(m => (int?)m.Calories).DefaultIfEmpty(0).Sum() ?? 0;
                int wMl = db.WaterTntakeLogs.Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.AmountInMl).DefaultIfEmpty(0).Sum() ?? 0;
                int wMins = db.Workouts.Where(w => w.UserId == userId && w.Date >= day && w.Date < nextDay)
                    .Select(w => (int?)w.Duration).DefaultIfEmpty(0).Sum() ?? 0;

                weeklyTrends.Add(new
                {
                    day = day.ToString("ddd"),
                    date = day.ToString("yyyy-MM-dd"),
                    caloriesBurned = cBurn,
                    caloriesConsumed = cCons,
                    waterIntake = wMl,
                    workoutMinutes = wMins
                });
            }

            // Monthly Totals
            int monthBurned = db.Workouts.Where(w => w.UserId == userId && w.Date >= monthAgo && w.Date < tomorrow)
                .Select(w => (int?)w.CaloriesBurned).DefaultIfEmpty(0).Sum() ?? 0;
            int monthMinutes = db.Workouts.Where(w => w.UserId == userId && w.Date >= monthAgo && w.Date < tomorrow)
                .Select(w => (int?)w.Duration).DefaultIfEmpty(0).Sum() ?? 0;
            int monthWorkoutsCount = db.Workouts.Count(w => w.UserId == userId && w.Date >= monthAgo && w.Date < tomorrow);
            int monthWater = db.WaterTntakeLogs.Where(w => w.UserId == userId && w.Date >= monthAgo && w.Date < tomorrow)
                .Select(w => (int?)w.AmountInMl).DefaultIfEmpty(0).Sum() ?? 0;

            // 3. Goal Journey Details
            var goalMilestones = new List<object>
            {
                new { percent = 25, title = "Ignition", description = "First 25% completed", isAchieved = goalProgress >= 25 },
                new { percent = 50, title = "Halfway", description = "Halfway to target", isAchieved = goalProgress >= 50 },
                new { percent = 75, title = "Power Surge", description = "Final push (75%)", isAchieved = goalProgress >= 75 },
                new { percent = 100, title = "Goal Conquered", description = "All targets met today", isAchieved = goalProgress >= 100 }
            };

            // 4. Streak Engine
            int currentStreak = CalculateStreak(userId);
            int longestStreak = CalculateLongestStreak(userId);
            int totalActiveDays = CalculateTotalActiveDays(userId);

            // 5. Adaptive Weekly Plan
            var latestBmi = db.BMIs.Where(b => b.UserId == userId).OrderByDescending(b => b.Date).FirstOrDefault();
            string bmiCat = latestBmi != null ? latestBmi.HealthStatus : "Normal";

            var adaptivePlan = GenerateAdaptiveWeeklyPlan(userId, today, bmiCat, workoutDays, hydrationConsistency);

            var userRecord = db.Users.Find(userId);
            string userGender = userRecord?.UserGender ?? "Male";

            return Success(new
            {
                gender = userGender,
                fitnessScore = new
                {
                    score = currentScore.Score,
                    previousScore = prevScore.Score,
                    trend = trend,
                    evaluation = evaluation,
                    hasEnoughData = currentScore.HasData,
                    breakdown = new
                    {
                        workoutConsistency = currentScore.WorkoutScore,
                        nutritionConsistency = currentScore.NutritionScore,
                        hydrationConsistency = currentScore.HydrationScore,
                        goalAdherence = currentScore.GoalScore,
                        streakAndBiometrics = currentScore.StreakScore
                    }
                },
                progress = new
                {
                    workoutConsistency = workoutConsistency,
                    hydrationConsistency = hydrationConsistency,
                    nutritionConsistency = nutritionConsistency,
                    goalProgress = goalProgress,
                    overallConsistency = overallConsistency,
                    weeklyTrends = weeklyTrends,
                    monthlyTotals = new
                    {
                        totalCaloriesBurned = monthBurned,
                        totalWorkoutMinutes = monthMinutes,
                        totalWorkouts = monthWorkoutsCount,
                        totalWaterMl = monthWater
                    }
                },
                goalJourney = new
                {
                    hasActiveGoal = todayGoal != null,
                    goalId = todayGoal != null ? todayGoal.Id : 0,
                    calorieTarget = targetCalories,
                    calorieCurrent = calBurnedToday,
                    workoutTarget = targetMins,
                    workoutCurrent = workoutMinsToday,
                    waterTarget = targetWater,
                    waterCurrent = waterToday,
                    overallProgressPercentage = goalProgress,
                    isCompleted = (todayGoal != null && todayGoal.IsCompleted) || goalProgress >= 100,
                    milestones = goalMilestones
                },
                streaks = new
                {
                    currentStreak = currentStreak,
                    longestStreak = longestStreak,
                    totalActiveDays = totalActiveDays
                },
                adaptiveWeeklyPlan = adaptivePlan
            });
        }

        // GET: /FitnessApi/GetTimeline?take=30
        [HttpGet]
        public ActionResult GetTimeline(int take = 30)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var events = new List<TimelineEvent>();

            // Workouts
            var workouts = db.Workouts.Where(w => w.UserId == userId).OrderByDescending(w => w.Date).Take(take).ToList();
            foreach (var w in workouts)
            {
                events.Add(new TimelineEvent
                {
                    Id = "workout-" + w.Id,
                    Type = "workout",
                    Title = w.Exercise,
                    Description = $"{w.Duration} minutes of {w.ExerciseType} ({w.Intensity})",
                    Category = w.ExerciseType ?? "Workout",
                    Timestamp = w.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Metrics = new { calories = w.CaloriesBurned, duration = w.Duration, intensity = w.Intensity }
                });
            }

            // Meals
            var meals = db.MealLogs.Where(m => m.UserId == userId).OrderByDescending(m => m.Date).Take(take).ToList();
            foreach (var m in meals)
            {
                events.Add(new TimelineEvent
                {
                    Id = "meal-" + m.Id,
                    Type = "meal",
                    Title = m.FoodItems,
                    Description = $"{m.MealType} - {m.Calories} kcal logged",
                    Category = m.MealType ?? "Nutrition",
                    Timestamp = m.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Metrics = new { calories = m.Calories, mealType = m.MealType }
                });
            }

            // Water logs
            var waterLogs = db.WaterTntakeLogs.Where(w => w.UserId == userId).OrderByDescending(w => w.Date).Take(take).ToList();
            foreach (var wt in waterLogs)
            {
                events.Add(new TimelineEvent
                {
                    Id = "water-" + wt.Id,
                    Type = "water",
                    Title = "Hydration Intake",
                    Description = $"+{wt.AmountInMl} ml pure hydration",
                    Category = "Hydration",
                    Timestamp = wt.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Metrics = new { amountMl = wt.AmountInMl }
                });
            }

            // BMIs
            var bmis = db.BMIs.Where(b => b.UserId == userId).OrderByDescending(b => b.Date).Take(10).ToList();
            foreach (var b in bmis)
            {
                events.Add(new TimelineEvent
                {
                    Id = "bmi-" + b.Id,
                    Type = "bmi",
                    Title = "Biometric Evaluation",
                    Description = $"BMI: {Math.Round(b.BMIscore, 1)} ({b.HealthStatus}), Weight: {b.Weight} kg",
                    Category = "Biometrics",
                    Timestamp = b.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Metrics = new { bmi = b.BMIscore, weight = b.Weight, status = b.HealthStatus }
                });
            }

            // Achievements
            var achievements = db.Achievements.Where(a => a.UserId == userId).OrderByDescending(a => a.UnlockedAt).Take(10).ToList();
            foreach (var ach in achievements)
            {
                events.Add(new TimelineEvent
                {
                    Id = "achievement-" + ach.Id,
                    Type = "achievement",
                    Title = "Achievement Unlocked: " + ach.Title,
                    Description = ach.Description,
                    Category = "Milestone",
                    Timestamp = ach.UnlockedAt.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Metrics = new { badgeKey = ach.BadgeKey, icon = ach.Icon }
                });
            }

            var sorted = events.OrderByDescending(e => e.Timestamp).Take(take).ToList();
            return Success(sorted);
        }

        // GET: /FitnessApi/GetMuscleActivity
        [HttpGet]
        public ActionResult GetMuscleActivity()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            int userId = CurrentUserId.Value;

            var userWorkouts = db.Workouts.Where(w => w.UserId == userId).ToList();

            var groups = new Dictionary<string, (int count, int minutes, int calories, List<string> exercises)>
            {
                { "Chest", (0, 0, 0, new List<string>()) },
                { "Back", (0, 0, 0, new List<string>()) },
                { "Shoulders", (0, 0, 0, new List<string>()) },
                { "Biceps", (0, 0, 0, new List<string>()) },
                { "Triceps", (0, 0, 0, new List<string>()) },
                { "Forearms", (0, 0, 0, new List<string>()) },
                { "Core", (0, 0, 0, new List<string>()) },
                { "Glutes", (0, 0, 0, new List<string>()) },
                { "Quadriceps", (0, 0, 0, new List<string>()) },
                { "Hamstrings", (0, 0, 0, new List<string>()) },
                { "Calves", (0, 0, 0, new List<string>()) }
            };

            foreach (var w in userWorkouts)
            {
                string ex = (w.Exercise ?? "").ToLowerInvariant();
                string targetGroup = "Core";

                if (ex.Contains("bench") || ex.Contains("chest") || ex.Contains("pushup") || ex.Contains("pec"))
                {
                    targetGroup = "Chest";
                }
                else if (ex.Contains("pull") || ex.Contains("row") || ex.Contains("lat") || ex.Contains("back") || ex.Contains("deadlift"))
                {
                    targetGroup = "Back";
                }
                else if (ex.Contains("shoulder") || ex.Contains("overhead") || ex.Contains("military") || ex.Contains("lateral raise") || ex.Contains("delt"))
                {
                    targetGroup = "Shoulders";
                }
                else if (ex.Contains("bicep") || ex.Contains("curl") || ex.Contains("chin"))
                {
                    targetGroup = "Biceps";
                }
                else if (ex.Contains("tricep") || ex.Contains("dip") || ex.Contains("pushdown") || ex.Contains("skull crusher"))
                {
                    targetGroup = "Triceps";
                }
                else if (ex.Contains("wrist") || ex.Contains("forearm") || ex.Contains("farmer"))
                {
                    targetGroup = "Forearms";
                }
                else if (ex.Contains("squat") || ex.Contains("leg press") || ex.Contains("lunge") || ex.Contains("quad") || ex.Contains("run") || ex.Contains("jog") || ex.Contains("cycle"))
                {
                    targetGroup = "Quadriceps";
                }
                else if (ex.Contains("hamstring") || ex.Contains("rdl") || ex.Contains("romanian"))
                {
                    targetGroup = "Hamstrings";
                }
                else if (ex.Contains("glute") || ex.Contains("hip thrust") || ex.Contains("bridge"))
                {
                    targetGroup = "Glutes";
                }
                else if (ex.Contains("calf") || ex.Contains("calves") || ex.Contains("jump rope"))
                {
                    targetGroup = "Calves";
                }
                else if (ex.Contains("abs") || ex.Contains("plank") || ex.Contains("crunch") || ex.Contains("core"))
                {
                    targetGroup = "Core";
                }

                var curr = groups[targetGroup];
                if (!curr.exercises.Contains(w.Exercise)) curr.exercises.Add(w.Exercise);
                groups[targetGroup] = (curr.count + 1, curr.minutes + w.Duration, curr.calories + w.CaloriesBurned, curr.exercises);
            }

            int totalSessions = groups.Values.Sum(v => v.count);

            var result = groups.Select(g =>
            {
                int count = g.Value.count;
                int contribution = totalSessions > 0 ? (int)Math.Round((count / (double)totalSessions) * 100) : 0;
                string intensity = count >= 4 ? "high" : count >= 2 ? "medium" : count >= 1 ? "low" : "none";

                return new
                {
                    muscleGroup = g.Key,
                    sessionCount = count,
                    trainingContribution = contribution,
                    intensityLevel = intensity,
                    totalMinutes = g.Value.minutes,
                    totalCalories = g.Value.calories,
                    recentExercises = g.Value.exercises.Take(5).ToList()
                };
            }).ToList();

            return Success(result);
        }

        // --- Private Logic & Algorithms ---
        private ScoreResult CalculateScoreForWindow(int userId, DateTime start, DateTime end)
        {
            int workoutCount = db.Workouts.Count(w => w.UserId == userId && w.Date >= start && w.Date < end);
            int workoutMins = db.Workouts.Where(w => w.UserId == userId && w.Date >= start && w.Date < end)
                .Select(w => (int?)w.Duration).DefaultIfEmpty(0).Sum() ?? 0;

            double workoutScore = Math.Min(30.0, (workoutCount * 5.0) + Math.Min(10.0, (workoutMins / 150.0) * 10.0));

            int distinctMealDays = db.MealLogs
                .Where(m => m.UserId == userId && m.Date >= start && m.Date < end)
                .Select(m => m.Date)
                .ToList()
                .Select(d => d.Date)
                .Distinct()
                .Count();
            double nutritionScore = Math.Min(20.0, (distinctMealDays / 5.0) * 20.0);

            int totalWater = db.WaterTntakeLogs.Where(w => w.UserId == userId && w.Date >= start && w.Date < end)
                .Select(w => (int?)w.AmountInMl).DefaultIfEmpty(0).Sum() ?? 0;
            double hydrationScore = Math.Min(20.0, (totalWater / 14000.0) * 20.0);

            var goals = db.SetGoals.Where(g => g.UserId == userId && g.Date >= start && g.Date < end).ToList();
            double goalScore = 0;
            if (goals.Any())
            {
                int completed = goals.Count(g => g.IsCompleted);
                goalScore = Math.Min(15.0, (completed / (double)goals.Count) * 15.0);
            }
            else if (workoutMins >= 30)
            {
                goalScore = 10.0;
            }

            int streak = CalculateStreak(userId);
            double streakScore = Math.Min(10.0, streak * 2.0);

            var latestBmi = db.BMIs.Where(b => b.UserId == userId).OrderByDescending(b => b.Date).FirstOrDefault();
            double bmiPts = latestBmi != null ? 5.0 : 0.0;

            double total = Math.Round(workoutScore + nutritionScore + hydrationScore + goalScore + streakScore + bmiPts);
            total = Math.Max(0.0, Math.Min(100.0, total));

            bool hasData = workoutCount > 0 || distinctMealDays > 0 || totalWater > 0 || latestBmi != null;

            return new ScoreResult
            {
                Score = (int)total,
                WorkoutScore = (int)Math.Round(workoutScore),
                NutritionScore = (int)Math.Round(nutritionScore),
                HydrationScore = (int)Math.Round(hydrationScore),
                GoalScore = (int)Math.Round(goalScore),
                StreakScore = (int)Math.Round(streakScore + bmiPts),
                HasData = hasData
            };
        }

        private int CalculateStreak(int userId)
        {
            var cutoff = DateTime.Today.AddDays(-120);
            var workoutDates = db.Workouts
                .Where(w => w.UserId == userId && w.Date >= cutoff)
                .Select(w => DbFunctions.TruncateTime(w.Date))
                .Distinct()
                .ToList();

            var mealDates = db.MealLogs
                .Where(m => m.UserId == userId && m.Date >= cutoff)
                .Select(m => DbFunctions.TruncateTime(m.Date))
                .Distinct()
                .ToList();

            var activeDays = new HashSet<DateTime>(
                workoutDates.Concat(mealDates)
                    .Where(d => d.HasValue)
                    .Select(d => d.Value.Date)
            );

            int streak = 0;
            DateTime checkDate = DateTime.Today;

            if (!activeDays.Contains(checkDate))
            {
                checkDate = checkDate.AddDays(-1);
            }

            while (activeDays.Contains(checkDate) && streak < 365)
            {
                streak++;
                checkDate = checkDate.AddDays(-1);
            }

            return streak;
        }

        private int CalculateLongestStreak(int userId)
        {
            var workoutDates = db.Workouts.Where(w => w.UserId == userId).Select(w => w.Date).ToList().Select(d => d.Date);
            var mealDates = db.MealLogs.Where(m => m.UserId == userId).Select(m => m.Date).ToList().Select(d => d.Date);
            var activityDates = workoutDates.Concat(mealDates).Distinct().OrderBy(d => d).ToList();

            if (!activityDates.Any()) return 0;

            int maxStreak = 1;
            int current = 1;

            for (int i = 1; i < activityDates.Count; i++)
            {
                if (activityDates[i] == activityDates[i - 1].AddDays(1))
                {
                    current++;
                    if (current > maxStreak) maxStreak = current;
                }
                else if (activityDates[i] != activityDates[i - 1])
                {
                    current = 1;
                }
            }
            return maxStreak;
        }

        private int CalculateTotalActiveDays(int userId)
        {
            var wDates = db.Workouts.Where(w => w.UserId == userId).Select(w => w.Date).ToList().Select(d => d.Date);
            var mDates = db.MealLogs.Where(m => m.UserId == userId).Select(m => m.Date).ToList().Select(d => d.Date);
            var wtDates = db.WaterTntakeLogs.Where(w => w.UserId == userId).Select(w => w.Date).ToList().Select(d => d.Date);
            return wDates.Concat(mDates).Concat(wtDates).Distinct().Count();
        }

        private object GenerateAdaptiveWeeklyPlan(int userId, DateTime today, string bmiCategory, int activeDaysCount, int hydrationConsistency)
        {
            // Monday of current week
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            DateTime monday = today.AddDays(-1 * diff).Date;

            var daysPlan = new List<object>();

            string[] dayNames = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
            string[] focusThemes = {
                "Upper Body & Core Power",
                "Metabolic Cardio Burn",
                "Active Recovery & Mobility",
                "Lower Body Strength",
                "Endurance Conditioning",
                "Functional Full Body",
                "Rest & Restorative Nutrition"
            };

            int[] targetsDuration = { 45, 30, 20, 45, 35, 50, 0 };
            bool[] restFlags = { false, false, true, false, false, false, true };

            for (int i = 0; i < 7; i++)
            {
                DateTime dayDate = monday.AddDays(i);
                DateTime nextDay = dayDate.AddDays(1);

                // Fetch actual logs for this day from DB
                var workoutsOnDay = db.Workouts
                    .Where(w => w.UserId == userId && w.Date >= dayDate && w.Date < nextDay)
                    .Select(w => new { w.Exercise, w.Duration, w.CaloriesBurned })
                    .ToList();

                var mealsOnDay = db.MealLogs
                    .Where(m => m.UserId == userId && m.Date >= dayDate && m.Date < nextDay)
                    .Select(m => new { m.FoodItems, m.Calories, m.MealType })
                    .ToList();

                bool isCompleted = workoutsOnDay.Any() || (restFlags[i] && mealsOnDay.Any());

                daysPlan.Add(new
                {
                    dayName = dayNames[i],
                    date = dayDate.ToString("yyyy-MM-dd"),
                    isToday = dayDate.Date == today.Date,
                    isPast = dayDate.Date < today.Date,
                    isRestDay = restFlags[i],
                    focus = focusThemes[i],
                    targetWorkoutMinutes = targetsDuration[i],
                    targetWaterMl = hydrationConsistency < 50 ? 2750 : 2500,
                    targetCaloriesBurn = restFlags[i] ? 150 : 450,
                    isCompleted = isCompleted,
                    loggedWorkouts = workoutsOnDay,
                    loggedMeals = mealsOnDay
                });
            }

            return new
            {
                weekStart = monday.ToString("yyyy-MM-dd"),
                weekEnd = monday.AddDays(6).ToString("yyyy-MM-dd"),
                bmiCategory = bmiCategory,
                adaptationNote = activeDaysCount < 3 ? "Adaptive Focus: Prioritizing weekly consistency with guided progression." : "Adaptive Focus: High momentum detected! Progression optimized for peak endurance.",
                days = daysPlan
            };
        }
    }
}
