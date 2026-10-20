using System.Data.Entity;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class WaterIntakeLogDB : DbContext
    {
        public WaterIntakeLogDB() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<WaterIntakeLogDB>(null);
        }

        public virtual DbSet<WaterTntakeLog> WaterTntakeLogs { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<WaterTntakeLog>().ToTable("WaterTntakeLogs").HasKey(w => w.Id);
        }
    }
}