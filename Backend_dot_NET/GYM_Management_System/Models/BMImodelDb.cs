using System.Data.Entity;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class BMImodelDb : DbContext
    {
        public BMImodelDb() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<BMImodelDb>(null);
        }

        public virtual DbSet<BMImodel> BMIs { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<BMImodel>().ToTable("BMIs").HasKey(b => b.Id);
        }
    }
}