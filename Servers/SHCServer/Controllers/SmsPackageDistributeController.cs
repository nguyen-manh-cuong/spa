using Microsoft.AspNetCore.Mvc;
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
    public class SmsPackageDistributeController : BaseController
    {
        private readonly string _connectionString;

        protected DbContext context;

        public SmsPackageDistributeController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(_connectionString));
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/smspackagedistribute")]
        public IActionResult GetAllPackageDistribute(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<SmsPackagesDistribute>().Where(o => o.IsDelete == false && o.HealthFacilitiesId != 0);

            int monthStart = 0;
            int monthEnd = 0;
            string toYear = "";
            string fromYear = "";

            var filters = JsonConvert.DeserializeObject<Filter>(filter);
            filters.toYear = filters.toYear.Trim();
            filters.fromYear = filters.fromYear.Trim();
            //query
            if (filters.toYear != "" && Convert.ToInt32(filters.toYear) > 0) toYear = filters.toYear;
            if (filters.fromYear != "" && Convert.ToInt32(filters.fromYear) > 0) fromYear = filters.fromYear;
            if (filters.monthStart != 13 && filters.monthStart > 0) monthStart = filters.monthStart;
            if (filters.monthEnd != 13 && filters.monthEnd > 0) monthEnd = filters.monthEnd;
            if (monthStart > 0)
            {
                objs = objs.Where(o => o.MonthStart >= monthStart);
            }
            if (monthEnd > 0)
            {
                objs = objs.Where(o => o.MonthEnd <= monthEnd);
            }
            if (toYear != null && toYear != "")
            {
                objs = objs.Where(o => o.YearEnd <= int.Parse(toYear));
            }
            if (fromYear != null && fromYear != "")
            {
                objs = objs.Where(o => o.YearStart >= int.Parse(fromYear));
            }

            if (filters.Status != null && filters.Status != 2) objs = objs.Where(o => o.IsActive == (filters.Status == 1 ? true : false));

            if (filters.HealthFacilitiesId != null)
                if (filters.HealthFacilitiesId.Count != 0)
                    objs = objs.Where(p => filters.HealthFacilitiesId.Contains(p.HealthFacilitiesId));

            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<SmsPackagesDistribute>(key)) continue;
                    objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
                }
            }


            var rs = objs.OrderByDesc(p => p.Id)
                .Select(p => new PackageDistributeViewModel(p, _connectionString) {
                    Amount = objs.Where(o => o.HealthFacilitiesId == p.HealthFacilitiesId && o.SmsBrandsId == p.SmsBrandsId && o.SmsPackageId == p.SmsPackageId
                    && o.YearEnd == p.YearEnd && o.MonthEnd == p.MonthEnd && o.YearStart == p.YearStart).Count(),

             });

            return Json(new ActionResultDto { Result = new { Items = rs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = rs.Count() } });
        }

        [HttpPost]
        [Route("api/smspackagedistribute")]
        public IActionResult CreatePackageDistribute([FromBody] PackageDistributeInputViewModelArray obj)
        {
            var package = _context.Query<SmsPackage>().Where(g => g.Id == obj.SmsPackageId && g.IsDelete == false).FirstOrDefault();
            if (package == null) return StatusCode(406, _excep.Throw(406, "Gói SMS đã chọn không tồn tại."));

            List<SmsPackagesDistribute> lstPD = new List<SmsPackagesDistribute>();
            List<SmsPackageUsed> lstPU = new List<SmsPackageUsed>();

            //GetTotal(string.Concat(obj.MonthStart, "/", obj.YearStart), string.Concat(obj.MonthEnd, "/", obj.YearEnd));

            for (int i = 0; i < obj.HealthFacilitiesId.Count; i++)
            {
                SmsPackagesDistribute pd = new SmsPackagesDistribute();
                pd.HealthFacilitiesId = obj.HealthFacilitiesId[i];
                pd.MonthStart = obj.MonthStart;
                pd.MonthEnd = obj.MonthEnd;
                pd.YearStart = obj.YearStart;
                pd.YearEnd = obj.YearEnd;
                pd.IsActive = obj.IsActive;
                pd.SmsPackageId = obj.SmsPackageId;
                pd.SmsBrandsId = obj.SmsBrandsId;
                pd.CreateDate = DateTime.Now;
                pd.CreateUserId = obj.UserId;

                SmsPackageUsed pu = new SmsPackageUsed();
                pu.SmsPackageId = obj.SmsPackageId;
                pu.HealthFacilitiesId = obj.HealthFacilitiesId[i];
                pu.Quantityused = package.Quantity;
                pu.CreateDate = DateTime.Now; 
                pu.CreateUserId = obj.UserId;

                //if (_context.Query<SmsPackagesDistribute>().Where(g => g.HealthFacilitiesId == pd.HealthFacilitiesId && g.SmsPackageId == obj.SmsPackageId && g.IsDelete == false).Count() > 0)
                //{
                //    var healthFacilities = _context.Query<HealthFacilities>().Where(h => h.HealthFacilitiesId == pd.HealthFacilitiesId).FirstOrDefault();
                //    return StatusCode(500, _excep.Throw("Đăng ký gói không thành công.", (healthFacilities != null ? healthFacilities.Name : "") + " đã đăng ký gói SMS."));
                //}

                //add
                lstPU.Add(pu);
                lstPD.Add(pd);
            }

            try
            {
                _context.InsertRange(lstPU);
                _context.InsertRange(lstPD);
                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                return Json(new ActionResultDto { Error = e.Message });
            }
        }

        [HttpPut]
        [Route("api/smspackagedistribute")]
        public IActionResult UpdatePackageDistribute([FromBody] PackageDistributeInputViewModel obj)
        {
            try
            {
                //if (_context.Query<SmsLogs>().Where(pd => pd.SmsPackagesDistributeId == obj.Id && pd.Status == 1).Count() > 0)
                //{
                //    return StatusCode(500, _excep.Throw("Sửa gói không thành công.", "Gói SMS đang được sử dụng!"));
                //}

                _context.Session.BeginTransaction();
                _context.Update<SmsPackagesDistribute>(g => g.Id == obj.Id, a => new SmsPackagesDistribute
                {
                    HealthFacilitiesId = obj.HealthFacilitiesId,
                    MonthEnd = obj.MonthEnd,
                    MonthStart = obj.MonthStart,
                    YearStart = obj.YearStart,
                    YearEnd = obj.YearEnd,
                    IsActive = obj.IsActive,

                    UpdateDate = DateTime.Now,
                    UpdateUserId = obj.UserId
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
        [Route("api/smspackagedistribute")]
        public IActionResult DeletePackageDistribute(int id)
        {
            try
            {
                //if (_context.Query<SmsLogs>().Where(pd => pd.SmsPackagesDistributeId == id && pd.Status == 1).Count() > 0)
                //{
                //    return StatusCode(500, _excep.Throw("Xóa gói không thành công.", "Gói SMS đang được sử dụng!"));
                //}
                _context.Session.BeginTransaction();

                //_context.Delete<SmsPackagesDistribute>(g => g.Id == id);

                _context.Update<SmsPackagesDistribute>(t => t.Id == id, a => new SmsPackagesDistribute
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

        public int GetTotal(string startDate, string endDate)
        {
            string query = @"SELECT count(*) as Total
                                FROM smarthealthcare.sms_packages_distribute 
                                WHERE 
	                                STR_TO_DATE(CONCAT(MonthStart, '/', YearStart), '%m/%Y') >= STR_TO_DATE(@StartDate, '%m/%Y') AND
                                    STR_TO_DATE(CONCAT(MonthEnd, '/', YearEnd), '%m/%Y') <= STR_TO_DATE(@EndDate, '%m/%Y')";

            List<DbParam> param = new List<DbParam>();
            param.Add(DbParam.Create("@StartDate", startDate));
            param.Add(DbParam.Create("@EndDate", endDate));

            var reader = _context.Session.ExecuteReader(query, param);
            int total = 0;

            while (reader.Read())
            {
                total = Convert.ToInt32(reader["Total"]);
            }
            reader.Close();

            return total;
        }
    }

    public class Filter
    {
        [JsonProperty("monthStart")]
        public int monthStart { get; set; }

        [JsonProperty("monthEnd")]
        public int monthEnd { get; set; }

        [JsonProperty("toYear")]
        public string toYear { get; set; }

        [JsonProperty("fromYear")]
        public string fromYear { get; set; }

        [JsonProperty("HealthFacilitiesId")]
        public List<int> HealthFacilitiesId { get; set; }

        [JsonProperty("Status")]
        public int? Status { get; set; }
    }
}