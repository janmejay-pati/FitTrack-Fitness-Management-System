using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class SuggestionDB : DbContext
    {
        public SuggestionDB() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<SuggestionDB>(null);
        }

        public virtual DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public virtual DbSet<DietPlan> DietPlans { get; set; }
        public virtual DbSet<Suggestion> Suggestions { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<WorkoutPlan>().ToTable("workoutplans").HasKey(w => w.Id);
            modelBuilder.Entity<DietPlan>().ToTable("dietplans").HasKey(d => d.Id);
            modelBuilder.Entity<Suggestion>().ToTable("suggestions").HasKey(s => s.Id);
        }
    }
}