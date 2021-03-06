﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer.Models;
using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using Viettel;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class SMSController : BaseController
    {
        private readonly string _connectionString;
        private string nameData;
        public SMSController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _excep = new FriendlyException();
            _settings = settings;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(_connectionString));

            if (_connectionString.IndexOf("smarthealthcare_58") > 0) nameData = "smarthealthcare_58";
            else if (_connectionString.IndexOf("smarthealthcare") > 0) nameData = "smarthealthcare";
        }

        [HttpGet]
        [Route("api/sms-templates")]
        public IActionResult Get(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            int checkGetList = 0;

            var objs = _context.Query<SmsTemplate>()
                               .Where(g => g.IsDelete == false)
                               .Select(sms => new
                               {
                                   sms.Id,
                                   sms.SmsTemplateName,
                                   sms.SmsTemplateCode,
                                   sms.MessageType,
                                   MessageTypeName = _context.Query<CategoryCommon>().Where(c=>c.Id==sms.MessageType).FirstOrDefault().Name,
                                   sms.SmsContent,
                                   sms.IsActive,
                                   sms.OrganizationName,
                                   sms.ApplyAllSystem,
                                   sms.HealthFacilitiesId,
                                   users = _context.Query<HealthFacilitiesConfigs>().Where(h => h.Values == sms.SmsTemplateCode).Count(),
                                   healthFacilitiesName = _context.Query<HealthFacilities>().Where(h =>sms.HealthFacilitiesId!=null && h.HealthFacilitiesId == sms.HealthFacilitiesId).FirstOrDefault().Name
                               });
            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (!Utils.PropertyExists<SmsTemplate>(key) && string.IsNullOrEmpty(value)) continue;

                    if (string.Equals(key, "smsTemplateName"))
                    {
                        var query = value.Replace(@"%", "\\%").Replace(@"_", "\\_").Trim();
                        objs = objs.Where(o => o.SmsTemplateName.Contains(query) || o.SmsContent.Contains(query));
                    }
                    if (string.Equals(key, "healthFacilitiesId")) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(value) || o.ApplyAllSystem == true);
                    if (string.Equals(key, "status") && value != "2") objs = objs.Where(o => o.IsActive == bool.Parse(value));
                    if (string.Equals(key, "checkGetList") && value == "1") checkGetList = 1;
                }
            }

            //if (sorting != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            //    {
            //        if (!Utils.PropertyExists<SmsTemplate>(key)) continue;

            //       objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
            //    }
            //}

            objs = objs.OrderByDesc(u => u.Id);
            if (checkGetList == 1)
            {
                return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
            }

            return Json(new ActionResultDto { Result = new { Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Count() } });
        }
        
        [HttpPost]
        [Route("api/sms-templates")]
        public IActionResult Create([FromBody] SmsTemplateInputViewModel sms)
        {
            string sql = $"SELECT * FROM {nameData}.sms_template where BINARY SmsTemplateName = '{sms.SmsTemplateName}' and {sms.IsDelete} = false";

            SmsTemplate genSmsCode;
            string smsTemplateCode = "";
            if (sms.HealthFacilitiesId == null)
            {
                genSmsCode = _context.Query<SmsTemplate>().Where(s => s.IsDelete == false && s.HealthFacilitiesId == null).OrderByDesc(s => s.CreateDate).FirstOrDefault();
                if (genSmsCode != null)
                {
                    if (genSmsCode.SmsTemplateCode != null)
                    {
                        if (int.Parse(genSmsCode.SmsTemplateCode.Substring(8, 2)) < 9)
                            smsTemplateCode = genSmsCode.SmsTemplateCode.Substring(0, 8) + "0" + (int.Parse(genSmsCode.SmsTemplateCode.Substring(8, 2)) + 1).ToString();
                        else
                            smsTemplateCode = genSmsCode.SmsTemplateCode.Substring(0, 8) + (int.Parse(genSmsCode.SmsTemplateCode.Substring(8, 2)) + 1).ToString();
                    }
                    else
                    {
                        smsTemplateCode = "SMSADMIN" + "00";
                    }
                }
                else
                {
                    smsTemplateCode = "SMSADMIN" + "00";
                }
            }
            else
            {
                var healthFacilities = _context.Query<HealthFacilities>().Where(h => h.IsDelete == false && h.HealthFacilitiesId == sms.HealthFacilitiesId).FirstOrDefault();
                genSmsCode = _context.Query<SmsTemplate>().Where(s => s.IsDelete == false && s.HealthFacilitiesId == sms.HealthFacilitiesId).OrderByDesc(s => s.CreateDate).FirstOrDefault();
                if (genSmsCode != null)
                {
                    if (genSmsCode.SmsTemplateCode != null)
                        if (int.Parse(genSmsCode.SmsTemplateCode.Substring(8, 2)) < 9)
                            smsTemplateCode = genSmsCode.SmsTemplateCode.Substring(0, 8) + "0" + (int.Parse(genSmsCode.SmsTemplateCode.Substring(8, 2)) + 1).ToString();
                        else
                            smsTemplateCode = genSmsCode.SmsTemplateCode.Substring(0, 8) + (int.Parse(genSmsCode.SmsTemplateCode.Substring(8, 2)) + 1).ToString();
                    else
                    {
                        smsTemplateCode = "SMS" + healthFacilities.Code + "00";
                    }
                }
                else
                {
                    smsTemplateCode = "SMS" + healthFacilities.Code + "00";
                }
            }

            sms.SmsTemplateCode = smsTemplateCode;

            //if (sms.HealthFacilitiesId != null)
            //{
            //    sql = sql + $" and (HealthFacilitiesId = {sms.HealthFacilitiesId} or HealthFacilitiesId = null)";
            //}

            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();
            var str = $"{sql} {string.Join(" ", clause)}";
            var reader = _context.Session.ExecuteReader($"{sql} {string.Join(" ", clause)}", param);

            var HealthFacilitiesId = "";
            var Id = 0;

            List<SmsTemplate> lst = new List<SmsTemplate>();
            while (reader.Read())
            {
                Id = Convert.ToInt32(reader["Id"]);
                HealthFacilitiesId = Convert.ToString(reader["HealthFacilitiesId"]);
            }

            reader.Close();

            if (Id != 0 && (HealthFacilitiesId == "" || Convert.ToInt32(HealthFacilitiesId) == sms.HealthFacilitiesId))
                return StatusCode(406, _excep.Throw(406, "Tạo mẫu tin nhắn không thành công.", "Tên mẫu tin nhắn đã tồn t" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "" +
                    "ại !"));

            if (_context.Query<SmsTemplate>().Where(g => g.SmsContent == sms.SmsContent && ((g.CreateUserId == sms.CreateUserId) || (g.CreateUserId == 1)) && sms.IsDelete == false).Count() > 0)
                return StatusCode(406, _excep.Throw(406, "Tạo mẫu tin nhắn không thành công.", "Nội dung tin nhắn đã tồn tại !"));

            return Json(new ActionResultDto { Result = _context.Insert(new SmsTemplate(sms)) });
        }

        [HttpPut]
        [Route("api/sms-templates")]
        public IActionResult Update([FromBody] SmsTemplateInputViewModel sms)
        {
            try
            {
                _context.Session.BeginTransaction();

                var nameCurrentTemplate = _context.Query<SmsTemplate>().Where(g => g.Id == sms.Id).Select(g => g.SmsTemplateName).FirstOrDefault();

                if (sms.SmsTemplateName != nameCurrentTemplate)
                {
                    string sql = $"SELECT * FROM {nameData}.sms_template where BINARY SmsTemplateName = '{sms.SmsTemplateName}' and {sms.IsDelete} = false";
                    //if (sms.HealthFacilitiesId != null)
                    //{
                    //    sql = sql + $" and (HealthFacilitiesId = {sms.HealthFacilitiesId} or HealthFacilitiesId = null)";
                    //}

                    List<string> clause = new List<string>();
                    List<DbParam> param = new List<DbParam>();
                    var str = $"{sql} {string.Join(" ", clause)}";
                    var reader = _context.Session.ExecuteReader($"{sql} {string.Join(" ", clause)}", param);

                    var HealthFacilitiesId = "";
                    var Id = 0;

                    List<SmsTemplate> lst = new List<SmsTemplate>();
                    while (reader.Read())
                    {
                        Id = Convert.ToInt32(reader["Id"]);
                        HealthFacilitiesId = Convert.ToString(reader["HealthFacilitiesId"]);
                    }

                    reader.Close();

                    if (Id != 0 && (HealthFacilitiesId == "" || Convert.ToInt32(HealthFacilitiesId) == sms.HealthFacilitiesId))
                        return StatusCode(406, _excep.Throw(406, "Sửa mẫu tin nhắn không thành công.", "Tên mẫu tin nhắn đã tồn t" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "" +
                            "ại !"));
                }

                if (_context.Query<SmsTemplate>().Where(g => g.SmsContent == sms.SmsContent && g.Id != sms.Id && sms.IsDelete == false).Count() > 0)
                    return StatusCode(406, _excep.Throw(406, "Sửa mẫu tin nhắn không thành công.", "Nội dung tin nhắn đã tồn tại !"));

                //if (_context.Query<SmsLogs>().Where(g => g.SmsTemplateId == sms.Id && g.Status == 1).Count() > 0)
                //    return StatusCode(500, _excep.Throw("Sửa mẫu tin nhắn không thành công.", "Mẫu tin nhắn đã được sử dụng !"));

                _context.Update<SmsTemplate>(g => g.Id == sms.Id, a => new SmsTemplate
                {
                    SmsTemplateName = sms.SmsTemplateName,
                    MessageType = sms.MessageType,
                    SmsContent = sms.SmsContent,
                    IsActive = sms.IsActive,
                    ApplyAllSystem = sms.ApplyAllSystem,

                    UpdateDate = DateTime.Now,
                    UpdateUserId = sms.UserId
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

        [HttpDelete]
        [Route("api/sms-templates")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (_context.Query<SmsLogs>().Where(g => g.SmsTemplateId == id && g.Status == 1).Count() > 0)
                    return StatusCode(406, _excep.Throw(406, "Xóa mẫu tin nhắn không thành công.", "Mẫu tin nhắn đã được sử dụng !"));
                _context.Session.BeginTransaction();

                //_context.Delete<SmsTemplate>(g => g.Id == id);
                _context.Update<SmsTemplate>(t => t.Id == id, a => new SmsTemplate
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