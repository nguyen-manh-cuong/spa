using Microsoft.AspNetCore.Http;
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
        private readonly IHttpContextAccessor httpContextAccessor;
        public CategoryCommonController(IOptions<Audience> settings, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _contextmdmdb = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
            this.httpContextAccessor = httpContextAccessor;
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
                    {
                        var s = value.Replace(@"%", "\\%").Replace(@"_", "\\_").Trim();
                        objs = objs.Where(o => o.Name.Contains(s));
                    }

                    if (string.Equals(key, "id"))
                        objs = objs.Where(o => o.Id.ToString().Contains(value.Trim()));

                    if (string.Equals(key, "isActive"))
                    {
                        objs = objs.Where(o => o.IsActive == Convert.ToBoolean(value.Trim()));
                    }
                    //if (string.Equals(key, "max"))
                    //{
                    //    maxResultCount = 300;
                    //}
                }
            }

            if (sorting != null)
            {
                foreach (var (key, value) in  JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<CategoryCommon>(key))
                        continue;
                    if (string.Equals(key, "name"))
                    {
                        objs = objs.OrderBy(o => o.Name);
                    }
                    if (string.Equals(key, "id"))
                    {
                        objs = objs.OrderByDesc(o => o.Code).OrderByDesc(o => o.CreateDate);
                    }
                }
            }
            else
            {
                objs = objs.OrderByDesc(o => o.Code).OrderByDesc(o => o.CreateDate);
            }

            Utils.Log(
                _contextmdmdb,
                "Business",
                2,
                GetCurrentUserId(),
                GetIpClient(),
                "/app/category-common",
                "Lấy dữ liệu",
                new { Filter = filter, Sorting = sorting },
                "Chuyên khoa",
                "Lấy danh sách chuyên khoa",
                true,
                GetHealthFacilitiesId(_contextmdmdb,6));

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
                    Utils.Log(
                        _contextmdmdb,
                        "Business",
                        2,
                        GetCurrentUserId(),
                        GetIpClient(),
                        "/app/category-common",
                        "Tạo mới",
                        categoryCommon,
                        "Chuyên khoa",
                        "Tạo mới chuyên khoa",
                        false,
                        GetHealthFacilitiesId(_contextmdmdb, GetCurrentUserId()));
                    return StatusCode(406, _excep.Throw(406, "Tạo không thành công !", "Mã chuyên khoa đã tồn tại"));
                }

                _context.Session.CommitTransaction();

                Utils.Log(
                    _contextmdmdb,
                    "Business",
                    2,
                    GetCurrentUserId(),
                    GetIpClient(),
                    "/app/category-common",
                    "Tạo mới",
                    categoryCommon,
                    "Chuyên khoa",
                    "Tạo mới chuyên khoa",
                    true,
                    GetHealthFacilitiesId(_contextmdmdb, GetCurrentUserId()));

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

                Utils.Log(
                    _contextmdmdb,
                    "Business",
                    2,
                    GetCurrentUserId(),
                    GetIpClient(),
                    "/app/category-common",
                    "Tạo mới",
                    categoryCommon,
                    "Chuyên khoa",
                    "Tạo mới chuyên khoa",
                    true,
                    GetHealthFacilitiesId(_contextmdmdb, GetCurrentUserId()));

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

                Utils.Log(
                    _contextmdmdb,
                    "Business",
                    2,
                    GetCurrentUserId(),
                    GetIpClient(),
                    "/app/category-common",
                    "Tạo mới",
                    new {Id=id },
                    "Chuyên khoa",
                    "Tạo mới chuyên khoa",
                    true,
                    GetHealthFacilitiesId(_contextmdmdb, GetCurrentUserId()));

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