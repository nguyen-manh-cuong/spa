﻿using System;
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
    public class BookingListController : BaseController
    {
        private readonly string _connectionString;

        public BookingListController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
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
        [Route("api/bookinglist")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<BookingInformations>().Where(b => b.BookingServiceType == 1 && b.IsDelete == false)
                .LeftJoin<Doctor>((b, s) => b.DoctorId == s.DoctorId)
                .LeftJoin<BookingTimeslots>((b, s, d) => b.TimeSlotId == d.TimeSlotId)
                .Select((b, s, d) => new {
                    b.HealthFacilitiesId,
                    b.TimeSlotId,
                    b.DoctorId,
                    b.Status,
                    b.ExaminationDate,
                    b.CreateDate,
                    b.Gender,
                    b.ExaminationWorkingTime,
                    b.ExaminationTime,
                    b.BookingType,
                    b.BookingId,
                    b.Address,
                    b.PhoneNumber,
                    b.Reason,
                    b.BookingUser,
                    b.BookingRepresent,
                    b.PhoneRepresent,
                    b.EmailRepresent,
                    b.TicketId,
                    b.BirthDate,
                    b.BirthMonth,
                    b.BirthYear,
                    b.DistrictCode,
                    b.ProvinceCode,
                    s.FullName,
                    d.HoursStart,
                    d.HoursEnd,
                    d.MinuteEnd,
                    d.MinuteStart
                });

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
                    if (string.Equals(key, "startTime")) objs = objs.Where(b => b.ExaminationDate >= DateTime.Parse(value));
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
        [Route("api/bookinglist")]
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
                }
                else
                {
                    _context.Update<BookingInformations>(p => p.BookingId == booking.bookingId, a => new BookingInformations
                    {
                        Reason = booking.reason.Trim(),
                        Status = booking.status,
                        BookingUser = booking.bookingUser.Trim(),
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
        [Route("api/bookinglist")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (_context.Query<BookingInformations>().Where(g => g.BookingId == id && g.IsDelete == false && g.Status != 0 && g.Status != 1).Count() > 0)
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
    }
}