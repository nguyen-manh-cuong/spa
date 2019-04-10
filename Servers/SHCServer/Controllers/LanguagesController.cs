using System;
using System.Collections.Generic;
using SHCServer.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class LanguagesController : BaseController
    {
        private readonly string _connectionString;

        public LanguagesController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(_connectionString));
        }

        [HttpGet]
        [Route("api/languages")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<Language>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (!Utils.PropertyExists<Language>(key)) continue;

                    if (string.Equals(key, "key")) objs = objs.Where(o => o.Key.Contains(value));
                    if (string.Equals(key, "page")) objs = objs.Where(o => o.Page.Contains(value));
                    if (string.Equals(key, "vi")) objs = objs.Where(o => o.Vi.Contains(value));
                    if (string.Equals(key, "en")) objs = objs.Where(o => o.En.Contains(value));
                }
            }

            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<Language>(key)) continue;

                    objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Count() } });
        }

        [HttpPut]
        [Route("api/languages")]
        public IActionResult Update([FromBody] LanguageInputViewModel obj)
        {
            try
            {
                _context.Session.BeginTransaction();

                _context.Update<Language>(g => g.Id == obj.Id, a => new Language { Key = obj.Key, Page = obj.Page, Vi = obj.Vi, En = obj.En });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction) _context.Session.RollbackTransaction();
                return Json(new ActionResultDto { Error = e.Message });
            }
        }

        [HttpPost]
        [Route("api/languages")]
        public IActionResult Create([FromBody] LanguageInputViewModel obj)
        {
            if (_context.Query<Language>().Where(g => g.Key == obj.Key).Count() > 0) return Json(new ActionResultDto { Success = false, Error = new { Code = 401, Message = "Tạo ngôn ngữ thất bại.", Details = "Tên từ khoá đã có !" } });
            return Json(new ActionResultDto { Result = _context.Insert(new Language(obj)) });
        }

        [HttpDelete]
        [Route("api/languages")]
        public IActionResult Delete(int id)
        {
            try
            {
                _context.Session.BeginTransaction();

                _context.Delete<Language>(g => g.Id == id);

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

    public class LanguageInputViewModel
    {
        public int? Id { set; get; }
        public string Key { set; get; }
        public string Page { set; get; }
        public string Vi { set; get; }
        public string En { set; get; }

        public static explicit operator int(LanguageInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}