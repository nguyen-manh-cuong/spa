using SHCServer.Models;
using SHCServer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel.MySql;
using Viettel;

namespace SHCServer.Controllers
{
    public class CommonController : BaseController
    {
        private readonly string _connectionString;

        public CommonController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
        }

        #region location
        [HttpGet]
        [Route("api/provinces")]
        public IActionResult GetAllProvinces() => Json(new ActionResultDto { Result = new { Items = _context.Query<Province>().ToList() } });

        [HttpGet]
        [Route("api/districts")]
        public IActionResult GetDistricts(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<District>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "ProvinceCode")) objs = objs.Where(o => o.ProvinceCode == value);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }

        [HttpGet]
        [Route("api/wards")]
        public IActionResult GetWards(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<Ward>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "DistrictCode")) objs = objs.Where(o => o.DistrictCode == value);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }
        #endregion

        #region booking
        [HttpGet]
        [Route("api/healthfacilitiesbooking")]
        public IActionResult GetHealthfacilitiesBooking(string filter)
        {
            var objs = _context.Query<HealthFacilities>().Where(o => o.IsDelete == 0 && o.IsActive == 1);
            FilterHealthFacilities filterHf = JsonConvert.DeserializeObject<FilterHealthFacilities>(filter);

            if (filterHf.districtCode != null) objs = objs.Where((o) => o.DistrictCode == filterHf.districtCode);
            if (filterHf.provinceCode != null) objs = objs.Where((o) => o.ProvinceCode == filterHf.provinceCode);
            if (filterHf.name != null) objs = objs.Where((o) => o.Name.Contains(filterHf.name));
            if (filterHf.specialist != null && filterHf.specialist.Count != 0) objs = objs.Where((o) => filterHf.specialist.Contains(o.Specialist));

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(1000).Select(h => new HealthFacilitiesViewModel(h, _connectionString)).ToList() } });
        }
        #endregion

        #region getall
        [HttpGet]
        [Route("api/smsbrands-all")]
        public IActionResult GetAllSmsBrands() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsBrands>().OrderBy(t => t.BrandName).ToList() } });

        [HttpGet]
        [Route("api/smspackages-all")]
        public IActionResult GetAllSmsPackages() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsPackage>().OrderBy(o => o.Name).ToList() } });
        #endregion

        #region distribute
        [HttpGet]
        [Route("api/smspackages-cbo")]
        public IActionResult GetSmsPackages() => Json(new ActionResultDto { Result = new { Items = _context.Query<SmsPackage>().Where(o => o.IsDelete == 0 && o.Status == 1).OrderBy(o => o.Name).ToList() } });
        #endregion

        [HttpGet]
        [Route("api/categorycommon")]
        public IActionResult GetCategoryCommon(string filter) => Json(new ActionResultDto { Result = new { Items = _context.Query<CategoryCommon>().OrderBy(g => g.Name).Where(g => g.Type == filter).Select(g => new CategoryCommonViewModel(g)).ToList() } });

        [HttpGet]
        [Route("api/smstemplates")]
        public IActionResult GetSmsTemplates(string filter)
        {
            var objs = _context.Query<SmsTemplate>();

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(filter) || o.ApplyAllSystem == true);

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(t => t.SmsTemplateName).ToList() } });
        }

        [HttpGet]
        [Route("api/doctors")]
        public IActionResult GetDoctors(string filter)
        {
            var objs = _context.JoinQuery<Doctor, HealthFacilitiesDoctors>((d, h) => new object[] { JoinType.InnerJoin, d.DoctorId == h.DoctorId });

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where((d, h) => h.HealthFacilitiesId == int.Parse(filter));

            return Json(new ActionResultDto { Result = new { Items = objs.Select((d, h) => new DoctorViewModel(d, _connectionString)).ToList() } });
        }

        [HttpGet]
        [Route("api/healthfacilities")]
        public IActionResult GetHealthfacilities(string filter)
        {
            var objs = _context.Query<HealthFacilities>();

            if (!string.IsNullOrEmpty(filter)) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(filter));

            return Json(new ActionResultDto { Result = new { Items = objs.OrderBy(h => h.Name).Take(500).ToList() } });
        }

        [HttpGet]
        [Route("api/healthfacilitiesconfigs")]
        public IActionResult GetHealthFacilitiesConfigs(string filter)
        {
            var objs = _context.Query<HealthFacilitiesConfigs>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value)) return Json(new ActionResultDto { Result = new { } });
                    if (string.Equals(key, "code")) objs = objs.Where(o => o.Code == value);
                    if (string.Equals(key, "healthFacilitiesId")) objs = objs.Where(o => o.HealthFacilitiesId == int.Parse(value));
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.FirstOrDefault() } });
        }

        [HttpGet]
        [Route("api/config")]
        public IActionResult GetConfig(string filter)
        {
            if (filter == null) return Json(new ActionResultDto { Result = new { } });

            List<string> lst = JsonConvert.DeserializeObject<List<string>>(filter);
            var objs = _context.Query<Config>().Where((o) => lst.Contains(o.Code));
            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }

        [HttpGet]
        [Route("api/workingtime")]
        public IActionResult GetWorkingTime(string filter)
        {
            var objs = _context.Query<BookingDoctorsCalendars>().Where((o) => o.DoctorId == int.Parse(filter));

            return Json(new ActionResultDto { Result = new { Items = objs.Select(h => new BookingDoctorsCalendarsViewModel(h, _connectionString)).ToList() } });
        }

        [HttpGet]
        [Route("api/testquery")]
        public IActionResult TestQuery(string filter)
        {
            string query = @"select 
	                                PatientHistoriesId,
	                                HealthFacilitiesId,
	                                HealthInsuranceNumber,
	                                DoctorId,
	                                ReExaminationDate,
	                                IsReExamination,
	                                IsBirthDay,	
                                    p.PatientId,
	                                p.Code,
                                    p.FullName,
                                    p.BirthDate,
                                    p.BirthMonth,
                                    p.BirthYear,
                                    p.Gender,
                                    p.PhoneNumber,
                                    p.Address
                                from medical_healthcare_histories h
                                inner join cats_patients p on h.PatientId = p.PatientId
                                where 1=1";
            List<string> clause = new List<string>(); ;
            List<DbParam> param = new List<DbParam>();
            List<MedicalHealthcareHistoriesViewModel> lst = new List<MedicalHealthcareHistoriesViewModel>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value) || value == "false" || value == "0") continue;
                    if (string.Equals(key, "healthfacilities"))
                    {
                        clause.Add(" and h.HealthFacilitiesId = @HealthFacilitiesId");
                        param.Add(DbParam.Create("@HealthFacilitiesId", value));
                    }
                    if (string.Equals(key, "doctor"))
                    {
                        clause.Add(" and h.DoctorId = @DoctorId");
                        param.Add(DbParam.Create("@DoctorId", value));
                    }
                    if (string.Equals(key, "insurrance"))
                    {
                        clause.Add(" and h.HealthInsuranceNumber = @HealthInsuranceNumber");
                        param.Add(DbParam.Create("@HealthInsuranceNumber", value));
                    }
                    if (string.Equals(key, "startTime"))
                    {
                        clause.Add(" and h.ReExaminationDate >= @ReExaminationDate");
                        param.Add(DbParam.Create("@ReExaminationDate", value));
                    }
                    if (string.Equals(key, "endTime"))
                    {
                        clause.Add(" and h.ReExaminationDate <= @ReExaminationDateEnd");
                        param.Add(DbParam.Create("@ReExaminationDateEnd", value));
                    }
                    if (string.Equals(key, "status"))
                    {
                        if (value == "1")
                        {
                            clause.Add(" and h.IsReExamination == 1");
                        }
                        else
                        {
                            clause.Add(" and h.IsReExamination != 1");
                        }
                    }
                    if (string.Equals(key, "statusB"))
                    {
                        if (value == "1")
                        {
                            clause.Add(" and h.IsBirthDay == 1");
                        }
                        else
                        {
                            clause.Add(" and h.IsBirthDay != 1");
                        }
                    }

                    if (string.Equals(key, "patientCode"))
                    {
                        clause.Add(" and p.Code = @Code");
                        param.Add(DbParam.Create("@Code", value));
                    }
                    if (string.Equals(key, "patientName"))
                    {
                        clause.Add(" and p.FullName like %@FullName%");
                        param.Add(DbParam.Create("@FullName", value.Trim()));
                    }
                    if (string.Equals(key, "identification"))
                    {
                        clause.Add(" and p.Identification = @Identification");
                        param.Add(DbParam.Create("@Identification", value));
                    }
                    if (string.Equals(key, "phoneNumber"))
                    {
                        clause.Add(" and p.PhoneNumber = @PhoneNumber");
                        param.Add(DbParam.Create("@PhoneNumber", value));
                    }
                    if (string.Equals(key, "provinceCode"))
                    {
                        clause.Add(" and p.ProvinceCode = @ProvinceCode");
                        param.Add(DbParam.Create("@ProvinceCode", value));
                    }
                    if (string.Equals(key, "districtCode"))
                    {
                        clause.Add(" and p.DistrictCode = @DistrictCode");
                        param.Add(DbParam.Create("@DistrictCode", value));
                    }
                    if (string.Equals(key, "wardCode"))
                    {
                        clause.Add(" and p.WardCode = @WardCode");
                        param.Add(DbParam.Create("@WardCode", value));
                    }
                    if (string.Equals(key, "male"))
                    {
                        clause.Add(" and p.Gender = @Gender");
                        param.Add(DbParam.Create("@Gender", 1));
                    }
                    if (string.Equals(key, "female"))
                    {
                        clause.Add(" and p.Gender = @Gender");
                        param.Add(DbParam.Create("@Gender", 0));
                    }
                    if (string.Equals(key, "birthday"))
                    {
                        var birthday = DateTime.Parse(value);

                        clause.Add(" and p.BirthDate = @BirthDate and p.BirthMonth = @BirthMonth and p.BirthYear = @BirthYear");
                        param.Add(DbParam.Create("@BirthDate", birthday.Day));
                        param.Add(DbParam.Create("@BirthMonth", birthday.Month));
                        param.Add(DbParam.Create("@BirthYear", birthday.Year));
                    }

                    //    if (string.Equals(key, "birthdayTo"))
                    //    {
                    //        var birthday = DateTime.Parse(value);
                    //        objs = objs.Where((mhh, p) => mhh.BirthDay <= DateTime.Parse(value));
                    //    }

                    //    if (string.Equals(key, "birthdayFrom"))
                    //    {
                    //        var birthday = DateTime.Parse(value);
                    //        objs = objs.Where((mhh, p) => mhh.BirthDay >= DateTime.Parse(value));
                    //    }
                }
            }
            var str = $"{query} {string.Join(",", clause)}";
            var c = string.Join(",", clause);
            var querys = query + string.Join(",", clause);

            var reader = _context.Session.ExecuteReader(query + string.Join(",", clause), param);

            while (reader.Read())
            {
                lst.Add(new MedicalHealthcareHistoriesViewModel()
                {
                    PatientHistoriesId = Convert.ToInt32(reader["PatientHistoriesId"]),
                    HealthFacilitiesId = reader["HealthFacilitiesId"] != DBNull.Value ? Convert.ToInt32(reader["HealthFacilitiesId"]) : 0,
                    HealthInsuranceNumber = reader["HealthInsuranceNumber"].ToString(),
                    DoctorId = Convert.ToInt32(reader["DoctorId"]),
                    PatientId = Convert.ToInt32(reader["PatientId"]),
                    ReExaminationDate = Convert.ToDateTime(reader["ReExaminationDate"]),
                    IsReExamination = reader["IsReExamination"] != DBNull.Value ? Convert.ToInt32(reader["IsReExamination"]) : 0,
                    IsBirthDay = reader["IsBirthDay"] != DBNull.Value ? Convert.ToInt32(reader["IsBirthDay"]) : 0,

                    //Patient
                    Code = reader["Code"].ToString(),
                    FullName = reader["FullName"].ToString(),
                    BirthDate = reader["BirthDate"] != DBNull.Value ? Convert.ToInt32(reader["BirthDate"]) : 0,
                    BirthMonth = reader["BirthMonth"] != DBNull.Value ? Convert.ToInt32(reader["BirthMonth"]) : 0,
                    BirthYear = Convert.ToInt32(reader["BirthYear"]),
                    Gender = Convert.ToInt32(reader["Gender"]),
                    PhoneNumber = reader["PhoneNumber"].ToString(),
                    Address = reader["Address"].ToString(),
                });
            }


            return Json(new ActionResultDto { Result = lst });
        }

        public class FilterHealthFacilities
        {
            [JsonProperty("districtCode")]
            public string districtCode { get; set; }

            [JsonProperty("provinceCode")]
            public string provinceCode { get; set; }

            [JsonProperty("name")]
            public string name { get; set; }

            [JsonProperty("specialist")]
            public List<int?> specialist { get; set; }
        }
    }
}
