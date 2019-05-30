using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer.Models;
using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class SmsPackageController : BaseController
    {
        private readonly string _connectionString;

        public SmsPackageController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/smspackages")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<SmsPackage>().Where(o => o.IsDelete == false);

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value)) continue;
                    if (string.Equals(key, "packagesNameDescription"))
                    {
                        var query = value.Replace(@"%", "\\%").Replace(@"_", "\\_").Trim();
                        objs = objs.Where(o => o.Name.Contains(query) || o.Description.Contains(query));
                    };
                    if (string.Equals(key, "status") && value != "2" && value != null) objs = objs.Where(o => o.IsActive == (value == "1" ? true : false));
                }
            }

            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<SmsPackage>(key)) continue;

                    objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.OrderByDesc(p => p.Id).TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).Select(p => new SmsPackageViewModel(p, _connectionString)).ToList(), TotalCount = objs.Count() } });
        }

        [HttpPost]
        [Route("api/smspackages")]
        public IActionResult Create([FromBody] PackageInputViewModel package)
        {
            package.Name = package.Name.Trim();

            for (int i = 0; i < package.Name.Length + 1; i++)
            {
                package.Name = package.Name.Replace("  ", " ");
            }

            package.Description = package.Description.Trim();

            for (int i = 0; i < package.Description.Length + 1; i++)
            {
                package.Description = package.Description.Replace("  ", " ");
            }

            if (_context.Query<SmsPackage>().Where(g => g.Name == package.Name && g.IsDelete == false).Count() > 0)
            {
                //return Json(new ActionResultDto { Success = false, Error = new { Code = 401, Message = "Tạo gói không thành công.", Details = "Gói SMS đã tồn tại!" } });
                return StatusCode(406, _excep.Throw(406, "Tạo gói không thành công.", "Gói SMS đã tồn tại!"));
            }

            var packageResult = new ActionResultDto { Result = _context.Insert(new SmsPackage(package)) };

            if (packageResult.Error == null)
            {
                List<SmsPackageDetail> listPackageDetail = new List<SmsPackageDetail>();

                foreach (PackageDetailInputViewModel element in package.Details)
                {
                    SmsPackageDetail packagesDetail = new SmsPackageDetail();
                    packagesDetail.SmsFrom = element.SmsFrom;
                    packagesDetail.SmsTo = element.SmsTo;
                    packagesDetail.Cost = element.Cost;
                    packagesDetail.SmsPackageId = packageResult.Result.Id;
                    packagesDetail.CreateDate = DateTime.Now;
                    packagesDetail.CreateUserId = package.UserId;
                    packagesDetail.UpdateDate = DateTime.Now;
                    packagesDetail.UpdateUserId = package.UserId;

                    listPackageDetail.Add(packagesDetail);
                }

                _context.InsertRange(listPackageDetail);
            }

            return Json(new ActionResultDto { Result = packageResult });
        }

        [HttpPut]
        [Route("api/smspackages")]
        public IActionResult Update([FromBody] PackageInputViewModel package)
        {
            try
            {
                //if (_context.Query<SmsPackagesDistribute>().Where(pd => pd.SmsPackageId == package.Id).Count() > 0)
                //{
                //    return StatusCode(500, _excep.Throw("Sửa gói không thành công.", "Gói SMS đang được sử dụng!"));
                //}
                if (_context.Query<SmsPackage>().Where(p => p.Name == package.Name && p.Id != package.Id && p.IsDelete == false).Count() > 0)
                {
                    //return Json(new ActionResultDto { Success = false, Error = new { Code = 401, Message = "Chỉnh sửa gói không thành công.", Details = "Gói SMS đã tồn tại!" } });
                    return StatusCode(406, _excep.Throw(406, "Sửa gói không thành công.", "Gói SMS đã tồn tại!"));
                }

                _context.Session.BeginTransaction();

                _context.Update<SmsPackage>(p => p.Id == package.Id, a => new SmsPackage
                {
                    Name = package.Name,
                    Description = package.Description,
                    Quantity = package.Quantity,
                    Cost = package.Cost,
                    IsActive = package.IsActive,

                    UpdateDate = DateTime.Now,
                    UpdateUserId = package.UserId
                });

                List<SmsPackageDetail> listPackageDetail = new List<SmsPackageDetail>();
                int Id = package.Id ?? default(int);

                _context.Delete<SmsPackageDetail>(pd => pd.SmsPackageId == package.Id);

                foreach (PackageDetailInputViewModel element in package.Details)
                {
                    SmsPackageDetail packagesDetail = new SmsPackageDetail();
                    packagesDetail.SmsFrom = element.SmsFrom;
                    packagesDetail.SmsTo = element.SmsTo;
                    packagesDetail.Cost = element.Cost;
                    packagesDetail.SmsPackageId = Id;
                    packagesDetail.CreateDate = DateTime.Now;
                    packagesDetail.CreateUserId = package.UserId;
                    packagesDetail.UpdateDate = DateTime.Now;
                    packagesDetail.UpdateUserId = package.UserId;

                    listPackageDetail.Add(packagesDetail);
                }

                _context.InsertRange(listPackageDetail);
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
        [Route("api/smspackages")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (_context.Query<SmsPackagesDistribute>().Where(pd => pd.SmsPackageId == id && pd.IsDelete == false).Count() > 0)
                {
                    return StatusCode(406, _excep.Throw(406, "Xóa gói không thành công.", "Gói SMS đang được sử dụng!"));
                }

                _context.Session.BeginTransaction();

                //_context.Delete<SmsPackageDetail>(pd => pd.SmsPackageId == id);

                //_context.Delete<SmsPackage>(p => p.Id == id);

                _context.Update<SmsPackage>(t => t.Id == id, a => new SmsPackage
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