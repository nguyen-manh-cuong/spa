using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using SHCServer.Models;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class LogController : BaseController
    {
        public LogController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _contextmdmdb = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
        }
        [HttpPost]
        [Route("api/log")]
        public void Create([FromBody]Log obj)
        {
            obj.EvenDate = DateTime.Now;
            obj.Duration = DateTime.Now;
            obj.IpAddress = GetIpClient();
            obj.UserId = GetCurrentUserId();
            obj.HealthFacilitiesId = GetHealthFacilitiesId(_contextmdmdb,GetCurrentUserId());

            try
            {
                _contextmdmdb.Session.BeginTransaction();

                _contextmdmdb.Insert(obj);

                _contextmdmdb.Session.CommitTransaction();
            }
            catch
            {
                if (_context.Session.IsInTransaction)
                {
                    _context.Session.RollbackTransaction();
                }
            }
        }
    }
}