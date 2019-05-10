using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer.Models;
using System;
using System.Collections.Generic;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class CategoryCommonController : BaseController
    {
        private readonly string _connectionString;

        public CategoryCommonController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/catcommon")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<CategoryCommon>().Where(o => o.Type == "CHUYENKHOA" && o.IsDelete == false);

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;

                    if (string.Equals(key, "code"))
                        objs = objs.Where(o => o.Code.Contains(value.Trim()));

                    if (string.Equals(key, "name"))
                        objs = objs.Where(o => o.Name.Contains(value.Trim()));

                    if (string.Equals(key, "id"))
                        objs = objs.Where(o => o.Id.ToString().Contains(value.Trim()));
                    if (string.Equals(key, "max"))
                    {
                        maxResultCount = 300;
                    }
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
            //else
            //{
            objs = objs.OrderByDesc(o => o.Code).OrderByDesc(o => o.CreateDate);
            //}

            return Json(new ActionResultDto()
            {
                Result = new
                {
                    Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(),
                    TotalCount = objs.Count()
                }
            });
        }

        [HttpPost]
        [Route("api/catcommon")]
        public IActionResult Create([FromBody] CategoryCommon categoryCommon)
        {
            try
            {
                _context.Session.BeginTransaction();
                var cc = _context.Query<CategoryCommon>().Where(c => c.Code.Equals(categoryCommon.Code)).FirstOrDefault();
                if (cc == null)
                {
                    _context.Insert(() => new CategoryCommon
                    {
                        Name = categoryCommon.Name,
                        Code = categoryCommon.Code,
                        IsActive = categoryCommon.IsActive,
                        Type = "CHUYENKHOA",
                        CreateDate = DateTime.Now,
                        CreateUserId = categoryCommon.CreateUserId,
                        UpdateDate = DateTime.Now,
                        UpdateUserId = categoryCommon.UpdateUserId
                    });
                }
                else
                {
                    return StatusCode(422, _excep.Throw("Tạo không thành công !", "Mã chuyên khoa đã tồn tại"));
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

        [HttpPut]
        [Route("api/catcommon")]
        public IActionResult Update([FromBody] CategoryCommon categoryCommon)
        {
            var cc = _context.Query<CategoryCommon>().Where(c => c.Id == categoryCommon.Id).FirstOrDefault();

            if (cc == null)
                return StatusCode(404, _excep.Throw("Not Found"));

            try
            {
                //var ccc = _context.Query<CategoryCommon>().Where(c => c.Code == categoryCommon.Code).FirstOrDefault();

                //if(ccc!=null) Duplicate Cat.Code
                _context.Session.BeginTransaction();

                _context.Update<CategoryCommon>(c => c.Id == categoryCommon.Id, x => new CategoryCommon()
                {
                    Code = categoryCommon.Code,
                    Name = categoryCommon.Name,
                    IsActive = categoryCommon.IsActive,
                    UpdateDate = DateTime.Now,
                    UpdateUserId = categoryCommon.UpdateUserId,
                });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                {
                    _context.Session.RollbackTransaction();
                }
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra", e.Message));
            }
        }

        [HttpDelete]
        [Route("api/catcommon")]
        public IActionResult Delete(int id)
        {
            var cc = _context.Query<CategoryCommon>().Where(c => c.Id == id).FirstOrDefault();

            if (cc == null)
                return StatusCode(404, _excep.Throw("Not Found"));
            try
            {
                _context.Session.BeginTransaction();

                _context.Update<CategoryCommon>(c => c.Id == id, x => new CategoryCommon()
                {
                    IsDelete = true,
                });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                {
                    _context.Session.RollbackTransaction();
                }
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra", e.Message));
            }
        }
    }
}