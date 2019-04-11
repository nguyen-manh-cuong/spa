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
    public class DoctorController : BaseController
    {
        private readonly string _connectionString;

        public DoctorController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/doctor")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();
            List<DoctorViewModel> doctorList = new List<DoctorViewModel>();

            string doctorJoinSpecialistHealth = @"SELECT
                                            d.DoctorId,
                                            AcademicId,
                                            Address,
                                            AllowBooking,
                                            AllowFilter,
                                            AllowSearch,
                                            Avatar,
                                            BirthDate,
                                            BirthMonth,
                                            BirthYear,
                                            CertificationCode,
                                            CertificationDate,
                                            DegreeId,Description,
                                            DistrictCode,
                                            ProvinceCode,
                                            EducationCountryCode,
                                            Email,
                                            EthnicityCode,
                                            FullName,
                                            Gender,
                                            HisId,
                                            IsActive,
                                            IsSync,
                                            NationCode,
                                            PhoneNumber,
                                            PositionCode,
                                            PriceDescription,
                                            PriceFrom,
                                            PriceTo,
                                            Summary,
                                            TitleCode,
                                            SpecialistCode,
                                            HealthFacilitiesId
                                            FROM smarthealthcare.cats_doctors d
                                            INNER JOIN smarthealthcare.cats_doctors_specialists ds
                                            ON d.DoctorId = ds.DoctorId
                                            INNER JOIN smarthealthcare.cats_healthfacilities_doctors hd
                                            ON d.DoctorId = hd.DoctorId
                                            WHERE 1 = 1 AND d.IsDelete = 0 AND ds.IsDelete=0 ";
            string doctorJoinSpecialist = @"SELECT
                                            d.DoctorId,
                                            AcademicId,
                                            Address,
                                            AllowBooking,
                                            AllowFilter,
                                            AllowSearch,
                                            Avatar,
                                            BirthDate,
                                            BirthMonth,
                                            BirthYear,
                                            CertificationCode,
                                            CertificationDate,
                                            DegreeId,Description,
                                            DistrictCode,
                                            ProvinceCode,
                                            EducationCountryCode,
                                            Email,
                                            EthnicityCode,
                                            FullName,
                                            Gender,
                                            HisId,
                                            IsActive,
                                            IsSync,
                                            NationCode,
                                            PhoneNumber,
                                            PositionCode,
                                            PriceDescription,
                                            PriceFrom,
                                            PriceTo,
                                            Summary,
                                            TitleCode,
                                            SpecialistCode
                                            FROM smarthealthcare.cats_doctors d
                                            INNER JOIN smarthealthcare.cats_doctors_specialists ds
                                            ON d.DoctorId = ds.DoctorId
                                            WHERE 1 = 1 AND d.IsDelete = 0 AND ds.IsDelete=0 ";
            int query = 0;

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;
                    if (string.Equals(key, "doctorId"))
                    {
                        clause.Add("AND d.DoctorId=@DoctorId");
                        param.Add(DbParam.Create("@DoctorId", value.Trim()));
                        query = 2;
                    }
                    if (string.Equals(key, "provinceCode"))
                    {
                        clause.Add("AND d.ProvinceCode=@ProvinceCode");
                        param.Add(DbParam.Create("@ProvinceCode", value.Trim()));
                    }
                    if (string.Equals(key, "districtCode"))
                    {
                        clause.Add("AND d.DistrictCode=@DistrictCode");
                        param.Add(DbParam.Create("@DistrictCode", value.Trim()));
                    }
                    if (string.Equals(key, "healthFacilitiesId"))
                    {
                        clause.Add("AND hd.HealthFacilitiesId=@HealthFacilitiesId");
                        param.Add(DbParam.Create("@HealthFacilitiesId", value.Trim()));
                        query = 1;
                    }
                    if (string.Equals(key, "specialistCode"))
                    {
                        clause.Add("AND ds.SpecialistCode=@SpecialistCode");
                        param.Add(DbParam.Create("@SpecialistCode", value.Trim()));
                    }
                    if (string.Equals(key, "fullNameOrPhone"))
                    {
                        clause.Add("AND d.FullName like '%' @FullNameOrPhone '%' OR d.PhoneNumber like '%' @FullNameOrPhone");
                        param.Add(DbParam.Create("@fullNameOrPhone", value.Trim()));
                    }
                }
            }

            if (query == 0 || query == 1)
            {
                clause.Add(" GROUP BY d.DoctorId ORDER BY d.FullName,d.CreateDate DESC LIMIT @skipCount, @resultCount");
            }

            param.Add(DbParam.Create("@skipCount", skipCount * maxResultCount));
            param.Add(DbParam.Create("@resultCount", maxResultCount));

            var str = "";

            if (query == 0)
            {
                str = $"{doctorJoinSpecialist} {string.Join(" ", clause)}";
            }

            if (query == 1 || query == 2)
            {
                str = $"{doctorJoinSpecialistHealth} {string.Join(" ", clause)}";
            }

            var reader = _context.Session.ExecuteReader(str, param);

            while (reader.Read())
            {
                doctorList.Add(new DoctorViewModel()
                {
                    AcademicId = reader["AcademicId"] != DBNull.Value ? Convert.ToInt32(reader["AcademicId"]) : 0,
                    Address = reader["Address"].ToString(),
                    AllowBooking = Convert.ToInt16(reader["AllowBooking"]) == 0 ? false : true,
                    AllowFilter = Convert.ToInt16(reader["AllowFilter"]) == 0 ? false : true,
                    AllowSearch = Convert.ToInt16(reader["AllowSearch"]) == 0 ? false : true,
                    Avatar = reader["Avatar"].ToString(),
                    BirthDate = reader["BirthDate"] != DBNull.Value ? Convert.ToInt16(reader["BirthDate"]) : 0,
                    BirthMonth = reader["BirthDate"] != DBNull.Value ? Convert.ToInt16(reader["BirthMonth"]) : 0,
                    BirthYear = Convert.ToInt16(reader["BirthYear"]),
                    CertificationCode = reader["CertificationCode"].ToString(),
                    CertificationDate = reader["CertificationDate"] != DBNull.Value ? Convert.ToDateTime(reader["CertificationDate"]) : Convert.ToDateTime("0001-01-01T01:01:01"),
                    DegreeId = reader["DegreeId"] != DBNull.Value ? Convert.ToInt16(reader["DegreeId"]) : 0,
                    Description = reader["Description"].ToString(),
                    DistrictCode = reader["DistrictCode"].ToString(),
                    ProvinceCode = reader["ProvinceCode"].ToString(),
                    EducationCountryCode = reader["EducationCountryCode"].ToString(),
                    Email = reader["Email"].ToString(),
                    EthnicityCode = reader["EthnicityCode"].ToString(),
                    FullName = reader["FullName"].ToString(),
                    Gender = Convert.ToInt16(reader["Gender"]),
                    HisId = reader["HisId"].ToString(),
                    IsActive = Convert.ToInt16(reader["IsActive"]) == 0 ? false : true,
                    IsSync = Convert.ToInt16(reader["IsSync"]) == 0 ? false : true,
                    NationCode = reader["NationCode"].ToString(),
                    PhoneNumber = reader["PhoneNumber"].ToString(),
                    PositionCode = reader["PositionCode"].ToString(),
                    PriceDescription = reader["PriceDescription"].ToString(),
                    PriceFrom = reader["PriceFrom"] != DBNull.Value ? Convert.ToInt32(reader["PriceFrom"]) : 0,
                    PriceTo = reader["PriceTo"] != DBNull.Value ? Convert.ToInt32(reader["PriceTo"]) : 0,
                    Summary = reader["Summary"].ToString(),
                    TitleCode = reader["TitleCode"].ToString(),
                    HealthFacilitiesId=reader["HealthFacilitiesId"] !=DBNull.Value?Convert.ToInt32(reader["HealthFacilitiesId"]):0
                });
            }

            return Json(new ActionResultDto()
            {
                Result = new
                {
                    Items = doctorList,
                    TotalCount = doctorList.Count
                }
            });
        }

        [HttpPost]
        [Route("api/doctor")]
        public IActionResult Create([FromBody] DoctorViewModel doctor)
        {
            try
            {
                _context.Session.BeginTransaction();

                _context.Insert(() => new Doctor()
                {
                    AcademicId = doctor.AcademicId,
                    Address = doctor.Address,
                    AllowBooking = doctor.AllowBooking,
                    AllowFilter = doctor.AllowFilter,
                    AllowSearch = doctor.AllowSearch,
                    Avatar = doctor.Avatar,
                    BirthDate = doctor.BirthDate,
                    BirthMonth = doctor.BirthMonth,
                    BirthYear = doctor.BirthYear,
                    CertificationCode = doctor.CertificationCode,
                    CertificationDate = doctor.CertificationDate,
                    CreateUserId = doctor.CreateUserId,
                    DegreeId = doctor.DegreeId,
                    Description = doctor.Description,
                    DistrictCode = doctor.DistrictCode,
                    EducationCountryCode = doctor.EducationCountryCode,
                    Email = doctor.Email,
                    EthnicityCode = doctor.EthnicityCode,
                    FullName = doctor.FullName,
                    Gender = doctor.Gender,
                    HisId = doctor.HisId,
                    NationCode = doctor.NationCode,
                    PhoneNumber = doctor.PhoneNumber,
                    PositionCode = doctor.PositionCode,
                    PriceDescription = doctor.PriceDescription,
                    PriceFrom = doctor.PriceFrom,
                    PriceTo = doctor.PriceTo,
                    ProvinceCode = doctor.ProvinceCode,
                    Summary = doctor.Summary,
                    UpdateDate = DateTime.Now,
                    UpdateUserId = doctor.UpdateUserId,
                    TitleCode = doctor.TitleCode,
                });

                foreach(var item in doctor.Specialist)
                {
                    _context.Insert(() => new DoctorSpecialists()
                    {
                        DoctorId = doctor.DoctorId,
                        SpecialistCode = item.SpecialistCode
                    });
                }

                if(doctor.HealthFacilitiesId!=null)
                {
                    _context.Insert(() => new HealthFacilitiesDoctors()
                    {
                        HealthFacilitiesId=(int)doctor.HealthFacilitiesId,
                        DoctorId=doctor.DoctorId
                    });
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
        [Route("api/doctor")]
        public IActionResult Update([FromBody] DoctorViewModel doctor)
        {
            return Json(new ActionResultDto());
        }

        [HttpDelete]
        [Route("api/doctor")]
        public IActionResult Delete(int id)
        {
            var cc = _context.Query<CategoryCommon>().Where(c => c.Id == id).FirstOrDefault();

            if (cc == null)
                return StatusCode(404, _excep.Throw("Not Found"));

            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();

            string doctorCheckBooking = @"SELECT Status FROM smarthealthcare.cats_doctors d INNER JOIN smarthealthcare.booking_doctors_calendars bdc ON d.DoctorId=bdc.DoctorId WHERE 1=1 AND d.IsDelete=0 AND bdc.Status IN (0,1) ";

            clause.Add("AND d.DoctorId=@DoctorId");
            param.Add(new DbParam("@DoctorId", id));

            var str = $"{doctorCheckBooking} {string.Join(" ", clause)}";

            var reader = _context.Session.ExecuteReader(str, param);

            if (reader.Read() == true)
            {
                return StatusCode(400, _excep.Throw("Xóa không thành công!", "Không thể xóa bác sĩ đang có lịch khám!"));
            }
            else
            {
                try
                {
                    _context.Session.CurrentConnection.Close();

                    _context.Session.BeginTransaction();

                    _context.Update<Doctor>(d => d.DoctorId == id, x => new Doctor()
                    {
                        IsDelete = true
                    });

                    _context.Session.CommitTransaction();
                }
                catch (Exception e)
                {
                    if (_context.Session.IsInTransaction)
                    {
                        _context.Session.RollbackTransaction();
                    }
                    return StatusCode(500, _excep.Throw("Có lỗi xảy ra", e.Message));
                }
                return Json(new ActionResultDto());
            }
        }
    }
}