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
    public class BookingInformationsController : BaseController
    {
        private readonly string _connectionString;

        public BookingInformationsController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpPost]
        [Route("api/bookinginformations")]
        public IActionResult Create([FromBody] BookingInformationsInputViewModel obj)
        {
            var result = _context.Insert(new BookingInformations(obj));

            return Json(new ActionResultDto { Result = result });
        }


        /// <summary>
        /// GetAll
        /// </summary>
        /// <param name="skipCount"></param>
        /// <param name="maxResultCount"></param>
        /// <param name="sorting"></param>
        /// <param name="filter"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/bookinginformations")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<BookingInformations>().Where(b => b.BookingServiceType == 1)
                .LeftJoin<Doctor>((b, s) => b.DoctorId == s.DoctorId)
                .LeftJoin<BookingTimeslots>((b, s, d) => b.TimeSlotId == d.TimeSlotId)
                .Select((b, s, d) => new { b.HealthFacilitiesId,
                    b.TimeSlotId, b.DoctorId, b.Status, b.ExaminationDate, b.CreateDate, b.Gender, b.ExaminationWorkingTime, b.ExaminationTime,
                b.PhoneNumber, b.Reason, b.BookingUser, b.TicketId, b.BirthDate, b.BirthMonth, b.BirthYear,
                b.DistrictCode, b.ProvinceCode,
                    s.FullName, d.HoursStart, d.HoursEnd, d.MinuteEnd, d.MinuteStart});

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "healthfacilities") && !string.IsNullOrWhiteSpace(value))
                        objs = objs.Where(b => b.HealthFacilitiesId.ToString() == value.Trim() || b.HealthFacilitiesId.ToString() == null);
                    if (string.Equals(key, "doctor") && !string.IsNullOrWhiteSpace(value))
                        objs = objs.Where(b => b.DoctorId.ToString() == value.Trim());
                    if (string.Equals(key, "status") && !string.IsNullOrWhiteSpace(value))
                    {
                        if (Convert.ToInt32(value) != 4)
                        {
                            objs = objs.Where(b => b.Status.ToString() == value.Trim());
                        }
                    }
                    if (string.Equals(key, "packagesNameDescription") && !string.IsNullOrWhiteSpace(value))
                    {
                        objs = objs.Where(b => b.TicketId.Contains(value) || b.PhoneNumber.Contains(value) || b.BookingUser.Contains(value));
                    }
                    if (string.Equals(key, "startTime")) objs = objs.Where(b => b.ExaminationDate>= DateTime.Parse(value));
                    if (string.Equals(key, "endTime")) objs = objs.Where(b => b.ExaminationDate <= DateTime.Parse(value));

                }

            }
            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<BookingInformations>(key))
                        continue;

                    objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
                }
            }
            else
            {
                objs = objs.OrderByDesc(b => b.CreateDate);
            }
          
            return Json(new ActionResultDto { Result = new { Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Count() } });
        }


    }
}