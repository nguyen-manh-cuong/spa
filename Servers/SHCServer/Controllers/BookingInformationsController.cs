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
        public IActionResult Create([FromBody] BookingInformationsInputCreateViewModel obj)
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
            var objs = _context.Query<BookingInformations>().Where(b => b.BookingServiceType == 1 && b.IsDelete == false)
                .LeftJoin<Doctor>((b, s) => b.DoctorId == s.DoctorId)
                .LeftJoin<BookingTimeslots>((b, s, d) => b.TimeSlotId == d.TimeSlotId)
                .Select((b, s, d) => new { b.HealthFacilitiesId,
                    b.TimeSlotId, b.DoctorId, b.Status, b.ExaminationDate, b.CreateDate, b.Gender, b.ExaminationWorkingTime, b.ExaminationTime,
                    b.BookingType, b.BookingId, b.Address,
                b.PhoneNumber, b.Reason, b.BookingUser, b.BookingRepresent, b.PhoneRepresent, b.EmailRepresent, b.TicketId, b.BirthDate, b.BirthMonth, b.BirthYear,
                b.DistrictCode, b.ProvinceCode,
                    s.FullName, d.HoursStart, d.HoursEnd, d.MinuteEnd, d.MinuteStart});

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;
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
                        objs = objs.Where(b => b.TicketId == value.Trim() || b.PhoneNumber == value.Trim() || b.BookingUser.Contains(value.Trim()));
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

        [HttpPut]
        [Route("api/bookinginformations")]
        public IActionResult Update([FromBody] BookingInformationsInputViewModel booking)
        {
            try
            {

                _context.Session.BeginTransaction();

                if (booking.reasonReject != null)
                {
                    _context.Update<BookingInformations>(p => p.BookingId == booking.bookingId, a => new BookingInformations
                    {
                        ReasonReject = booking.reasonReject,
                        Status = 3,

                    });
                } else
                {
                    _context.Update<BookingInformations>(p => p.BookingId == booking.bookingId, a => new BookingInformations
                    {
                        Reason = booking.reason,
                        Status = booking.status,
                        BookingUser = booking.bookingUser,
                        Address = booking.address.Trim(),
                        UpdateDate = DateTime.Now,
                        UpdateUserId = booking.updateUserId
                });
                }

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction) _context.Session.RollbackTransaction();
                return Json(new ActionResultDto { Error = e.Message });
            }
        }

        [HttpDelete]
        [Route("api/bookinginformations")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (_context.Query<BookingInformations>().Where(g => g.BookingId == id && g.IsDelete == false && g.Status != 0 && g.Status != 1 ).Count() > 0)
                {
                    //return Json(new ActionResultDto { Success = false, Error = new { Code = 401, Message = "Tạo gói không thành công.", Details = "Gói SMS đã tồn tại!" } });
                    return StatusCode(406, _excep.Throw(406, "Hủy đặt khám không thành công.", "Không thể xóa lịch đặt khám đã diễn ra/đã hủy!"));
                }

                _context.Session.BeginTransaction();


                _context.Update<BookingInformations>(t => t.BookingId == id, a => new BookingInformations
                {
                    IsDelete = true
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


        [HttpGet]
        [Route("api/bookinginformationsgroupby")]
         public IActionResult GetByGroup(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<BookingInformations>().Where(b => b.BookingServiceType == 1);
            var check = 0;

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "healthfacilities"))
                    {
                        if(!string.IsNullOrEmpty(value))
                        {
                            check = 1;
                            objs = objs.Where(b => b.HealthFacilitiesId.ToString() == value.Trim() || b.HealthFacilitiesId.ToString() == null);
                        }
                    }

                    if (string.Equals(key, "doctor") && !string.IsNullOrWhiteSpace(value))
                        objs = objs.Where(b => b.DoctorId.ToString() == value.Trim());
                    if (string.Equals(key, "status") && !string.IsNullOrWhiteSpace(value))
                    {
                        if (Convert.ToInt32(value) != 4)
                        {
                            objs = objs.Where(b => b.Status.ToString() == value.Trim());
                        }
                    }

                    if (string.Equals(key, "startTime")) {
                        objs = objs.Where(b => b.ExaminationDate >= DateTime.Parse(value));
                        var start = DateTime.Parse(value);
                    }
                    if (string.Equals(key, "endTime"))
                    {
                        objs = objs.Where(b => b.ExaminationDate <= DateTime.Parse(value));
                        var end = DateTime.Parse(value);
                    }
                     

                }
            }
            if(check == 0) return Json(new ActionResultDto { Result = new { Items = new List<BookingInformationsViewModel>() } });
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

            var a = objs;
            var rs = objs.GroupBy(p => p.DoctorId).Select(p => new BookingInformationsViewModel(p, _connectionString) {
                Quantity = objs.Where(o=>o.DoctorId==p.DoctorId).Count(),
                QuantityByStatusPending = objs.Where(o => o.Status == 1).Count(),
                QuantityByStatusDone = objs.Where(o => o.Status == 2).Count(),
                QuantityByStatusCancel = objs.Where(o => o.Status == 3).Count(),
                QuantityByStatusNew = objs.Where(o => o.Status == 0).Count(),
                QuantityByGenderMale = objs.Where(o => o.Gender == 1).Count(),//Nam
                QuantityByGenderFemale = objs.Where(o => o.Gender == 2).Count(),//Nu               
            });           
            return Json(new ActionResultDto { Result = new { Items = rs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = rs.Count(), TotalPatientCount = objs.Count() } });
        }
    }
}