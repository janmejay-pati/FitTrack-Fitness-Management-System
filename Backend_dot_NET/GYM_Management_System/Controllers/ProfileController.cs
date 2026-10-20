using System;
using System.IO;
using System.Web;
using System.Web.Mvc;
using GYM_Management_System.Models;

namespace GYM_Management_System.Controllers
{
    public class ProfileController : ApiControllerBase
    {
        public class UpdateProfileDto
        {
            public string Name { get; set; }
            public int? Age { get; set; }
            public string Gender { get; set; }
            public float? Height { get; set; }
            public float? Weight { get; set; }
        }

        [HttpGet]
        public ActionResult Get()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();

            var user = db.Users.Find(CurrentUserId.Value);
            if (user == null) return NotFoundResponse();

            return Success(new
            {
                userId = user.UserId,
                name = user.UserName,
                email = user.UserEmail,
                role = user.Role,
                age = user.UserAge,
                gender = user.UserGender,
                height = user.Height,
                weight = user.Weight,
                avatar = user.UserImage,
                createdAt = user.CreatedAt
            });
        }

        [HttpPost]
        public ActionResult Update(UpdateProfileDto model)
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();
            if (model == null) return Fail("Invalid payload");

            var user = db.Users.Find(CurrentUserId.Value);
            if (user == null) return NotFoundResponse();

            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                user.UserName = model.Name.Trim();
                Session["Name"] = user.UserName;
            }

            if (model.Age.HasValue && model.Age > 0 && model.Age < 130)
            {
                user.UserAge = model.Age.Value;
            }

            if (!string.IsNullOrWhiteSpace(model.Gender))
            {
                user.UserGender = model.Gender.Trim();
            }

            if (model.Height.HasValue && model.Height > 0)
            {
                user.Height = model.Height.Value;
            }

            if (model.Weight.HasValue && model.Weight > 0)
            {
                user.Weight = model.Weight.Value;
            }

            db.SaveChanges();

            return Success(new
            {
                userId = user.UserId,
                name = user.UserName,
                email = user.UserEmail,
                role = user.Role,
                age = user.UserAge,
                gender = user.UserGender,
                height = user.Height,
                weight = user.Weight,
                avatar = user.UserImage
            }, "Profile updated successfully");
        }

        [HttpPost]
        public ActionResult UploadImage()
        {
            if (!CurrentUserId.HasValue) return UnauthorizedResponse();

            if (Request.Files.Count == 0 || Request.Files[0] == null || Request.Files[0].ContentLength == 0)
            {
                return Fail("No file uploaded");
            }

            var file = Request.Files[0];

            // Validate file size (max 5MB)
            if (file.ContentLength > 5 * 1024 * 1024)
            {
                return Fail("Image size cannot exceed 5MB");
            }

            // Validate extension
            string ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp")
            {
                return Fail("Only JPG, PNG, and WebP images are permitted");
            }

            try
            {
                string uploadFolder = Server.MapPath("~/Images/Uploads/");
                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                string safeName = $"{Guid.NewGuid():N}{ext}";
                string savePath = Path.Combine(uploadFolder, safeName);
                file.SaveAs(savePath);

                string relativeUrl = $"/Images/Uploads/{safeName}";

                var user = db.Users.Find(CurrentUserId.Value);
                if (user != null)
                {
                    user.UserImage = relativeUrl;
                    db.SaveChanges();
                }

                return Success(new { imageUrl = relativeUrl }, "Image uploaded successfully");
            }
            catch (Exception ex)
            {
                return Fail("Upload failed: " + ex.Message, 500);
            }
        }
    }
}
