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
using System.Linq;

namespace SHCServer.Controllers
{
    public class BookingDoctorApproveController : BaseController
    {
        private readonly string _connectionString;

        public BookingDoctorApproveController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/bookingdoctorapprove")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context
                .JoinQuery<BookingDoctorsCalendars, BookingTimeslots>((dc, t) => new object[] { JoinType.InnerJoin, dc.TimeSlotId == t.TimeSlotId })
                .Where((dc, t) => dc.IsDelete == false && dc.IsActive == true);

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value)) continue;
                    if (string.Equals(key, "healthfacilities")) objs = objs.Where((dc, t) => t.HealthFacilitiesId == int.Parse(value));
                    if (string.Equals(key, "doctor")) objs = objs.Where((dc, t) => dc.DoctorId == int.Parse(value));
                    if (string.Equals(key, "startTime")) objs = objs.Where((dc, t) => dc.CalendarDate >= DateTime.Parse(value));
                    if (string.Equals(key, "endTime")) objs = objs.Where((dc, t) => dc.CalendarDate <= DateTime.Parse(value));
                    if (string.Equals(key, "status") && value != "3") objs = objs.Where((dc, t) => dc.Status == int.Parse(value));
                }
            }

            //if (sorting != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            //    {
            //        if (!Utils.PropertyExists<SmsPackage>(key)) continue;

            //        objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
            //    }
            //}

            var _objs = objs.Select((dc, t) => new BookingDoctorsCalendarsViewModel(dc, _connectionString)).ToList();  //.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList();

            return Json(GroupDoctor(_objs, skipCount, maxResultCount));
        }


        [HttpPut]
        [Route("api/bookingdoctorapprove")]
        public IActionResult Update([FromBody] BookingDoctorsCalendarsInput bookingDoctorsCalendarsInput)
        {
            try
            {
                _context.Session.BeginTransaction();

                foreach (int calendarId in bookingDoctorsCalendarsInput.LstCalendarId)
                {
                    if(bookingDoctorsCalendarsInput.Status == 1)
                    {
                        _context.Update<BookingDoctorsCalendars>(p => p.CalendarId == calendarId, a => new BookingDoctorsCalendars
                        {
                            Status = bookingDoctorsCalendarsInput.Status,
                            ApproveUserId = bookingDoctorsCalendarsInput.UserId,
                            ApproveDate = DateTime.Now 
                        });
                    }
                    else
                    {
                        _context.Update<BookingDoctorsCalendars>(p => p.CalendarId == calendarId, a => new BookingDoctorsCalendars
                        {
                            Status = bookingDoctorsCalendarsInput.Status
                        });
                    }
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

        public ActionResultDto GroupDoctor(List<BookingDoctorsCalendarsViewModel> lstDoctorCalendars, int skipCount, int maxResultCount)
        {
            List<int> lstDoctorId = new List<int>();
            List<BookingDoctorsCalendarsView> lstBookingDoctorsCalendarsViews = new List<BookingDoctorsCalendarsView>();

            foreach (var item in lstDoctorCalendars)
            {
                if (lstDoctorId.IndexOf(item.DoctorId) < 0)
                {
                    lstDoctorId.Add(item.DoctorId);
                }
            }

            foreach (int doctorId in lstDoctorId)
            {
                BookingDoctorsCalendarsView bookingDoctorsCalendarsView = new BookingDoctorsCalendarsView();
                bookingDoctorsCalendarsView.LstBookingDoctorsCalendars = new List<BookingDoctorsCalendarsViewModel>();

                foreach (var item in lstDoctorCalendars)
                {
                    if (doctorId == item.DoctorId)
                    {
                        bookingDoctorsCalendarsView.DoctorId = item.DoctorId;
                        bookingDoctorsCalendarsView.Name = item.FullName;
                        bookingDoctorsCalendarsView.HealthFacilitiesName = item.HealthFacilitiesName;
                        bookingDoctorsCalendarsView.LstBookingDoctorsCalendars.Add(item);
                    }
                }
                lstBookingDoctorsCalendarsViews.Add(bookingDoctorsCalendarsView);
            }

            return new ActionResultDto { Result = new { Items = lstBookingDoctorsCalendarsViews.Skip(maxResultCount * skipCount).Take(maxResultCount * (skipCount + 1)).ToList(), TotalCount = lstBookingDoctorsCalendarsViews.Count } };
        }

        public class BookingDoctorsCalendarsInput
        {
            public List<int> LstCalendarId { set; get; }
            public int Status { set; get; }
            public int? UserId { set; get; }
        }

        public class BookingDoctorsCalendarsView
        {
            public int DoctorId { set; get; }
            public string Name { set; get; }
            public string HealthFacilitiesName { set; get; }            
            public List<BookingDoctorsCalendarsViewModel> LstBookingDoctorsCalendars { set; get; }
        }
    }
}