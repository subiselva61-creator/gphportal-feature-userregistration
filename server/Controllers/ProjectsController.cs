using Microsoft.AspNetCore.Mvc;
using Ghp.Portal.Service.Services;
using Ghp.Portal.Service.Models;
using System.Text.Json;
using System;
using System.Collections.Generic;

namespace Ghp.Portal.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectsService _projectsService;

        public ProjectsController(ProjectsService projectsService)
        {
            _projectsService = projectsService;
        }

        [HttpGet]
        public IActionResult Get([FromQuery] string search)
        {
            // client sometimes sends plain text or encoded JSON; ensure we pass through raw value
            var q = string.IsNullOrEmpty(search) ? null : Uri.UnescapeDataString(search);
            var result = _projectsService.Get(q);
            return Ok(result);
        }

        [HttpGet("byIds")]
        public IActionResult GetByIds([FromQuery] string ids)
        {
            if (string.IsNullOrEmpty(ids)) return Ok(new List<Project>());
            try
            {
                var idsArray = JsonSerializer.Deserialize<string[]>(ids);
                var res = _projectsService.GetByIds(idsArray);
                return Ok(res);
            }
            catch
            {
                return BadRequest("Invalid ids parameter");
            }
        }

        [HttpGet("Filters")]
        public IActionResult GetFilters()
        {
            var filters = _projectsService.GetFilters();
            return Ok(filters ?? new ProjectFilter());
        }
    }
}
