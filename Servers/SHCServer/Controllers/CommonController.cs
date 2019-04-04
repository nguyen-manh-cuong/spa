﻿using SHCServer.Models;
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
            var objs = _context.Query<HealthFacilities>().Where(o => o.IsDelete == 0 && o.IsActive == 1);
            FilterHealthFacilities filterHf = JsonConvert.DeserializeObject<FilterHealthFacilities>(filter);

            if (filterHf.districtCode != null) objs = objs.Where((o) => o.DistrictCode == filterHf.districtCode);
            if (filterHf.provinceCode != null) objs = objs.Where((o) => o.ProvinceCode == filterHf.provinceCode);
            if (filterHf.name != null) objs = objs.Where((o) => o.Name.Contains(filterHf.name));
            if (filterHf.specialist != null && filterHf.specialist.Count != 0) objs = objs.Where((o) => filterHf.specialist.Contains(o.Specialist));

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(1000).Select(h => new HealthFacilitiesViewModel(h, _connectionString)).ToList() } });
        }
        #endregion

        #region getall
        [HttpGet]
        [Route("api/smsbrands-all")]
        public IActionResult GetAllSmsBrands() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsBrands>().OrderBy(t => t.BrandName).ToList() } });

        [HttpGet]
        [Route("api/smspackages-all")]
        public IActionResult GetAllSmsPackages() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsPackage>().OrderBy(t => t.Name).ToList() } });
        #endregion

        [HttpGet]
        [Route("api/categorycommon")]
        public IActionResult GetCategoryCommon(string filter) => Json(new ActionResultDto { Result = new { Items = _context.Query<CategoryCommon>().OrderBy(g => g.Name).Where(g => g.Type == filter).Select(g => new CategoryCommonViewModel(g)).ToList() } });

        [HttpGet]
        [Route("api/smstemplates")]
        public IActionResult GetSmsTemplates(string filter) {
            var objs = _context.Query<SmsTemplate>();

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(filter) || o.ApplyAllSystem == true);

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(t => t.SmsTemplateName).ToList() } });
        }

        [HttpGet]
        [Route("api/doctors")]
        public IActionResult GetDoctors(string filter)
        {
            var objs = _context.JoinQuery<Doctor, HealthFacilitiesDoctors>((d, h) => new object[] { JoinType.InnerJoin, d.DoctorId == h.DoctorId });

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where((d, h) => h.HealthFacilitiesId == int.Parse(filter));

            return Json(new ActionResultDto { Result = new { Items = objs.Select((d, h) => new DoctorViewModel(d, _connectionString)).ToList() }});
        }

        [HttpGet]
        [Route("api/healthfacilities")]
        public IActionResult GetHealthfacilities(string filter)
        {
            var objs = _context.Query<HealthFacilities>();

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(filter));

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(500).ToList() } });
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

        //[HttpGet]
        //[Route("api/testquery")]
        //public IActionResult TestQuery(string filter)
        //{
        //    const string subQuery = @"select * from medical_healthcare_histories";

        //    var subParamQuery = new List<string>();
        //    var subParam = new List<DbParam>();

        //    MedicalHealthcareHistories[] m = new MedicalHealthcareHistories[10];
        //    var a = _context.Session.ExecuteReader(subQuery, new {});

        //    int i = 0;
        //    while (a.Read())
        //    {
        //        var c = a.GetInt32(i);
        //        var d = a.GetPropertyValue("PatientId");
        //        i++;             
        //    }

        //    return Json(new ActionResultDto { Result = new { } });
        //}

        public class FilterHealthFacilities
        {
            [JsonProperty("districtCode")]
            public string districtCode { get; set; }

            [JsonProperty("provinceCode")]
            public string provinceCode { get; set; }

            [JsonProperty("name")]
            public string name { get; set; }

            [JsonProperty("specialist")]
            public List<int?> specialist { get; set; }
        }
    }
}