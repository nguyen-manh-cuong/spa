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
    public class DoctorController : BaseController
    {
        private readonly string _connectionString;

        public DoctorController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/doctor")]
        public IActionResult GetAll(int skipCount=0,int maxResultCount=10,string sorting=null,string filter=null)
        {
            var objs = _context.Query<Doctor>().Where(o => o.IsDelete == false);

            var specialList = _context.Query<DoctorSpecialists>();


            if (filter != null)
            {

                foreach(var (key,value) in JsonConvert.DeserializeObject<Dictionary<string,string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;
                    if (string.Equals(key, "provinceCode"))
                        objs.Where(o => o.ProvinceCode.Equals(value));
                    if (string.Equals(key, "districtCode"))
                        objs.Where(o => o.DistrictCode.Equals(value));
                    //if (string.Equals(key, "healthFacilitiesId"))
                    //    objs.Where(o => o.HealthFacilitiesId.Equals(value));
                    if (string.Equals(key, "fullName"))
                        objs.Where(o => o.FullName.Equals(value));
                    if (string.Equals(key, "specialistCode"))
                    {
                        specialList = specialList.Where(sp => sp.SpecialistCode == value);
                        foreach (var item in specialList.ToList())
                        {
                            objs = objs.Where(o => o.DoctorId.Equals(item.DoctorId));
                        }
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