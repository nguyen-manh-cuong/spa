using System;
using System.Collections.Generic;
using SHCServer.Models;
using SHCServer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viettel;
using Viettel.MySql;
using System.Globalization;

namespace SHCServer.Controllers
{
    public class SmsManualReExaminationController : BaseController
    {
        private readonly string _connectionString;

        public SmsManualReExaminationController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _excep = new FriendlyException();
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/smsmanualreexamination")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
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
                                    p.Address,
                                    p.Email,
                                    (select count(*) from sms_logs s where s.ObjectId = p.PatientId and s.ObjectType = 1) as smsCount
                                from smarthealthcare.medical_healthcare_histories h
                                inner join smarthealthcare.cats_patients p on h.PatientId = p.PatientId";
            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();
            List<MedicalHealthcareHistoriesViewModel> lst = new List<MedicalHealthcareHistoriesViewModel>();

            if (filter != null)
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);
                foreach (var (key, value) in data)
                {
                    if (string.IsNullOrEmpty(value) || value == "false" || value == "0") continue;
                    if (string.Equals(key, "healthfacilities"))
                    {
                        clause.Add("and h.HealthFacilitiesId = @HealthFacilitiesId");
                        param.Add(DbParam.Create("@HealthFacilitiesId", value));
                    }
                    if (string.Equals(key, "doctor"))
                    {
                        clause.Add("and h.DoctorId = @DoctorId");
                        param.Add(DbParam.Create("@DoctorId", value));
                    }
                    if (string.Equals(key, "insurrance"))
                    {
                        clause.Add("and h.HealthInsuranceNumber = @HealthInsuranceNumber");
                        param.Add(DbParam.Create("@HealthInsuranceNumber", value));
                    }
                    if (string.Equals(key, "startTime"))
                    {
                        var startTime = DateTime.Parse(value).ToString("yyyy-MM-dd");
                        clause.Add("and h.ReExaminationDate >= @ReExaminationDate");
                        param.Add(DbParam.Create("@ReExaminationDate", startTime));
                    }
                    if (string.Equals(key, "endTime"))
                    {
                        var endTime = DateTime.Parse(value).ToString("yyyy-MM-dd") + " 23:59:59";
                        clause.Add("and h.ReExaminationDate <= @ReExaminationDateEnd");
                        param.Add(DbParam.Create("@ReExaminationDateEnd", endTime));
                    }
                    if (string.Equals(key, "status"))
                    {
                        if (value == "1")
                        {
                            clause.Add("and h.IsReExamination = 1");
                        }
                        else if (value == "2")
                        {
                            clause.Add("and h.IsReExamination = 0");
                        }
                    }

                    if (string.Equals(key, "statusBirthday"))
                    {
                        if (value == "1")
                        {
                            clause.Add("and h.isBirthDay = 1");
                        }
                        else if (value == "2")
                        {
                            clause.Add("and h.isBirthDay = 0");
                        }
                    }

                    if (string.Equals(key, "patientCode"))
                    {
                        clause.Add("and p.Code = @Code");
                        param.Add(DbParam.Create("@Code", value));
                    }
                    if (string.Equals(key, "patientName"))
                    {
                        clause.Add("and p.FullName like '%' @FullName '%'");
                        param.Add(DbParam.Create("@FullName", value.Trim()));
                    }
                    if (string.Equals(key, "identification"))
                    {
                        clause.Add("and p.Identification = @Identification");
                        param.Add(DbParam.Create("@Identification", value));
                    }
                    if (string.Equals(key, "phoneNumber"))
                    {
                        clause.Add("and p.PhoneNumber = @PhoneNumber");
                        param.Add(DbParam.Create("@PhoneNumber", value));
                    }
                    if (string.Equals(key, "provinceCode"))
                    {
                        clause.Add("and p.ProvinceCode = @ProvinceCode");
                        param.Add(DbParam.Create("@ProvinceCode", value));
                    }
                    if (string.Equals(key, "districtCode"))
                    {
                        clause.Add("and p.DistrictCode = @DistrictCode");
                        param.Add(DbParam.Create("@DistrictCode", value));
                    }
                    if (string.Equals(key, "wardCode"))
                    {
                        clause.Add("and p.WardCode = @WardCode");
                        param.Add(DbParam.Create("@WardCode", value));
                    }
                    if (string.Equals(key, "birthdayDate") && value != "32")
                    {
                        clause.Add("and p.BirthDate = @FromBirthdayDate");
                        param.Add(DbParam.Create("@FromBirthdayDate", value));
                    }
                    if (string.Equals(key, "birthdayMonth") && value != "13")
                    {
                        clause.Add("and p.BirthMonth = @FromBirthdayMonth");
                        param.Add(DbParam.Create("@FromBirthdayMonth", value));
                    }

                    if (string.Equals(key, "sex"))
                    {
                        clause.Add("and p.Gender = @Gender");
                        param.Add(DbParam.Create("@Gender", value));
                    }

                    if (string.Equals(key, "birthday"))
                    {
                        var birthday = DateTime.ParseExact(value, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                        clause.Add("and p.BirthDate = @BirthDate and p.BirthMonth = @BirthMonth and p.BirthYear = @BirthYear");
                        param.Add(DbParam.Create("@BirthDate", birthday.Day));
                        param.Add(DbParam.Create("@BirthMonth", birthday.Month));
                        param.Add(DbParam.Create("@BirthYear", birthday.Year));
                    }
                }

                if (data.ContainsKey("fromMonth") && data["fromMonth"] != "13")
                {
                    param.Add(DbParam.Create("@FromMonth", data["fromMonth"]));
                }
                else
                {
                    param.Add(DbParam.Create("@FromMonth", "0"));
                }

                if (data.ContainsKey("toMonth") && data["toMonth"] != "13")
                {
                    param.Add(DbParam.Create("@ToMonth", data["toMonth"]));
                }
                else
                {
                    param.Add(DbParam.Create("@ToMonth", "13"));
                }

                if (data.ContainsKey("fromDay") && data["fromDay"] != "32")
                {
                    param.Add(DbParam.Create("@FromDay", data["fromDay"]));
                }
                else
                {
                    param.Add(DbParam.Create("@FromDay", "0"));
                }

                if (data.ContainsKey("toDay") && data["toDay"] != "32")
                {
                    param.Add(DbParam.Create("@ToDay", data["toDay"]));
                }
                else
                {
                    param.Add(DbParam.Create("@ToDay", "32"));
                }

                //if ((data.ContainsKey("fromMonth") && data["fromMonth"] != "13") || (data.ContainsKey("toMonth") && data["toMonth"] != "13") || (data.ContainsKey("fromDay") && data["fromDay"] != "32") || (data.ContainsKey("toDay") && data["toDay"] != "32"))
                //{
                //    clause.Add("WHERE (p.BirthMonth < @toMonth OR (p.BirthMonth = @toMonth AND p.BirthDate <= @ToDay)) AND (p.BirthMonth > @FromMonth OR (p.BirthMonth = @FromMonth AND p.BirthDate >= @FromDay))");
                //    if ((data.ContainsKey("fromMonth") && data["fromMonth"] == "13") && (data.ContainsKey("fromDay") && data["fromDay"] != "32"))
                //    {
                //        clause.Add("AND p.BirthDate >= @FromDay");
                //    }

                //    if ((data.ContainsKey("toMonth") && data["toMonth"] == "13") && (data.ContainsKey("toDay") && data["toDay"] != "32"))
                //    {
                //        clause.Add("AND p.BirthDate <= @ToDay");
                //    }
                //}
                if(data.ContainsKey("type") && (data["type"].ToString() == "cmsn"))
                {
                    if (data.ContainsKey("fromMonth") && data["fromMonth"].ToString() != "13" && int.Parse(data["fromMonth"].ToString()) <= int.Parse(data["toMonth"].ToString()) || data["fromMonth"].ToString() == "13")
                    {
                        clause.Add("WHERE (p.BirthMonth < @toMonth OR (p.BirthMonth = @toMonth AND p.BirthDate <= @ToDay)) AND (p.BirthMonth > @FromMonth OR (p.BirthMonth = @FromMonth AND p.BirthDate >= @FromDay))");
                        if ((data.ContainsKey("fromMonth") && data["fromMonth"] == "13") && (data.ContainsKey("fromDay") && data["fromDay"] != "32"))
                        {
                            clause.Add("AND p.BirthDate >= @FromDay");
                        }

                        if ((data.ContainsKey("toMonth") && data["toMonth"] == "13") && (data.ContainsKey("toDay") && data["toDay"] != "32"))
                        {
                            clause.Add("AND p.BirthDate <= @ToDay");
                        }
                    }
                    else
                    {
                        clause.Add("WHERE (p.BirthMonth < @toMonth OR (p.BirthMonth = @toMonth AND p.BirthDate <= @ToDay)) OR (p.BirthMonth > @FromMonth OR (p.BirthMonth = @FromMonth AND p.BirthDate >= @FromDay))");
                    }
                }

                int yearNow = DateTime.Now.Year;
                string compareFisrt = data.ContainsKey("compareFist") ? data["compareFist"] : ">=";
                string compareLast = data.ContainsKey("compareLast") ? data["compareLast"] : "<=";

                if (data.ContainsKey("birthYear") && data["birthYear"] != "")
                {
                    clause.Add("AND p.BirthYear = @_birthYear");
                    param.Add(DbParam.Create("@_birthYear", data["birthYear"].ToString()));
                }
                if ((data.ContainsKey("ageFist") && data["ageFist"] != "") && (data.ContainsKey("ageLast") && data["ageLast"] != ""))
                {
                    string _query = $"AND ({yearNow} - p.BirthYear {compareFisrt} {data["ageFist"]}  AND  {yearNow} - p.BirthYear {compareLast} {data["ageLast"]} )";
                    clause.Add(_query);
                }
            }

            clause.Add(" group by p.Code");

            if (filter != null)
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);
                if (data.ContainsKey("flagReExamination") && data["flagReExamination"] == "0")
                {
                    clause.Remove(" group by p.Code");
                }
            }

            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                        switch (key)
                        {
                            case "id":
                                clause.Add("ORDER BY p.PatientId " + value);
                                break;
                            case "fullName":
                                clause.Add("ORDER BY SUBSTR(p.FullName, INSTR(p.FullName, ' ')) " + value);
                                break;
                            case "ReExaminationDate":
                                clause.Add("ORDER BY ReExaminationDate " + value);
                                break;
                        case "birthday":
                            clause.Add("ORDER BY p.BirthDate " + value + " ,p.BirthMonth, p.BirthYear");
                            break;
                    }
                }
            }

            var readerAll = _context.Session.ExecuteReader($"{query} {string.Join(" ", clause)}", param);
            var total = 0;

            while (readerAll.Read())
            {
                total++;
            }

            readerAll.Close();
            clause.Add("limit @skipCount, @resultCount");
            param.Add(DbParam.Create("@skipCount", skipCount * maxResultCount));
            param.Add(DbParam.Create("@resultCount", maxResultCount));

            var str = $"{query} {string.Join(" ", clause)}";
            var reader = _context.Session.ExecuteReader($"{query} {string.Join(" ", clause)}", param);

            while (reader.Read())
            {
                lst.Add(new MedicalHealthcareHistoriesViewModel()
                {
                    PatientHistoriesId = Convert.ToInt32(reader["PatientHistoriesId"]),
                    HealthFacilitiesId = reader["HealthFacilitiesId"] != DBNull.Value ? Convert.ToInt32(reader["HealthFacilitiesId"]) : 0,
                    HealthInsuranceNumber = reader["HealthInsuranceNumber"].ToString(),
                    DoctorId = Convert.ToInt32(reader["DoctorId"]),
                    PatientId = Convert.ToInt32(reader["PatientId"]),
                    ReExaminationDate = reader["ReExaminationDate"] != DBNull.Value ? Convert.ToDateTime(reader["ReExaminationDate"]) : DateTime.Now,
                    IsReExamination = reader["IsReExamination"] != DBNull.Value ? Convert.ToBoolean(reader["IsReExamination"]) : false,
                    IsBirthDay = reader["IsBirthDay"] != DBNull.Value ? Convert.ToBoolean(reader["IsBirthDay"]) : false,

                    //Patient
                    Code = reader["Code"].ToString(),
                    FullName = reader["FullName"].ToString(),
                    BirthDate = reader["BirthDate"] != DBNull.Value ? Convert.ToInt32(reader["BirthDate"]) : 0,
                    BirthMonth = reader["BirthMonth"] != DBNull.Value ? Convert.ToInt32(reader["BirthMonth"]) : 0,
                    BirthYear = Convert.ToInt32(reader["BirthYear"]),
                    Gender = Convert.ToInt32(reader["Gender"]),
                    PhoneNumber = reader["PhoneNumber"].ToString(),
                    Address = reader["Address"].ToString(),
                    Email = reader["Email"].ToString(),
                    smsCount = Convert.ToInt32(reader["smsCount"])
                });
            }

            return Json(new ActionResultDto { Result = new { Items = lst, TotalCount = total } });
        }
    }
}