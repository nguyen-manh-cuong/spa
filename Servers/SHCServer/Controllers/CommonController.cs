using SHCServer.Models;
using SHCServer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel.MySql;
using Viettel;
using System.Linq;

namespace SHCServer.Controllers
{
    public class CommonController : BaseController
    {
        private readonly string _connectionString;

        public CommonController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
        }

        #region location
        [HttpGet]
        [Route("api/provinces")]
        public IActionResult GetAllProvinces() => Json(new ActionResultDto { Result = new { Items = _context.Query<Province>().ToList() } });

        [HttpGet]
        [Route("api/districts")]
        public IActionResult GetDistricts(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<District>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "ProvinceCode")) objs = objs.Where(o => o.ProvinceCode == value);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }

        [HttpGet]
        [Route("api/wards")]
        public IActionResult GetWards(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<Ward>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "DistrictCode")) objs = objs.Where(o => o.DistrictCode == value);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }
        #endregion

        #region booking
        [HttpGet]
        [Route("api/healthfacilitiesbooking")]
        public IActionResult GetHealthfacilitiesBooking(string filter)
        {
            var objs = _context.Query<HealthFacilities>().Where(o => o.IsDelete == false && o.IsActive == true);
            FilterHealthFacilities filterHf = JsonConvert.DeserializeObject<FilterHealthFacilities>(filter);

            if (filterHf.districtCode != null) objs = objs.Where((o) => o.DistrictCode == filterHf.districtCode);
            if (filterHf.provinceCode != null) objs = objs.Where((o) => o.ProvinceCode == filterHf.provinceCode);
            if (filterHf.name != null) objs = objs.Where((o) => o.Name.Contains(filterHf.name));
            if (filterHf.specialist != null && filterHf.specialist.Count != 0) {
                var specialist = _context.Query<HealthFacilitiesSpecialists>().Where(o => filterHf.specialist.Contains(o.SpecialistCode) && o.IsDelete == false).ToList();

                if (specialist.Count() > 0)
                {
                    List<int> lstHealthFacilitiesId = new List<int>();
                    foreach (var item in specialist)
                    {
                        lstHealthFacilitiesId.Add(item.HealthFacilitiesId);
                    }

                    objs = objs.Where(o => lstHealthFacilitiesId.Contains(o.HealthFacilitiesId));
                }
                else
                {
                    return Json(new ActionResultDto { Result = new List<HealthFacilitiesViewModel>()});
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(1000).Select(h => new HealthFacilitiesViewModel(h, _connectionString)).ToList() } });
        }
        #endregion

        #region getall
        [HttpGet]
        [Route("api/smsbrands-all")]
        public IActionResult GetAllSmsBrands() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsBrands>().OrderBy(t => t.BrandName).ToList() } });

        [HttpGet]
        [Route("api/smspackages-all")]
        public IActionResult GetAllSmsPackages() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsPackage>().OrderBy(o => o.Name).ToList() } });
        #endregion

        #region distribute
        [HttpGet]
        [Route("api/smspackages-cbo")]
        public IActionResult GetSmsPackages() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsPackage>().Where(o => o.IsDelete == false && o.IsActive == true).OrderBy(o => o.Name).ToList() } });
        #endregion

        [HttpGet]
        [Route("api/categorycommon")]
        public IActionResult GetCategoryCommon(string filter) => Json(new ActionResultDto { Result = new { Items = _context.Query<CategoryCommon>().OrderBy(g => g.Name).Where(g => g.Type == filter && g.IsActive == true && g.IsDelete == false).Select(g => new CategoryCommonViewModel(g)).ToList() } });

        [HttpGet]
        [Route("api/smstemplates")]
        public IActionResult GetSmsTemplates(string filter)
        {
            var objs = _context.Query<SmsTemplate>().Where(t => t.IsDelete == false && t.IsActive == true);

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(filter) || o.ApplyAllSystem == true);

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(t => t.SmsTemplateName).ToList() } });
        }

        [HttpGet]
        [Route("api/doctors")]
        public IActionResult GetDoctors(string filter)
        {
            var objs = _context
                .JoinQuery<Doctor, HealthFacilitiesDoctors>((d, h) => new object[] { JoinType.InnerJoin, d.DoctorId == h.DoctorId })
                .Where((d, h) => d.IsDelete == false && d.IsActive == true && h.IsDelete == false);

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where((d, h) => h.HealthFacilitiesId == int.Parse(filter));

            List<DoctorViewModel> lstDoctor = objs.Select((d, h) => new DoctorViewModel(d, _connectionString)).ToList();

            lstDoctor = lstDoctor.OrderBy(o => o.FullName).ToList();

            return Json(new ActionResultDto { Result = new { Items = lstDoctor } });
        }

        [HttpGet]
        [Route("api/healthfacilities")]
        public IActionResult GetHealthfacilities(string filter,int maxResultCount=30)
        {
            var objs = _context.Query<HealthFacilities>().Where(o => o.IsActive == true && o.IsDelete == false);
            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;
                    if (string.Equals(key, "healthfacilitiesId"))
                    {
                        objs = objs.Where(o => o.HealthFacilitiesId.ToString() == value.Trim());
                    }
                    if (string.Equals(key, "provinceCode"))
                    {
                        objs = objs.Where(o => o.ProvinceCode == value.Trim());
                    }
                    if (string.Equals(key, "districtCode"))
                    {
                        objs = objs.Where(o => o.DistrictCode == value.Trim());
                    }
                    if (string.Equals(key, "name"))
                    {
                        objs = objs.Where(o => o.Name.Contains(value.Trim()));
                    }
                    if (string.Equals(key, "code"))
                    {
                        objs = objs.Where(o => o.Code.Contains(value.Trim()));
                    }
                    if (string.Equals(key, "max"))
                    {
                        maxResultCount = 1000;
                    }
                }
            }
            if(maxResultCount==30)
                return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(30).ToList() } });
            else
                return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(maxResultCount).ToList() } });
        }

        [HttpGet]
        [Route("api/healthfacilitiesconfigs")]
        public IActionResult GetHealthFacilitiesConfigs(string filter)
        {
            var objs = _context.Query<HealthFacilitiesConfigs>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value)) return Json(new ActionResultDto { Result = new { } });
                    if (string.Equals(key, "code")) objs = objs.Where(o => o.Code == value);
                    if (string.Equals(key, "healthFacilitiesId")) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(value));
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.FirstOrDefault() } });
        }

        [HttpGet]
        [Route("api/config")]
        public IActionResult GetConfig(string filter)
        {
            if (filter == null) return Json(new ActionResultDto { Result = new { } });

            List<string> lst = JsonConvert.DeserializeObject<List<string>>(filter);
            var objs = _context.Query<Config>().Where((o) => lst.Contains(o.Code));
            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }

        [HttpGet]
        [Route("api/workingtime")]
        public IActionResult GetWorkingTime(string filter)
        {
            var objs = _context.Query<BookingDoctorsCalendars>().Where((o) => o.DoctorId == int.Parse(filter));

            return Json(new ActionResultDto { Result = new { Items = objs.Select(h => new BookingDoctorsCalendarsViewModel(h, _connectionString)).ToList() } });
        }

        [HttpGet]
        [Route("api/nations")]
        public IActionResult GetNations()
        {
            var objs = _context.Query<Nation>().Where(o=>o.IsActive==true&&o.IsDelete==false).OrderBy(o=>o.OrderNumber);
            return Json(new ActionResultDto() { Result = new { Items = objs.ToList() } });
        }


        [HttpGet]
        [Route("api/ethnicity")]
        public IActionResult GetEthnicities()
        {
            var objs = _context.Query<Ethnicity>().Where(o => o.IsActive == true && o.IsDelete == false).OrderBy(o => o.OrderNumber);
            return Json(new ActionResultDto() { Result = new { Items = objs.ToList() } });
        }

        public class FilterHealthFacilities
        {
            [JsonProperty("districtCode")]
            public string districtCode { get; set; }

            [JsonProperty("provinceCode")]
            public string provinceCode { get; set; }

            [JsonProperty("name")]
            public string name { get; set; }

            [JsonProperty("specialist")]
            public List<string> specialist { get; set; }
        }
    }
}
