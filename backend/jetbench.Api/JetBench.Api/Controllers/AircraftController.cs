using Microsoft.AspNetCore.Mvc;

namespace JetBench.Api.Controllers
{
    public class AircraftController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
