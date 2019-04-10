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
    public class DoctorController : BaseController
    {
        private readonly string _connectionString;

        public DoctorController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/doctor")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            List<string> clause = new List<string>(); 
            List<DbParam> param = new List<DbParam>();
            List<DoctorViewModel> doctorList = new List<DoctorViewModel>();

            string doctorJoinSpecialist= @"SELECT * FROM smarthealthcare.cats_doctors d INNER JOIN smarthealthcare.cats_doctors_specialists ds ON d.DoctorId=ds.DoctorId WHERE 1=1 AND d.IsDelete=0 ";

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;
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
                    if (string.Equals(key, "fullName"))
                    {
                        clause.Add("AND d.FullName=@FullName");
                        param.Add(DbParam.Create("@FullName", value.Trim()));
                    }
                    if (string.Equals(key, "specialistCode"))
                    {
                        clause.Add("AND ds.SpecialistCode=@SpecialistCode");
                        param.Add(DbParam.Create("@SpecialistCode", value.Trim()));
                    };
                }
            }

            clause.Add(" GROUP BY d.DoctorId ORDER BY d.CreateDate DESC LIMIT @skipCount, @resultCount");
            param.Add(DbParam.Create("@skipCount", skipCount * maxResultCount));
            param.Add(DbParam.Create("@resultCount", maxResultCount));

            var str = $"{doctorJoinSpecialist} {string.Join(" ", clause)}";
            var reader = _context.Session.ExecuteReader(str, param);
       
            while(reader.Read())
            {
                doctorList.Add(new DoctorViewModel()
                {
                    AcademicId = Convert.ToInt32(reader["AcademicId"]),
                    Address = reader["Address"].ToString(),
                    AllowBooking= Convert.ToInt16(reader["AllowBooking"])==0?false:true,
                    AllowFilter= Convert.ToInt16(reader["AllowFilter"]) == 0 ? false : true,
                    AllowSearch = Convert.ToInt16(reader["AllowSearch"]) == 0 ? false : true,
                    Avatar=reader["Avatar"].ToString(),
                    BirthDate = reader["BirthDate"] != DBNull.Value ? Convert.ToInt16(reader["BirthDate"]) : 0,
                    BirthMonth= reader["BirthDate"] != DBNull.Value ? Convert.ToInt16(reader["BirthMonth"]) : 0,
                    BirthYear= Convert.ToInt16(reader["BirthYear"]),
                    CertificationCode=reader["CertificationCode"].ToString(),
                    CertificationDate=reader["CertificationDate"]!=DBNull.Value?Convert.ToDateTime(reader["CertificationDate"]):DateTime.Now,
                    DegreeId=reader["DegreeId"]!=DBNull.Value? Convert.ToInt16(reader["DegreeId"]) : 0,
                    Description=reader["Description"].ToString(),
                    DistrictCode=reader["DistrictCode"].ToString(),
                    ProvinceCode=reader["ProvinceCode"].ToString(),
                    EducationCountryCode=reader["EducationCountryCode"].ToString(),
                    Email=reader["Email"].ToString(),
                    EthnicityCode=reader["EthnicityCode"].ToString(),
                    FullName=reader["FullName"].ToString(),
                    Gender=Convert.ToInt16(reader["Gender"]),
                    HisId=reader["HisId"].ToString(),
                    IsActive=Convert.ToInt16(reader["IsActive"])==0?false:true,
                    IsSync=Convert.ToInt16(reader["IsSync"])==0?false:true,
                    NationCode=reader["NationCode"].ToString(),
                    PhoneNumber=reader["PhoneNumber"].ToString(),
                    PositionCode=reader["PositionCode"].ToString(),
                    PriceDescription=reader["PriceDescription"].ToString(),
                    PriceFrom=reader["PriceFrom"]!=DBNull.Value?Convert.ToInt32(reader["PriceFrom"]):0,
                    PriceTo= reader["PriceTo"] != DBNull.Value ? Convert.ToInt32(reader["PriceTo"]) : 0,
                    Summary=reader["Summary"].ToString(),
                    TitleCode=reader["TitleCode"].ToString(),                 
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
    }
}