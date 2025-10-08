using Microsoft.AspNetCore.Mvc;

namespace JetBench.Api.Controllers
{
    public class EnginesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
