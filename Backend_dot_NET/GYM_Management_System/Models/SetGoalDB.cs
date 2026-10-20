using System.Data.Entity;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class SetGoalDB : DbContext
    {
        public SetGoalDB() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<SetGoalDB>(null);
        }

        public DbSet<SetGoal> SetGoals { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<SetGoal>().ToTable("SetGoals").HasKey(g => g.Id);
        }
    }
}