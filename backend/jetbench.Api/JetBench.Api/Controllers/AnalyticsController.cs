using Microsoft.AspNetCore.Mvc;

namespace JetBench.Api.Controllers
{
    public class AnalyticsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
