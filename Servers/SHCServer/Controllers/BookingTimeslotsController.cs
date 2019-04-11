using System;
using System.Collections.Generic;
using SHCServer.Models;
using SHCServer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viettel.MySql;
namespace SHCServer.Controllers
{
    public class BookingTimeslotsController : BaseController
    {
        private readonly string _connectionString;

        public BookingTimeslotsController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _excep = new FriendlyException();
            _connectionString = configuration.GetConnectionString("DefaultConnection");
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
        [Route("api/bookingtimeslots")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<BookingTimeslots>().Where(b => b.IsDelete == false);
            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "keyFilter") && !string.IsNullOrWhiteSpace(value))
                    {
                        var query = value.Replace(@"%", "\\%").Replace(@"_", "\\_").Trim();
                        objs = objs.Where(b => b.Code.Contains(query) || b.Name.Contains(query));
                    }
                    if (string.Equals(key, "healthfacilities") && !string.IsNullOrWhiteSpace(value))
                        objs = objs.Where(b => b.HealthFacilitiesId.ToString() == value.Trim() || b.HealthFacilitiesId == null);
                }

            }
            //if (sorting != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            //    {
            //        if (!Utils.PropertyExists<BookingTimeslots>(key))
            //            continue;

            //        objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
            //    }
            //}

                objs = objs.OrderByDesc(b => b.CreateDate);


            //return Json(new ActionResultDto { Result = new { Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Count() } });
            return Json(new ActionResultDto { Result = new { Items = objs.OrderByDesc(p => p.CreateDate).TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).Select(p => new BookingTimeSlotsViewModel(p, _connectionString)).ToList(), TotalCount = objs.Count() } });
        }

        /// <summary>
        /// Create
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/bookingtimeslots")]
        public IActionResult Create([FromBody] BookingTimeslots obj)
        {
            try
            {
                _context.Session.BeginTransaction();
                var t = _context.Query<BookingTimeslots>().Where(ts => ts.Code.Equals(obj.Code)).FirstOrDefault();
                if(t == null)
                {
                    _context.Insert(() => new BookingTimeslots
                    {
                        Name = obj.Name,
                        Code = obj.Code,
                        HoursStart = obj.HoursStart,
                        HoursEnd = obj.HoursEnd,
                        MinuteStart = obj.MinuteStart,
                        MinuteEnd = obj.MinuteEnd,
                        IsDelete = false,
                        IsActive = obj.IsActive,
                        CreateUserId = obj.CreateUserId,
                        UpdateUserId = obj.UpdateUserId,
                        HealthFacilitiesId = obj.HealthFacilitiesId,
                        UpdateDate = DateTime.Now,
                        CreateDate = DateTime.Now

                    });
                }
                else
                {
                    return StatusCode(422, _excep.Throw("Tạo khung giờ khám không thành công !", "Mã khung giờ khám đã tồn tại"));
                }
                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                    _context.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra !", e.Message));
            }
        }

        /// <summary>
        /// update
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("api/bookingtimeslots")]
        public IActionResult Update([FromBody] BookingTimeslots obj)
        {
            var _obj = _context.Query<BookingTimeslots>().FirstOrDefault(b => b.TimeSlotId == obj.TimeSlotId);

            if (_obj == null)
                return StatusCode(404, _excep.Throw("Not Found"));

            try
            {
                _context.Session.BeginTransaction();
                _context.Update<BookingTimeslots>(b => b.TimeSlotId == obj.TimeSlotId, a => new BookingTimeslots()
                {

                    Name = obj.Name,
                    Code = obj.Code,
                    HoursStart = obj.HoursStart,
                    HoursEnd = obj.HoursEnd,
                    MinuteStart = obj.MinuteStart,
                    MinuteEnd = obj.MinuteEnd,
                    UpdateUserId = obj.UpdateUserId,
                    IsActive = obj.IsActive,
                    HealthFacilitiesId = obj.HealthFacilitiesId,
                    UpdateDate = DateTime.Now
                });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                    _context.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra !", e.Message));
            }
        }


        /// <summary>
        /// Delete
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/bookingtimeslots")]
        public IActionResult Delete(int id)
        {
            try
            {
                var obj = new BookingTimeslots();
                _context.Session.BeginTransaction();

                _context.Update<BookingTimeslots>(b => b.TimeSlotId == id , a => new BookingTimeslots()
                {
                    IsDelete = true
                });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                    _context.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra !", e.Message));
            }
        }
    }
}
