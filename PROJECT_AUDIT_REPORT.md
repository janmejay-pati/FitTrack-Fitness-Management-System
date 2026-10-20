# FitTrack Project Audit Report

## Executive Summary
This report presents a comprehensive full-stack audit of the **FitTrack Fitness Management System** backend (.NET Framework 4.7.2 / ASP.NET MVC 5 / Entity Framework 6.4.4 / MySQL) and its interaction with the Razor web application and React API consumers.

---

## 1. Actual Errors & Runtime Bugs Discovered

### 1.1 Critical NullReferenceException in WorkoutsController & MealController
- **File**: `Backend_dot_NET/GYM_Management_System/Controllers/WorkoutsController.cs` (Line 97)
  ```csharp
  // BUG: workout.UserId is evaluated before checking if workout == null
  if (workout.UserId != Convert.ToInt32(Session["UserId"].ToString()) || workout == null)
  ```
  If `db.Workouts.Find(id)` returns `null`, accessing `workout.UserId` immediately throws an unhandled `NullReferenceException` (HTTP 500) rather than returning HTTP 404.
- **File**: `Backend_dot_NET/GYM_Management_System/Controllers/MealController.cs` (Line 88)
  ```csharp
  // BUG: Exact same inverted null-check
  if (meal.UserId != Convert.ToInt32(Session["UserId"].ToString()) || meal == null)
  ```
- **File**: `Backend_dot_NET/GYM_Management_System/Controllers/MealController.cs` (Line 137)
  ```csharp
  public ActionResult Delete(int id)
  {
      int userId = int.Parse(Session["userId"].ToString()); // BUG: Throws if Session["userId"] is null!
      if (Session["UserId"] == null)
      {
          return RedirectToAction("Login", "Users");
      }
  ```
  `int.Parse(...)` is executed before the session null check, crashing with `NullReferenceException` when an unauthenticated user accesses the route.

### 1.2 Flawed BMI Calculation in Razor Controller (BMIController.cs)
- **File**: `Backend_dot_NET/GYM_Management_System/Controllers/BMIController.cs` (Lines 42-45)
  ```csharp
  float height = bmi.Height; // Entered in cm (e.g. 175)
  float weight = bmi.Weight; // Entered in kg (e.g. 70)
  float bmiValue = weight / (height * height); // 70 / (175 * 175) = 0.00228
  ```
  `BMIController` fails to convert centimeters to meters (`height > 3 ? height / 100f : height`), causing any height in centimeters to compute an absurd BMI value like `0.002` and misclassify the user as severely underweight.

### 1.3 Broken Date Sargability in DailyDashboard & Meal Index
- **Files**:
  - `Controllers/HomeController.cs` (Lines 85-87)
  - `Controllers/MealController.cs` (Line 33)
  - `Controllers/WorkoutsController.cs` (Line 34)
  ```csharp
  var todyMeal = db.MealLogs.Where(model => model.UserId == userId && model.Date == today)...
  ```
  In MySQL, `Date` is stored as a `DATETIME` (`2026-10-20 14:30:00`). Comparing `m.Date == today` (where `today = DateTime.Today` with midnight time `00:00:00`) evaluates to `false` for any record logged with `DateTime.Now`. Consequently, today's logged meals and workouts vanish from daily progress.

### 1.4 Broken Navigation Link in Shared Layout
- **File**: `Views/Shared/_Layout.cshtml` (Line 171)
  ```html
  <li><a href="/Users/Profile"><i class="fas fa-user-circle"></i> Profile</a></li>
  ```
  In `UsersController.cs`, the action method is named `UserProfile`, not `Profile`. Clicking "Profile" results in an HTTP 404 error.

### 1.5 Missing User Authorization in Delete Operations
- **File**: `Controllers/WorkoutsController.cs` (Line 145)
  `DeleteConfirmed(int id)` removes the workout matching `id` without verifying that `workout.UserId == CurrentUserId`. A logged-in user can delete any other user's workout by submitting a POST request with their ID.

---

## 2. Database & Entity Framework Problems

### 2.1 Sprawl of Redundant DbContext Classes
The codebase contains 8 redundant DbContext classes:
- `FitTrackDbContext.cs` (Master DbContext containing all 12 tables)
- `WaterIntakeLogDB.cs`
- `SetGoalDB.cs`
- `BMImodelDb.cs`
- `AdminDb.cs`
- `VideoTutorialsDB.cs`
- Legacy EDMX partial contexts (`MealLog.Context.cs`, `Users_Table.Context.cs`, `Work_Out.Context.cs`)

Controllers like `MealController`, `BMIController`, `AdminController`, and `VideoController` instantiate multiple separate DbContext instances per request, preventing connection reuse and disabling unified transactions.

### 2.2 Legacy SQL Server Connection Strings in Web.config
- **File**: `Web.config` (Lines 94-102)
  Contains 9 defunct connection strings pointing to a local machine SQL Server (`LAPTOP-SK0EI9HT\SQLEXPRESS`). While `FitTrackDbContext` correctly targets `FitTrackEntities`, the legacy strings create confusion and maintain orphaned provider registrations.

### 2.3 Unmanaged DbContext Disposals
`HomeController`, `DashboardController`, `WorkoutsController`, `MealController`, `BMIController`, `PlanSuggestionController`, `VideoController`, and `AdminController` declare `DbContext` fields without implementing `Dispose(bool disposing)`, causing connection pool leakage under heavy traffic.

---

## 3. Performance & Bottlenecks (N+1 Query Storms)

### 3.1 Unbounded `while(true)` Query Storm in DashboardApiController
- **File**: `Controllers/DashboardApiController.cs` (Lines 197-219)
  `CalculateStreak(userId)` executes a `while(true)` loop that issues **two SQL queries per past day**:
  ```csharp
  bool hadActivity = db.Workouts.Any(w => w.UserId == userId && w.Date >= checkDate && w.Date < nextDate) ||
                     db.MealLogs.Any(m => m.UserId == userId && m.Date >= checkDate && m.Date < nextDate);
  ```
  For a 90-day streak, this single API call bombards MySQL with 180 roundtrip queries.

### 3.2 Quadruple Query Storm in FitnessApiController
- **File**: `Controllers/FitnessApiController.cs`
  `GetIntelligence()` calls `CalculateScoreForWindow` twice (each executing `CalculateStreak`), calls `CalculateStreak` a 3rd time, and then calls `CalculateLongestStreak` and `CalculateTotalActiveDays` with full-table in-memory scans.

### 3.3 Loop Queries in WaterApiController
- **File**: `Controllers/WaterApiController.cs` (Lines 62-79)
  `GetHistory()` executes a `for` loop issuing 7 sequential SQL queries to compute daily sums instead of a single grouped or range-filtered query.

### 3.4 In-Memory Filtering After Eager `.ToList()`
- In `WorkoutsController.Index`, `MealController.Index`, and `DashboardController.Index`, `.ToList()` is called immediately on user records, pulling thousands of rows into memory before performing `.Where()`, `.OrderBy()`, and `.Take()`.
- Lack of `.AsNoTracking()` forces Entity Framework to attach and track all loaded entities in memory even for read-only rendering.

---

## 4. Authentication, Session & Security Problems

### 4.1 Inconsistent Admin Authentication
- `AdminController.AdminLogin` queries only `db.Admins` with plain-text password matching (`admin.Password == model.Password`).
- `UsersController.AdminLogin` queries both `db.Users` (where `Role == 'Admin'` with PBKDF2 hashing) and `db.Admins`.
- Admin accounts created or seeded in `Users` cannot log into the MVC Razor admin portal, and passwords stored via `AdminController.Create` are unhashed.

### 4.2 Missing Anti-Forgery Tokens
Several POST endpoints lack `[ValidateAntiForgeryToken]` and corresponding `@Html.AntiForgeryToken()` tags in Razor views:
- `UsersController.Register`
- `UsersController.Login`
- `MealController.Delete`
- `BMIController.Create`
- `AdminController.AdminLogin`

### 4.3 Intrusive JavaScript Alerts via TempData
Controllers repeatedly return `TempData["Msg"] = "<script>alert('...')</script>"`. Injecting raw script strings into Razor views violates modern security best practices (CSP) and degrades the user experience.

---

## 5. Razor Views UI/UX Deficiencies

1. **`_Layout.cshtml`**: Outdated inline gradient navbar, broken Profile link, missing active state indicators, duplicate jQuery script imports, lack of responsive mobile menu.
2. **`Dashboard/Index.cshtml` & `Home/DailyDashboard.cshtml`**: Inconsistent layouts, inline styles, lack of modern metric cards, progress indicators, or empty states.
3. **Forms across Workouts, Meals, BMI, and Goals**: Inconsistent table formatting, no client-side validation triggers, lack of Bootstrap 5 modern form controls, absence of delete confirmation modals.

---

## 6. Recommended Action Plan

1. **Fix Critical Bugs**:
   - Invert null-checks in `WorkoutsController.cs` and `MealController.cs`.
   - Correct height unit conversion in `BMIController.cs`.
   - Update date range queries to sargable `m.Date >= today && m.Date < tomorrow`.
   - Add alias / action redirection for `/Users/Profile`.
   - Enforce user authorization on all Delete / Edit operations.

2. **Consolidate DbContext & Enable Async**:
   - Retain `FitTrackDbContext` as the single unified DbContext across all controllers.
   - Implement `Dispose` pattern on all controllers.
   - Convert database access to `async/await` (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`).
   - Add `.AsNoTracking()` to all read-only queries.

3. **Eliminate Performance Bottlenecks**:
   - Replace `CalculateStreak` `while(true)` query loops with a single query fetching distinct activity dates.
   - Replace `WaterApiController.GetHistory` 7-query loop with a single range query.
   - Push pagination (`.Take(x)`) and ordering down to SQL.

4. **Security & Validation Hardening**:
   - Unify Admin authentication to verify both `Users` (Role='Admin') and `Admins` with PBKDF2 hashing.
   - Apply `[ValidateAntiForgeryToken]` to all form POST actions.
   - Add comprehensive DataAnnotations to models and view models.
   - Replace `<script>alert</script>` with modern Bootstrap alert components.

5. **Modernize Razor Views**:
   - Redesign `_Layout.cshtml` with a clean modern fitness navigation bar, user avatar, and responsive styling.
   - Modernize views for Dashboard, Workouts, Meals, BMI, Goals, and Videos with cards, badges, and clean tables.
