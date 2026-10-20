using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using MySql.Data.EntityFramework;

namespace GYM_Management_System.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class VideoTutorialsDB : DbContext
    {
        public VideoTutorialsDB() : base("name=FitTrackEntities")
        {
            Database.SetInitializer<VideoTutorialsDB>(null);
        }

        public virtual DbSet<VideoTutorials> VideoTutorials { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<VideoTutorials>().ToTable("videotutorials").HasKey(v => v.Id);
        }
    }
}