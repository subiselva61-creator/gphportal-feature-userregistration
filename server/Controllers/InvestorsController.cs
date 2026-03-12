using Microsoft.AspNetCore.Mvc;
using Ghp.Portal.Service.Services;
using System;
using System.Threading.Tasks;

namespace Ghp.Portal.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvestorsController : ControllerBase
    {
        private readonly InvestorsService _investorsService;

        public InvestorsController(InvestorsService investorsService)
        {
            _investorsService = investorsService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string search)
        {
            var q = string.IsNullOrEmpty(search) ? null : Uri.UnescapeDataString(search);
            var res = await _investorsService.Get(q);
            return Ok(res);
        }

        [HttpGet("searchInvestorByGeography")]
        public async Task<IActionResult> SearchByGeography([FromQuery] string geography)
        {
            var q = string.IsNullOrEmpty(geography) ? "" : Uri.UnescapeDataString(geography);
            var res = await _investorsService.GetByGeography(q);
            return Ok(res);
        }
    }
}
