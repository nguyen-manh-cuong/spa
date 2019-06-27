using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using SHCServer.Models;
using System.Security.Claims;
using Viettel;
using Viettel.MySql;

namespace SHCServer
{
    [Produces("application/json")]
    public class BaseController : Controller
    {
        protected static IOptions<Audience> _settings;
        protected DbContext _context;
        protected DbContext _contextmdmdb;
        protected FriendlyException _excep;



        [HttpOptions]
        [Route("*")]
        public IActionResult Get()
        {
            return StatusCode(204);
        }

        public string GetIpClient()
        {
            var remoteIpAddress = "42.115.196.33";
            return remoteIpAddress;
        }
        public int GetCurrentUserId()
        {
            //var claims = (User.Identity as ClaimsIdentity).FindFirst("Uid");
            //return int.Parse(claims.Value);
            return 6;
        }

        public int GetHealthFacilitiesId(DbContext context,int userId)
        {
            var userHealthFacilities = context.Query<UserHealthFacilities>().Where(uh => uh.UserId == userId && uh.IsDefault == true).FirstOrDefault();
            if (userHealthFacilities != null)
            {
                return userHealthFacilities.HealthFacilitiesId;
            }
            return 0;
        }

    }

    public interface IEntity
    {
        int Id { get; set; }
    }
}