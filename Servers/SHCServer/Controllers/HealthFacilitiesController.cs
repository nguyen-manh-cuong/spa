using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer.Models;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class HealthFacilitiesController : BaseController
    {
        private readonly string _connectionString;
        public HealthFacilitiesController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/healthfacility")]
        public IActionResult GetHealthFacilities(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<HealthFacilities>().Where(o => o.IsActive == true && o.IsDelete == false);
            if (filter != null)
            {
                foreach(var (key,value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;
                    if (string.Equals(key, "provinceCode"))
                    {
                        objs = objs.Where(o => o.ProvinceCode == value.Trim());
                    }
                    if (string.Equals(key, "districtCode"))
                    {
                        objs = objs.Where(o => o.DistrictCode == value.Trim());
                    }
                }
            }

            return Json(new ActionResultDto()
            {
                Result = new
                {
                    Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(),
                    TotalCount = objs.Count()
                }
            });
        }
    }
}