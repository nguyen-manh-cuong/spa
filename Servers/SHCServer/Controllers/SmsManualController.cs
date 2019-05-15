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

namespace SHCServer.Controllers
{
    public class SmsManualController : BaseController
    {
        private readonly string _connectionString;

        public SmsManualController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _excep = new FriendlyException();
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/smsmanual")]
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
            #region old
            //var objs = _context.JoinQuery<MedicalHealthcareHistories, Patient>((mhh, p) => new object[] { JoinType.InnerJoin, mhh.PatientId == p.PatientId });

            //bool male = false;
            //bool female = false;

            //if (filter != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
            //    {
            //        if (string.IsNullOrEmpty(value) || value == "false" || value == "0") continue;
            //        if (string.Equals(key, "healthfacilities")) objs = objs.Where((mhh, p) => mhh.HealthFacilitiesId == int.Parse(value));
            //        if (string.Equals(key, "doctor")) objs = objs.Where((mhh, p) => mhh.DoctorId == int.Parse(value));
            //        if (string.Equals(key, "patientCode")) objs = objs.Where((mhh, p) => p.Code == value);
            //        if (string.Equals(key, "patientName")) objs = objs.Where((mhh, p) => p.FullName.Contains(value.Trim()));
            //        if (string.Equals(key, "insurrance")) objs = objs.Where((mhh, p) => mhh.HealthInsuranceNumber == value);
            //        if (string.Equals(key, "identification")) objs = objs.Where((mhh, p) => p.Identification == int.Parse(value));
            //        if (string.Equals(key, "phoneNumber")) objs = objs.Where((mhh, p) => p.PhoneNumber == value);
            //        if (string.Equals(key, "provinceCode")) objs = objs.Where((mhh, p) => p.ProvinceCode == value);
            //        if (string.Equals(key, "districtCode")) objs = objs.Where((mhh, p) => p.DistrictCode == value);
            //        if (string.Equals(key, "wardCode")) objs = objs.Where((mhh, p) => p.WardCode == value);

            //        if (string.Equals(key, "male")) male = true; //objs = objs.Where((mhh, p) => p.Gender == 1);
            //        if (string.Equals(key, "female")) female = true; //objs = objs.Where((mhh, p) => p.Gender == 0);

            //        if (string.Equals(key, "startTime")) objs = objs.Where((mhh, p) => mhh.ReExaminationDate >= DateTime.Parse(value));
            //        if (string.Equals(key, "endTime")) objs = objs.Where((mhh, p) => mhh.ReExaminationDate <= DateTime.Parse(value));
            //        if (string.Equals(key, "birthday"))
            //        {
            //            var birthday = DateTime.Parse(value);
            //            objs = objs.Where((mhh, p) => p.BirthDate == birthday.Day);
            //            objs = objs.Where((mhh, p) => p.BirthMonth == birthday.Month);
            //            objs = objs.Where((mhh, p) => p.BirthYear == birthday.Year);
            //        }

            //        if (string.Equals(key, "birthdayTo"))
            //        {
            //            var birthday = DateTime.Parse(value);
            //            //objs = objs.Where((mhh, p) => new DateTime(p.BirthYear, (p.BirthMonth != null ? p.BirthMonth.Value : 12), (p.BirthDate != null ? p.BirthDate.Value : 28)) <= birthday);
            //            //objs = objs.Where((mhh, p) => DateTime.ParseExact(  ((p.BirthDate != null ? p.BirthDate.ToString() : "28") + (p.BirthMonth != null ? p.BirthMonth.ToString() : "12") + p.BirthYear.ToString()) , "dd-MM-yyyy", CultureInfo.InvariantCulture) <= birthday);
            //            //objs = objs.Where((mhh, p) => p.BirthYear <= birthday.Year && (p.BirthMonth != null ? p.BirthMonth : 12) <= birthday.Month && (p.BirthMonth != null ? p.BirthMonth : 1) >= birthday.Day);
            //            objs = objs.Where((mhh, p) => mhh.BirthDay <= DateTime.Parse(value));
            //        }

            //        if (string.Equals(key, "birthdayFrom"))
            //        {
            //            var birthday = DateTime.Parse(value);
            //            //objs = objs.Where((mhh, p) => new DateTime(p.BirthYear, (p.BirthMonth != null ? p.BirthMonth.Value : 1), (p.BirthDate != null ? p.BirthDate.Value : 1)) <= birthday);
            //            //objs = objs.Where((mhh, p) => DateTime.ParseExact(((p.BirthDate != null ? p.BirthDate.ToString() : "1") + (p.BirthMonth != null ? p.BirthMonth.ToString() : "1") + p.BirthYear.ToString()), "dd-MM-yyyy", CultureInfo.InvariantCulture) >= birthday);
            //            //objs = objs.Where((mhh, p) => p.BirthYear >= birthday.Year && (p.BirthMonth != null ? p.BirthMonth : 1) >= birthday.Month && (p.BirthDate != null ? p.BirthDate : 1) >= birthday.Day);
            //            objs = objs.Where((mhh, p) => mhh.BirthDay >= DateTime.Parse(value));
            //        }

            //        if (string.Equals(key, "status"))
            //        {
            //            if (value == "1") objs = objs.Where((mhh, p) => mhh.IsReExamination == 1);
            //            else objs = objs.Where((mhh, p) => mhh.IsReExamination != 1);
            //        }

            //        if (string.Equals(key, "statusB"))
            //        {
            //            if (value == "1") objs = objs.Where((mhh, p) => mhh.IsBirthDay == 1);
            //            else objs = objs.Where((mhh, p) => mhh.IsBirthDay != 1);
            //        }
            //    }

            //    if ((male == true && female == false) || (male == false && female == true))
            //    {
            //        objs = objs.Where((mhh, p) => p.Gender == (male ? 1 : 0));
            //    }
            //}

            ////objs = objs.w;

            //var _objs = objs.Select((mhh, p) => new MedicalHealthcareHistoriesViewModel(mhh, _connectionString));


            ////if (sorting != null)
            ////{
            ////    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            ////    {
            ////        if (!Utils.PropertyExists<MedicalHealthcareHistories>(key)) continue;
            ////        _objs = value == "asc" ? _objs.OrderBy(mhh => key) : _objs.OrderByDesc(mhh => key);
            ////    }
            ////}

            //return Json(new ActionResultDto { Result = new { Items = _objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = _objs.Count() } });
            ////return Json(new ActionResultDto { Result = new { Items = objs.Select((mhh, p) => new MedicalHealthcareHistoriesViewModel(mhh, _connectionString)).TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Select((mhh, p) => new MedicalHealthcareHistoriesViewModel()).Count() } });
            #endregion
        }

        [HttpPost]
        [Route("api/infosms")]
        public IActionResult InfoSms([FromBody] SmsInfoInputViewModel infoInput)
        {
            //danh sach goi sms su dung
            var packages = _context.Query<SmsPackagesDistribute>().Where(pd => pd.HealthFacilitiesId == infoInput.healthFacilitiesId && pd.YearEnd >= DateTime.Now.Year && pd.MonthEnd >= DateTime.Now.Month && pd.IsDelete == false && pd.IsActive == true).Select(u => new PackageDistributeViewModel(u, _connectionString)).ToList();
            if (packages.Count == 0) {
                SaveInfoSmsError(_connectionString, infoInput, "Không thể gửi tin do không sử dụng gói sms nào");

                if (infoInput.type == 4) return Json(new ActionResultDto { Result = "" });
                else return StatusCode(406, _excep.Throw(406, "Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại. Mời bạn mua thêm gói SMS"));
            } 
            
            long totalSms = 0;
            int totalSmsSend = infoInput.lstMedicalHealthcareHistories.Count;

            foreach (var s in packages)
            {
                if(s.SmsPackageUsed != null)
                {
                    totalSms += s.SmsPackageUsed.Quantityused;
                }
            }

            if (totalSms < totalSmsSend) {
                SaveInfoSmsError(_connectionString, infoInput, "Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại");

                if (infoInput.type == 4) return Json(new ActionResultDto { Result = "" });
                else return StatusCode(406, _excep.Throw(406, "Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại. Mời bạn mua thêm gói SMS"));
            }

            //Xu ly tin nhan
            string code = "";
            string content = "";
            int templateId = 0;
            int indexM = 0;
            int indexUsed = 0;

            switch (infoInput.type)
            {
                case 1:
                    code = "A01.SMSTAIKHAM";
                    break;
                case 2:
                    code = "A02.SMSSINHNHAT";
                    break;
                case 4:
                    code = "A06.SMSDATKHAM";
                    break;
            }

            if (string.IsNullOrEmpty(infoInput.content))
            {
                var config = _context.Query<HealthFacilitiesConfigs>().Where(hp => hp.Code == code && hp.HealthFacilitiesId == infoInput.healthFacilitiesId).FirstOrDefault();
                templateId = config != null ? config.Values : 0;
                var template = _context.Query<SmsTemplate>().Where(t => t.Id == templateId).FirstOrDefault();
                content = template != null ? template.SmsContent : "";
            }
            else
            {
                templateId = infoInput.smsTemplateId.Value;
                content = infoInput.content;
            }
            //danh sach sms content
            List<SmsContent> lstContent = new List<SmsContent>();

            foreach (var m in infoInput.lstMedicalHealthcareHistories)
            {
                indexM++;
                if(packages[indexUsed].SmsPackageUsed != null && indexM > packages[indexUsed].SmsPackageUsed.Quantityused)
                {
                    indexM = 0;
                    indexUsed++;
                }

                SmsContent scontent = new SmsContent();
                scontent.SmsBrand = packages[indexUsed].SmsBrand;
                scontent.Message = RepalaceContentSms(content, m, packages[indexUsed].PackageName);
                scontent.PhoneNumber = m.PhoneNumber;

                scontent.HealthFacilitiesId = infoInput.healthFacilitiesId.Value;
                scontent.SmsTemplateId = templateId;
                scontent.SmsPackagesDistributeId = packages[indexUsed].Id;
                scontent.SmsPackageUsedId = packages[indexUsed].SmsPackageUsed != null ? packages[indexUsed].SmsPackageUsed.SmsPackageUsedId : 0;
                scontent.PatientHistoriesId = m.PatientHistoriesId;

                scontent.PatientId = m.PatientId;
                scontent.objectType = infoInput.objectType;

                lstContent.Add(scontent);
            }

            var sendSMS = Utils.SendListSMS(lstContent, infoInput.type);
            var infoSms = SMS.SaveInfoSMS(_connectionString, sendSMS, infoInput.type);

            return Json(new ActionResultDto { Result = infoSms });
        }

        [HttpPost]
        [Route("api/infoSendsms")]
        public IActionResult InfoSendSms([FromBody] SmsInfoBookingInputViewModel infoInput)
        {
            //danh sach goi sms su dung
            var packages = _context.Query<SmsPackagesDistribute>().Where(pd => pd.HealthFacilitiesId == infoInput.healthFacilitiesId && pd.YearEnd >= DateTime.Now.Year && pd.MonthEnd >= DateTime.Now.Month && pd.IsDelete == false && pd.IsActive == true).Select(u => new PackageDistributeViewModel(u, _connectionString)).ToList();
            if (packages.Count == 0)
            {
                SaveInfoSmsBookingError(_connectionString, infoInput, "Không thể gửi tin do không sử dụng gói sms nào");
                if (infoInput.type == 4) return Json(new ActionResultDto { Result = "" });
                else return StatusCode(406, _excep.Throw(406, "Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại. Mời bạn mua thêm gói SMS"));
            }

            long totalSms = 0;
            int totalSmsSend = infoInput.lstMedicalHealthcareHistories.Count;

            foreach (var s in packages)
            {
                totalSms += s.SmsPackageUsed.Quantityused;
            }

            if (totalSms < totalSmsSend)
            {
                SaveInfoSmsBookingError(_connectionString, infoInput, "Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại");
                if (infoInput.type == 4) return Json(new ActionResultDto { Result = "" });
                else return StatusCode(406, _excep.Throw(406, "Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại. Mời bạn mua thêm gói SMS"));
            }

            //Xu ly tin nhan
            string code = "";
            string content = "";
            int templateId = 0;
            int indexM = 0;
            int indexUsed = 0;

            switch (infoInput.type)
            {
                case 1:
                    code = "A01.SMSTAIKHAM";
                    break;
                case 2:
                    code = "A02.SMSSINHNHAT";
                    break;
                case 4:
                    code = "A06.SMSDATKHAM";
                    break;
            }

            if (string.IsNullOrEmpty(infoInput.content))
            {
                var config = _context.Query<HealthFacilitiesConfigs>().Where(hp => hp.Code == code).FirstOrDefault();
                templateId = config != null ? config.Values : 0;
                var template = _context.Query<SmsTemplate>().Where(t => t.Id == templateId).FirstOrDefault();
                content = template != null ? template.SmsContent : "";
            }
            else
            {
                templateId = infoInput.smsTemplateId.Value;
                content = infoInput.content;
            }
            //danh sach sms content
            List<SmsContent> lstContent = new List<SmsContent>();

            foreach (var m in infoInput.lstMedicalHealthcareHistories)
            {
                indexM++;
                if (indexM > packages[indexUsed].SmsPackageUsed.Quantityused)
                {
                    indexM = 0;
                    indexUsed++;
                }

                SmsContent scontent = new SmsContent();
                scontent.SmsBrand = packages[indexUsed].SmsBrand;
                scontent.Message = ReplaceContentBookingSms(content, m, packages[indexUsed].PackageName);
                scontent.PhoneNumber = m.PhoneNumber;

                scontent.HealthFacilitiesId = infoInput.healthFacilitiesId.Value;
                scontent.SmsTemplateId = templateId;
                scontent.SmsPackagesDistributeId = packages[indexUsed].Id;
                scontent.SmsPackageUsedId = packages[indexUsed].SmsPackageUsed.SmsPackageUsedId;
                scontent.PatientHistoriesId = 0;

                scontent.PatientId = m.PatientId;
                scontent.objectType = infoInput.objectType;

                lstContent.Add(scontent);
            }

            var sendSMS = Utils.SendListSMS(lstContent, infoInput.type);
            var infoSms = SMS.SaveInfoSMS(_connectionString, sendSMS, infoInput.type);

            return Json(new ActionResultDto { Result = infoSms });
        }

        public static string ReplaceContentBookingSms(string content, BookingInformationsViewModel mhh, string packageName)
        {
            string _content = content;
            if (!string.IsNullOrEmpty(content))
            {
                _content = _content
                    .Replace("<PHONGKHAM>", packageName)
                    .Replace("<NGAYSINH>", mhh.BirthYear != 0 ? mhh.BirthYear.ToString() : "")
                    .Replace("<HOTEN>", mhh.BookingUser)
                    .Replace("<EMAIL>", mhh.Email)
                    .Replace("<GIOITINH>", mhh.Gender == 1 ? "Nam" : "Nữ")
                    .Replace("<NGAYHIENTAI>", DateTime.Now.ToString("dd/MM/yyyy"))
                    .Replace("<NGAYTAIKHAM>", mhh.ExaminationTime != null ? mhh.ExaminationTime : "");
            }

            return _content;
        }

        public static void SaveInfoSmsError(string configuration, SmsInfoInputViewModel infoInput, string message)
        {
            DbContext _context = new MySqlContext(new MySqlConnectionFactory(configuration));
            List<SmsLogs> lstSmsLog = new List<SmsLogs>();

            foreach (var resp in infoInput.lstMedicalHealthcareHistories)
            {
                SmsLogs smsLog = new SmsLogs();
                smsLog.PhoneNumber = resp.PhoneNumber;
                smsLog.Message = "";
                smsLog.ResultMessage = message;
                smsLog.Status = 0;
                smsLog.HealthFacilitiesId = infoInput.healthFacilitiesId.Value;
                smsLog.SmsTemplateId = 0;
                smsLog.SmsPackagesDistributeId = 0;
                smsLog.SentDate = DateTime.Now;
                smsLog.LogType = 1;

                lstSmsLog.Add(smsLog);
            }

            _context.InsertRange(lstSmsLog);
        }

        public static void SaveInfoSmsBookingError(string configuration, SmsInfoBookingInputViewModel infoInput, string message)
        {
            DbContext _context = new MySqlContext(new MySqlConnectionFactory(configuration));
            List<SmsLogs> lstSmsLog = new List<SmsLogs>();

            foreach (var resp in infoInput.lstMedicalHealthcareHistories)
            {
                SmsLogs smsLog = new SmsLogs();
                smsLog.PhoneNumber = resp.PhoneNumber;
                smsLog.Message = "";
                smsLog.ResultMessage = message;
                smsLog.Status = 0;
                smsLog.HealthFacilitiesId = infoInput.healthFacilitiesId.Value;
                smsLog.SmsTemplateId = 0;
                smsLog.SmsPackagesDistributeId = 0;
                smsLog.SentDate = DateTime.Now;
                smsLog.LogType = 1;

                lstSmsLog.Add(smsLog);
            }

            _context.InsertRange(lstSmsLog);
        }

        public static string RepalaceContentSms(string content, MedicalHealthcareHistoriesViewModel mhh, string packageName)
        {
            string _content = content;
            if (!string.IsNullOrEmpty(content))
            {
                _content = _content
                    .Replace("<PHONGKHAM>", packageName)
                    .Replace("<NGAYSINH>", mhh.BirthYear != 0 ? mhh.BirthYear.ToString() : "")
                    .Replace("<HOTEN>", mhh.FullName)
                    .Replace("<EMAIL>", mhh.Email)
                    .Replace("<GIOITINH>", mhh.Gender == 1 ? "Nam" : "Nữ")
                    .Replace("<NGAYHIENTAI>", DateTime.Now.ToString("dd/MM/yyyy"))
                    .Replace("<NGAYTAIKHAM>", mhh.ReExaminationDate != null ? mhh.ReExaminationDate.Value.ToString("dd/MM/yyyy") : "");
            }

            return _content;
        }
    }
}