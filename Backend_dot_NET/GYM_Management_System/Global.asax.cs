using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace GYM_Management_System
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var origin = HttpContext.Current.Request.Headers["Origin"];

            // Allow Vite frontend origins during development
            if (!string.IsNullOrEmpty(origin) && 
               (origin.StartsWith("http://localhost:") || origin.StartsWith("https://localhost:") || origin.StartsWith("http://127.0.0.1:")))
            {
                HttpContext.Current.Response.Headers.Remove("Access-Control-Allow-Origin");
                HttpContext.Current.Response.Headers.Remove("Access-Control-Allow-Credentials");
                HttpContext.Current.Response.Headers.Remove("Access-Control-Allow-Headers");
                HttpContext.Current.Response.Headers.Remove("Access-Control-Allow-Methods");

                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", origin);
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Credentials", "true");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, Authorization");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            }

            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                HttpContext.Current.Response.StatusCode = 200;
                HttpContext.Current.Response.End();
            }
        }

        protected void Application_EndRequest(object sender, EventArgs e)
        {
            if (Response.Cookies.Count > 0)
            {
                foreach (string sCookie in Response.Cookies)
                {
                    var cookie = Response.Cookies[sCookie];
                    cookie.SameSite = SameSiteMode.None;
                    cookie.Secure = true;
                }
            }
        }
    }
}
