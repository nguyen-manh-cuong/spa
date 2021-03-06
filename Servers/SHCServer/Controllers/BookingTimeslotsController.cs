﻿using System;
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
                    if (string.Equals(key, "healthfacilities") && !string.IsNullOrWhiteSpace(value)) //objs = objs.Where(b => b.HealthFacilitiesId.ToString() == value.Trim());
                        objs = objs.Where(b => b.HealthFacilitiesId.ToString() == value.Trim());
                    if (string.Equals(key, "healthfacilities") && string.IsNullOrWhiteSpace(value)) 
                        objs = objs.Where(b =>  b.HealthFacilitiesId == null);
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
        public void InitObjec()
        {

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
            var objs = _context.Query<BookingTimeslots>().Where(b => (b.HealthFacilitiesId == obj.HealthFacilitiesId || b.HealthFacilitiesId == null) && b.IsDelete == false).ToList();

            double timeStartInput = double.Parse($"{obj.HoursStart},{obj.MinuteStart}");
            double timeEndInput = double.Parse($"{obj.HoursEnd},{obj.MinuteEnd}");
            foreach (var item in objs)
            {
                double timeStart = double.Parse($"{item.HoursStart},{item.MinuteStart}");
                double timeEnd = double.Parse($"{item.HoursEnd},{item.MinuteEnd}");
                if ((timeStartInput >= timeStart && timeStartInput < timeEnd) || (timeEndInput > timeStart && timeEndInput <= timeEnd) || (timeStartInput < timeStart && timeEnd < timeEndInput))
                {
                    return StatusCode(409, _excep.Throw("Thêm mới khung giờ khám không thành công", "Thời gian của khung giờ khám trùng với khung giờ khám đã có!"));
                }
            }

            try
            {
                _context.Session.BeginTransaction();               
                #region [Tài khoản phòng khám, bệnh viện]                
                if (obj.HealthFacilitiesId != null && !string.IsNullOrWhiteSpace(obj.HealthFacilitiesId.ToString()))
                {
                    var code = _context.Query<BookingTimeslots>().Where(ts => ts.Code.Equals(obj.Code) && ts.IsDelete == false).Where(ts => ts.HealthFacilitiesId.Equals(obj.HealthFacilitiesId) || ts.HealthFacilitiesId.ToString() == null).FirstOrDefault();
                    // lay ma code của dơn vị hiện tại + admin
                    if(code != null)
                    {
                        return StatusCode(406,_excep.Throw( 406, "Tạo khung giờ khám không thành công !", "Mã khung giờ khám đã tồn tại!"));
                    }
                    else
                    {
                        _context.Insert(() => new BookingTimeslots
                        {
                            Name = obj.Name.Trim(),
                            Code = obj.Code.Trim(),
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
                }
                #endregion
                #region [Tài khoản admin]
                else
                {
                    var t = _context.Query<BookingTimeslots>().Where(ts => ts.Code.Equals(obj.Code) && ts.IsDelete == false).FirstOrDefault();
                    if (t == null)
                    {
                        _context.Insert(() => new BookingTimeslots
                        {
                            Name = obj.Name.Trim(),
                            Code = obj.Code.Trim(),
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
                        return StatusCode(406, _excep.Throw(406, "Tạo khung giờ khám không thành công !", "Mã khung giờ khám đã tồn tại!"));
                    }
                }
                #endregion
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

            var objs = _context.Query<BookingTimeslots>().Where(b => b.TimeSlotId != obj.TimeSlotId && (b.HealthFacilitiesId == obj.HealthFacilitiesId || b.HealthFacilitiesId == null) && b.IsDelete == false).ToList();

            double timeStartInput = double.Parse($"{obj.HoursStart},{obj.MinuteStart}");
            double timeEndInput = double.Parse($"{obj.HoursEnd},{obj.MinuteEnd}");
            foreach (var item in objs)
            {
                double timeStart = double.Parse($"{item.HoursStart},{item.MinuteStart}");
                double timeEnd = double.Parse($"{item.HoursEnd},{item.MinuteEnd}");
                if ((timeStartInput >= timeStart && timeStartInput < timeEnd) || (timeEndInput > timeStart && timeEndInput <= timeEnd) || (timeStartInput < timeStart && timeEnd < timeEndInput))
                {
                    return StatusCode(409, _excep.Throw("Sửa khung giờ khám không thành công", "Thời gian của khung giờ khám trùng với khung giờ khám đã có!"));
                }
            }


            try
            {
                _context.Session.BeginTransaction();
                _context.Update<BookingTimeslots>(b => b.TimeSlotId == obj.TimeSlotId, a => new BookingTimeslots()
                {

                    Name = obj.Name.Trim(),
                    Code = obj.Code.Trim(),
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
