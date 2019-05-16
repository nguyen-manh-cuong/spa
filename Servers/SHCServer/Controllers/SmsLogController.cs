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
using System.Threading.Tasks;
using System.Globalization;

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
            int objectType = 0;

            if (filter != null)
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);

                foreach (var (key, value) in data)
                {
                    if (string.IsNullOrEmpty(value) || value == "false" || value == "0") continue;
                    if (string.Equals(key, "healthfacilities")) objs = objs.Where(s => s.HealthFacilitiesId == int.Parse(value));
                    if (string.Equals(key, "smsTemplateId")) objs = objs.Where(s => s.SmsTemplateId == int.Parse(value));
                    if (string.Equals(key, "smsPackagesDistributeId")) objs = objs.Where(s => s.SmsPackagesDistributeId == int.Parse(value));
                    if (string.Equals(key, "phoneNumber")) objs = objs.Where(s => s.PhoneNumber == value);
                    if (string.Equals(key, "status")) objs = objs.Where(s => s.Status == (value != "2" ? int.Parse(value) : 0));
                    if (string.Equals(key, "startTime")) objs = objs.Where(s => s.SentDate >= DateTime.ParseExact(value, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture));
                    if (string.Equals(key, "endTime")) objs = objs.Where(s => s.SentDate <= DateTime.ParseExact(value, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture));
                    if (string.Equals(key, "type")) objs = objs.Where(s => s.LogType == int.Parse(value));
                    if (string.Equals(key, "telco") && value != "all") objs = objs.Where(s => s.Telco == value);
                }

                if (data.ContainsKey("patientId")) objs = objs.Where(s => s.ObjectId == int.Parse(data["patientId"]));
                if (data.ContainsKey("objectType")) objs = objs.Where(s => s.ObjectType == int.Parse(data["objectType"]));
                if (data.ContainsKey("checkSmsLogDetail") && data["checkSmsLogDetail"].ToString() == "1") objectType = 1;
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
            List<SmsLogViewModel> list = objectType == 1 ? objs.Select(l => new SmsLogViewModel(l, _connectionString)).ToList() : objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).Select(l => new SmsLogViewModel(l, _connectionString)).ToList();

            foreach (var item in list)
            {
                item.SentDay = item.SentDate.Day.ToString();
                item.SentMonth = item.SentDate.Month.ToString();
                item.SentYear = item.SentDate.Year.ToString();
            }

            return Json(new ActionResultDto { Result = new { Items = list, TotalCount = objs.Count() } });
        }
    }
}