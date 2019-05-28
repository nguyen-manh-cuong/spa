using System;
using System.Collections.Generic;
using SHCServer.Models;
using SHCServer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viettel;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class UsersHealthFacilitiesController : BaseController
    {
        private readonly string _connectionString;
        public UsersHealthFacilitiesController(IOptions<Audience> setting, IConfiguration configuration)
        {
            _settings = setting;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/usershealthfacilities")]
        public IActionResult GetHealthFacilitiesForUser(string filter = null)
        {
            var objs = _context
                .JoinQuery<UserHealthFacilities, HealthFacilities>((uh, h) => new object[] { JoinType.InnerJoin, uh.HealthFacilitiesId == h.HealthFacilitiesId })
                .Where((uh, h) => uh.IsDelete == false);

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "userId"))
                    {
                        objs = objs.Where((uh, h) => uh.UserId == int.Parse(value));
                    }
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.Select((uh, u) => new UserHealthfacilitiesViewModel(uh, u)).ToList() }});
        }

        [HttpPut]
        [Route("api/usershealthfacilities")]
        public IActionResult Update([FromBody] UserHealthfacilitiesInputViewModel userHealthfacilitiesInput)
        {
            try
            {
                _context.Session.BeginTransaction();

                if(userHealthfacilitiesInput.healthFacilitiesIdOld != null)
                {
                    _context.Update<UserHealthFacilities>(uh => uh.UserId == userHealthfacilitiesInput.UserId && uh.HealthFacilitiesId == userHealthfacilitiesInput.healthFacilitiesIdOld,
                    a => new UserHealthFacilities
                    {
                        IsDefault = false
                    });
                }

                _context.Update<UserHealthFacilities>(uh => uh.UserId == userHealthfacilitiesInput.UserId && uh.HealthFacilitiesId == userHealthfacilitiesInput.HealthFacilitiesId, 
                    a => new UserHealthFacilities
                    {
                        IsDefault = true
                    });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction) _context.Session.RollbackTransaction();
                return Json(new ActionResultDto { Error = e.Message });
            }
        }
    }
}