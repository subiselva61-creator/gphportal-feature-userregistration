using Amazon.Runtime.Internal.Util;
using Ghp.Portal.Service.Models;
using Ghp.Portal.Service.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ghp.Portal.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UsersService _userservice;
        private readonly JwtService jwtService;
        private readonly ILogger<AuthController> logger;

        public AuthController(UsersService UsersService, JwtService jwtService, ILogger<AuthController> logger)
        {
            _userservice = UsersService;
            this.jwtService = jwtService;
            this.logger = logger;
        }

        [HttpGet]
        [Route("user")]
        public ActionResult<List<User>> Get(string name)
        {
            logger.LogInformation("Get user by name: " + name);
            var users = _userservice.Get(name);
            logger.LogInformation("Found " + users.Count + " users");
            return users;
        }

        [HttpPost]
        [Route("signup")]
        public ActionResult<bool> Create(User user)
        {
            try
            {
                if (user?.Roles == null || user.Roles.Length == 0)
                {
                    user.Roles = new string[] { "USER" };
                }
                var createdUser = _userservice.Create(user);
                if (createdUser == null)
                {
                    return NoContent();
                }
                return Ok(true);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Route("signin")]
        public ActionResult<User> Signin(User User)
        {
            var user = _userservice.GetByEmail(User.Email);
            if (user == null || user.Password != User.Password)
            {
                return NotFound();
            }
            return Ok(new UserViewModal(user, jwtService));
        }

        [HttpPut("{id:length(24)}")]
        public IActionResult Update(string id, User UserIn)
        {
            var user = _userservice.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            _userservice.Update(id, UserIn);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public IActionResult Delete(string id)
        {
            var user = _userservice.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            _userservice.Delete(user);

            return NoContent();
        }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ProjectsService _projectsService;
        private readonly JwtService jwtService;

        public PaymentController(ProjectsService projectsService, JwtService jwtService)
        {
            _projectsService = projectsService;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [Route("process")]
        public ActionResult<List<Project>> Process(object token)
        {
            return Ok();
        }

    }
}