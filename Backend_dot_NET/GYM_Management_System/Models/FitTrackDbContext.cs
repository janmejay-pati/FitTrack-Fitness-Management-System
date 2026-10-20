using System.Data.Entity;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class FitTrackDbContext : DbContext
    {
        public FitTrackDbContext() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<FitTrackDbContext>(null);
        }

        public virtual DbSet<Users_Table> Users { get; set; }
        public virtual DbSet<Workout> Workouts { get; set; }
        public virtual DbSet<MealLog> MealLogs { get; set; }
        public virtual DbSet<BMImodel> BMIs { get; set; }
        public virtual DbSet<WaterTntakeLog> WaterTntakeLogs { get; set; }
        public virtual DbSet<SetGoal> SetGoals { get; set; }
        public virtual DbSet<DietPlan> DietPlans { get; set; }
        public virtual DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public virtual DbSet<VideoTutorials> VideoTutorials { get; set; }
        public virtual DbSet<Admin> Admins { get; set; }
        public virtual DbSet<Achievement> Achievements { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Users_Table>().ToTable("Users").HasKey(u => u.UserId);
            modelBuilder.Entity<Workout>().ToTable("Workouts").HasKey(w => w.Id);
            modelBuilder.Entity<MealLog>().ToTable("MealLogs").HasKey(m => m.Id);
            modelBuilder.Entity<BMImodel>().ToTable("BMIs").HasKey(b => b.Id);
            modelBuilder.Entity<WaterTntakeLog>().ToTable("WaterTntakeLogs").HasKey(w => w.Id);
            modelBuilder.Entity<SetGoal>().ToTable("SetGoals").HasKey(g => g.Id);
            modelBuilder.Entity<DietPlan>().ToTable("DietPlans").HasKey(d => d.Id);
            modelBuilder.Entity<WorkoutPlan>().ToTable("WorkoutPlans").HasKey(w => w.Id);
            modelBuilder.Entity<VideoTutorials>().ToTable("VideoTutorials").HasKey(v => v.Id);
            modelBuilder.Entity<Admin>().ToTable("Admins").HasKey(a => a.Id);
            modelBuilder.Entity<Achievement>().ToTable("Achievements").HasKey(a => a.Id);
            modelBuilder.Entity<Notification>().ToTable("Notifications").HasKey(n => n.Id);
        }
    }
}
