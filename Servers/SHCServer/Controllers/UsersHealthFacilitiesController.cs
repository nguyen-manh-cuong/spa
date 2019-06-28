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
        private string nameData;
        public UsersHealthFacilitiesController(IOptions<Audience> setting, IConfiguration configuration)
        {
            _settings = setting;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(_connectionString));
            _excep = new FriendlyException();

            if (_connectionString.IndexOf("smarthealthcare_58") > 0) nameData = "smarthealthcare_58";
            else if (_connectionString.IndexOf("smarthealthcare") > 0) nameData = "smarthealthcare";
        }

        [HttpGet]
        [Route("api/usershealthfacilities")]
        public IActionResult GetHealthFacilitiesForUser(string filter = null)
        {
            string query = @"select *
                                from " + nameData + @".sys_users_healthfacilities uh
                                inner join " + nameData + @".cats_healthfacilities h on uh.HealthFacilitiesId = h.HealthFacilitiesId";
            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();
            List<UserHealthfacilitiesViewModel> lst = new List<UserHealthfacilitiesViewModel>();

            //var objs = _context
            //    .JoinQuery<UserHealthFacilities, HealthFacilities>((uh, h) => new object[] { JoinType.InnerJoin, uh.HealthFacilitiesId == h.HealthFacilitiesId })
            //    .Where((uh, h) => uh.IsDelete == false);

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "userId"))
                    {
                        //objs = objs.Where((uh, h) => uh.UserId == int.Parse(value));
                        clause.Add("and uh.UserId = @userId");
                        param.Add(DbParam.Create("@userId", int.Parse(value)));
                    }
                }
            }

            clause.Add("where uh.IsDelete = 0 group by h.Code");
            var str = $"{query} {string.Join(" ", clause)}";
            var reader = _context.Session.ExecuteReader($"{query} {string.Join(" ", clause)}", param);

            while (reader.Read())
            {
                lst.Add(new UserHealthfacilitiesViewModel()
                {
                    Code = reader["Code"].ToString(),
                    HealthFacilitiesId = Convert.ToInt32(reader["HealthFacilitiesId"]),
                    Name = reader["Name"].ToString(),
                    IsDefault = Convert.ToBoolean(reader["IsDefault"]),
                    Address = reader["Address"].ToString(),
                });
            }
            //objs.Select((uh, u) => new UserHealthfacilitiesViewModel(uh, u)).Distinct().ToList() 
            return Json(new ActionResultDto { Result = new { Items = lst}});
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