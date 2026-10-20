using System;
using System.Linq;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class TutorialsApiController : ApiControllerBase
    {
        [HttpGet]
        public ActionResult Get(string category = null, string search = null)
        {
            var query = db.VideoTutorials.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(v => v.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.ToLower();
                query = query.Where(v => v.Title.ToLower().Contains(s) || (v.Description != null && v.Description.ToLower().Contains(s)));
            }

            var tutorials = query
                .OrderBy(v => v.Id)
                .ToList()
                .Select(v => new
                {
                    id = v.Id,
                    title = v.Title,
                    description = v.Description,
                    videoUrl = v.VideoUrl,
                    thumbnailUrl = v.ThumbnailUrl,
                    category = v.Category,
                    duration = v.Duration
                });

            return Success(tutorials);
        }
    }
}
