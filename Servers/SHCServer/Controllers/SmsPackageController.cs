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
    public class SmsPackageController : BaseController
    {
        private readonly string _connectionString;

        public SmsPackageController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();

            //Mapper.Reset();
            //Mapper.Initialize(config => config.CreateMap<UserInputViewModel, User>().ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)));
        }

        [HttpGet]
        [Route("api/smspackages")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<SmsPackage>().Where(o => o.IsDelete == 0);

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
                    if (string.Equals(key, "status") && value != "2" && value != null) objs = objs.Where(o => o.Status == int.Parse(value));
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
            if (_context.Query<SmsPackage>().Where(g => g.Name == package.Name && g.IsDelete == 0).Count() > 0)
            {
                //return Json(new ActionResultDto { Success = false, Error = new { Code = 401, Message = "Tạo gói thất bại.", Details = "Gói SMS đã tồn tại!" } });
                return StatusCode(500, _excep.Throw("Tạo gói thất bại.", "Gói SMS đã tồn tại!"));
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
                //    return StatusCode(500, _excep.Throw("Sửa gói thất bại.", "Gói SMS đang được sử dụng!"));
                //}
                if (_context.Query<SmsPackage>().Where(p => p.Name == package.Name && p.Id != package.Id && p.IsDelete == 0).Count() > 0)
                {
                    //return Json(new ActionResultDto { Success = false, Error = new { Code = 401, Message = "Chỉnh sửa gói thất bại.", Details = "Gói SMS đã tồn tại!" } });
                    return StatusCode(500, _excep.Throw("Sửa gói thất bại.", "Gói SMS đã tồn tại!"));
                }

                _context.Session.BeginTransaction();

                _context.Update<SmsPackage>(p => p.Id == package.Id, a => new SmsPackage {
                    Name = package.Name,
                    Description = package.Description,
                    Quantity = package.Quantity,
                    Cost = package.Cost,
                    Status = package.Status
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
                if (_context.Query<SmsPackagesDistribute>().Where(pd => pd.SmsPackageId == id).Count() > 0)
                {
                    return StatusCode(500, _excep.Throw("Xóa gói thất bại.", "Gói SMS đang được sử dụng!"));
                }

                _context.Session.BeginTransaction();

                //_context.Delete<SmsPackageDetail>(pd => pd.SmsPackageId == id);

                //_context.Delete<SmsPackage>(p => p.Id == id);

                _context.Update<SmsPackage>(t => t.Id == id, a => new SmsPackage
                {
                    IsDelete = 1
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