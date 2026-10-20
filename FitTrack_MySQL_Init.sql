-- =======================================================
-- FITTRACK DATABASE INITIALIZATION SCRIPT (MySQL 8.0+)
-- Database: FitTrackDB
-- =======================================================

CREATE DATABASE IF NOT EXISTS FitTrackDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE FitTrackDB;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL,
    UserAge INT DEFAULT 25,
    UserGender VARCHAR(20) DEFAULT 'Not Specified',
    UserEmail VARCHAR(150) NOT NULL UNIQUE,
    UserPassword VARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UserImage VARCHAR(255) NULL,
    Height FLOAT DEFAULT 175,
    Weight FLOAT DEFAULT 70,
    Role VARCHAR(50) DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Workouts Table
CREATE TABLE IF NOT EXISTS Workouts (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Exercise VARCHAR(100) NOT NULL,
    ExerciseType VARCHAR(50) DEFAULT 'Cardio',
    Duration INT NOT NULL,
    CaloriesBurned INT NOT NULL,
    Date DATETIME NOT NULL,
    Intensity VARCHAR(50) DEFAULT 'Medium',
    CONSTRAINT FK_Workouts_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. MealLogs Table
CREATE TABLE IF NOT EXISTS MealLogs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    FoodItems VARCHAR(255) NOT NULL,
    Calories INT NOT NULL,
    Date DATETIME NOT NULL,
    MealType VARCHAR(50) NOT NULL, -- 'Breakfast', 'Lunch', 'Dinner', 'Snacks'
    CONSTRAINT FK_MealLogs_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. BMIs Table
CREATE TABLE IF NOT EXISTS BMIs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Height FLOAT NOT NULL,
    Weight FLOAT NOT NULL,
    BMIscore FLOAT NOT NULL,
    HealthStatus VARCHAR(255) NOT NULL,
    Date DATETIME NOT NULL,
    CONSTRAINT FK_BMIs_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. WaterTntakeLogs Table
CREATE TABLE IF NOT EXISTS WaterTntakeLogs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    AmountInMl INT NOT NULL,
    Date DATETIME NOT NULL,
    CONSTRAINT FK_WaterLogs_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. SetGoals Table
CREATE TABLE IF NOT EXISTS SetGoals (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    CalorieGoal INT NOT NULL DEFAULT 2000,
    WorkoutGoal INT NOT NULL DEFAULT 45,
    WaterIntakeGoal INT NOT NULL DEFAULT 2500,
    Date DATETIME NOT NULL,
    IsCompleted TINYINT(1) DEFAULT 0,
    CONSTRAINT FK_Goals_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. DietPlans Table
CREATE TABLE IF NOT EXISTS DietPlans (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PlanName VARCHAR(150) NOT NULL,
    Description TEXT NULL,
    MealType VARCHAR(50) NOT NULL,
    BmiCategory VARCHAR(50) NOT NULL, -- 'Underweight', 'Normal', 'Overweight', 'Obese'
    UserId INT DEFAULT 0,
    Calories INT DEFAULT 0,
    IsActive TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. WorkoutPlans Table
CREATE TABLE IF NOT EXISTS WorkoutPlans (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PlanName VARCHAR(150) NOT NULL,
    Description TEXT NULL,
    IntensityLevel VARCHAR(50) NOT NULL, -- 'Low', 'Medium', 'High'
    BmiCategory VARCHAR(50) NOT NULL,
    UserId INT DEFAULT 0,
    DurationMinutes INT DEFAULT 30,
    IsActive TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. VideoTutorials Table
CREATE TABLE IF NOT EXISTS VideoTutorials (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NULL,
    VideoUrl VARCHAR(255) NOT NULL,
    ThumbnailUrl VARCHAR(255) NULL,
    Category VARCHAR(50) NOT NULL, -- 'Workout', 'Yoga', 'Cardio', 'Diet'
    Duration VARCHAR(50) DEFAULT '15 min'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Achievements Table
CREATE TABLE IF NOT EXISTS Achievements (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    BadgeKey VARCHAR(100) NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NOT NULL,
    Icon VARCHAR(50) NOT NULL,
    UnlockedAt DATETIME NOT NULL,
    CONSTRAINT FK_Achievements_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Title VARCHAR(150) NOT NULL,
    Message TEXT NOT NULL,
    Type VARCHAR(50) DEFAULT 'info',
    IsRead TINYINT(1) DEFAULT 0,
    CreatedAt DATETIME NOT NULL,
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Admins Table
CREATE TABLE IF NOT EXISTS Admins (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =======================================================
-- SEED DATA
-- =======================================================

-- Admin Account: admin@fittrack.com / Admin@123
INSERT INTO Users (UserName, UserAge, UserGender, UserEmail, UserPassword, Role, Height, Weight)
SELECT 'System Administrator', 30, 'Other', 'admin@fittrack.com', 'Admin@123', 'Admin', 178, 74
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE UserEmail = 'admin@fittrack.com');

INSERT INTO Admins (Name, Email, Password)
SELECT 'System Administrator', 'admin@fittrack.com', 'Admin@123'
WHERE NOT EXISTS (SELECT 1 FROM Admins WHERE Email = 'admin@fittrack.com');

-- Sample User: alex@fittrack.com / User@123
INSERT INTO Users (UserName, UserAge, UserGender, UserEmail, UserPassword, Role, Height, Weight)
SELECT 'Alex Mercer', 27, 'Male', 'alex@fittrack.com', 'User@123', 'User', 175, 68
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE UserEmail = 'alex@fittrack.com');

-- Seed Diet Plans
INSERT INTO DietPlans (PlanName, Description, MealType, BmiCategory, Calories, IsActive)
SELECT 'High Protein Fuel Plan', 'Nutrient-rich calorie surplus for healthy muscle gain and weight build-up.', 'Breakfast', 'Underweight', 650, 1
WHERE NOT EXISTS (SELECT 1 FROM DietPlans WHERE PlanName = 'High Protein Fuel Plan');

INSERT INTO DietPlans (PlanName, Description, MealType, BmiCategory, Calories, IsActive)
SELECT 'Balanced Mediterranean Diet', 'Optimal balance of lean proteins, whole grains, and healthy monounsaturated fats.', 'Lunch', 'Normal', 550, 1
WHERE NOT EXISTS (SELECT 1 FROM DietPlans WHERE PlanName = 'Balanced Mediterranean Diet');

INSERT INTO DietPlans (PlanName, Description, MealType, BmiCategory, Calories, IsActive)
SELECT 'Caloric Deficit Lean Fuel', 'Low glycemic meals designed for steady fat burn without losing lean muscle mass.', 'Dinner', 'Overweight', 450, 1
WHERE NOT EXISTS (SELECT 1 FROM DietPlans WHERE PlanName = 'Caloric Deficit Lean Fuel');

INSERT INTO DietPlans (PlanName, Description, MealType, BmiCategory, Calories, IsActive)
SELECT 'Metabolic Reset & Fiber Rich Plan', 'Wholesome plant-rich nutrition formulated for sustained metabolism and glucose regulation.', 'Breakfast', 'Obese', 380, 1
WHERE NOT EXISTS (SELECT 1 FROM DietPlans WHERE PlanName = 'Metabolic Reset & Fiber Rich Plan');

-- Seed Workout Plans
INSERT INTO WorkoutPlans (PlanName, Description, IntensityLevel, BmiCategory, DurationMinutes, IsActive)
SELECT 'Hypertrophy & Strength Foundations', 'Progressive overload lifting focusing on compound movements for muscle development.', 'Medium', 'Underweight', 45, 1
WHERE NOT EXISTS (SELECT 1 FROM WorkoutPlans WHERE PlanName = 'Hypertrophy & Strength Foundations');

INSERT INTO WorkoutPlans (PlanName, Description, IntensityLevel, BmiCategory, DurationMinutes, IsActive)
SELECT 'Total Fitness & Conditioning', 'Dynamic mix of HIIT, functional resistance, and core conditioning.', 'High', 'Normal', 50, 1
WHERE NOT EXISTS (SELECT 1 FROM WorkoutPlans WHERE PlanName = 'Total Fitness & Conditioning');

INSERT INTO WorkoutPlans (PlanName, Description, IntensityLevel, BmiCategory, DurationMinutes, IsActive)
SELECT 'Fat Burn & Metabolic Circuit', 'Interval circuit training targeting elevated heart rate and sustained fat oxidation.', 'Medium', 'Overweight', 40, 1
WHERE NOT EXISTS (SELECT 1 FROM WorkoutPlans WHERE PlanName = 'Fat Burn & Metabolic Circuit');

INSERT INTO WorkoutPlans (PlanName, Description, IntensityLevel, BmiCategory, DurationMinutes, IsActive)
SELECT 'Low-Impact Mobility & Cardio', 'Joint-friendly functional mobility and gentle steady-state cardio.', 'Low', 'Obese', 30, 1
WHERE NOT EXISTS (SELECT 1 FROM WorkoutPlans WHERE PlanName = 'Low-Impact Mobility & Cardio');

-- Seed Video Tutorials
INSERT INTO VideoTutorials (Title, Description, VideoUrl, ThumbnailUrl, Category, Duration)
SELECT 'Full Body HIIT Blast', 'High-intensity interval training for explosive power and maximum calorie burn.', 'https://www.youtube.com/watch?v=ml6cT4AZdqI', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop', 'Workout', '20 min'
WHERE NOT EXISTS (SELECT 1 FROM VideoTutorials WHERE Title = 'Full Body HIIT Blast');

INSERT INTO VideoTutorials (Title, Description, VideoUrl, ThumbnailUrl, Category, Duration)
SELECT 'Morning Vinyasa Flow', 'Energizing yoga flow to increase flexibility, core stability, and mental clarity.', 'https://www.youtube.com/watch?v=sTANio_2E0Q', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop', 'Yoga', '15 min'
WHERE NOT EXISTS (SELECT 1 FROM VideoTutorials WHERE Title = 'Morning Vinyasa Flow');

INSERT INTO VideoTutorials (Title, Description, VideoUrl, ThumbnailUrl, Category, Duration)
SELECT 'Fat-Burning Cardio Endurance', 'Sustained rhythm cardio workout to boost VO2 max and elevate daily energy.', 'https://www.youtube.com/watch?v=gC_L9qAHVJ8', 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=600&auto=format&fit=crop', 'Cardio', '25 min'
WHERE NOT EXISTS (SELECT 1 FROM VideoTutorials WHERE Title = 'Fat-Burning Cardio Endurance');

INSERT INTO VideoTutorials (Title, Description, VideoUrl, ThumbnailUrl, Category, Duration)
SELECT 'Meal Prep Masterclass for Fitness', 'Learn how to batch prep high-protein, calorie-accurate meals in under 60 minutes.', 'https://www.youtube.com/watch?v=1uU_rR9242E', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop', 'Diet', '18 min'
WHERE NOT EXISTS (SELECT 1 FROM VideoTutorials WHERE Title = 'Meal Prep Masterclass for Fitness');
