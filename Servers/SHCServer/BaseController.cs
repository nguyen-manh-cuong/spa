using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Viettel;
using Viettel.MySql;

namespace SHCServer
{
    [Produces("application/json")]
    public class BaseController : Controller
    {
        protected static IOptions<Audience> _settings;
        protected DbContext _context;
        protected FriendlyException _excep;


        [HttpOptions]
        [Route("*")]
        public IActionResult Get()
        {
            return StatusCode(204);
        }
    }

    public interface IEntity
    {
        int Id { get; set; }
    }
}