using System.Data.Entity;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class AdminDb : DbContext
    {
        public AdminDb() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<AdminDb>(null);
        }

        public virtual DbSet<Admin> Admins { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Admin>().ToTable("Admins").HasKey(a => a.Id);
        }
    }
}