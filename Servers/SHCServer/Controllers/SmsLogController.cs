using System;
using System.Collections.Generic;
using SHCServer.Models;
using SHCServer.ViewModels;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viettel;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class SmsLogController : BaseController
    {
        private readonly string _connectionString;

        public SmsLogController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/smslog")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<SmsLogs>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value) || value == "false" || value == "0") continue;
                    if (string.Equals(key, "healthfacilities")) objs = objs.Where(s => s.HealthFacilitiesId == int.Parse(value));
                    if (string.Equals(key, "smsTemplateId")) objs = objs.Where(s => s.SmsTemplateId == int.Parse(value));
                    if (string.Equals(key, "phoneNumber")) objs = objs.Where(s => s.PhoneNumber == value);
                    if (string.Equals(key, "status")) objs = objs.Where(s => s.Status == (value != "2" ? int.Parse(value) : 0));
                    if (string.Equals(key, "startTime")) objs = objs.Where(s => s.SentDate >= DateTime.Parse(value));
                    if (string.Equals(key, "endTime")) objs = objs.Where(s => s.SentDate <= DateTime.Parse(value));
                    if (string.Equals(key, "type")) objs = objs.Where(s => s.LogType == int.Parse(value));
                    if (string.Equals(key, "telco") && value != "all") objs = objs.Where(s => s.Telco == value);
                }
            }

            //if (sorting != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            //    {
            //        if (!Utils.PropertyExists<SmsLogs>(key)) continue;
            //        objs = value == "asc" ? objs.OrderBy(mhh => key) : objs.OrderByDesc(mhh => key);
            //    }

            //} 

            objs = objs.OrderByDesc(o => o.Id);

            return Json(new ActionResultDto { Result = new { Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).Select(l => new SmsLogViewModel(l, _connectionString)).ToList(), TotalCount = objs.Count() } });
        }
    }
}