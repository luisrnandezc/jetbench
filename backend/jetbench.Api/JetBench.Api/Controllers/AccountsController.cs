using Microsoft.AspNetCore.Mvc;

namespace JetBench.Api.Controllers
{
    public class AccountsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
