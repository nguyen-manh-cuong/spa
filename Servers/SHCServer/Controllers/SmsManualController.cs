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
        private IConfiguration _configuration;

        public SmsManualController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _configuration = configuration;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _excep = new FriendlyException();
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/smsmanual")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.JoinQuery<MedicalHealthcareHistories, Patient>((mhh, p) => new object[] { JoinType.InnerJoin, mhh.PatientId == p.PatientId });

            bool male = false;
            bool female = false;

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value) || value == "false" || value == "0") continue;
                    if (string.Equals(key, "healthfacilities")) objs = objs.Where((mhh, p) => mhh.HealthFacilitiesId == int.Parse(value));
                    if (string.Equals(key, "doctor")) objs = objs.Where((mhh, p) => mhh.DoctorId == int.Parse(value));
                    if (string.Equals(key, "patientCode")) objs = objs.Where((mhh, p) => p.Code == value);
                    if (string.Equals(key, "patientName")) objs = objs.Where((mhh, p) => p.FullName.Contains(value.Trim()));
                    if (string.Equals(key, "insurrance")) objs = objs.Where((mhh, p) => mhh.HealthInsuranceNumber == value);
                    if (string.Equals(key, "identification")) objs = objs.Where((mhh, p) => p.Identification == int.Parse(value));
                    if (string.Equals(key, "phoneNumber")) objs = objs.Where((mhh, p) => p.PhoneNumber == value);
                    if (string.Equals(key, "provinceCode")) objs = objs.Where((mhh, p) => p.ProvinceCode == value);
                    if (string.Equals(key, "districtCode")) objs = objs.Where((mhh, p) => p.DistrictCode == value);
                    if (string.Equals(key, "wardCode")) objs = objs.Where((mhh, p) => p.WardCode == value);

                    if (string.Equals(key, "male")) male = true; //objs = objs.Where((mhh, p) => p.Gender == 1);
                    if (string.Equals(key, "female")) female = true; //objs = objs.Where((mhh, p) => p.Gender == 0);

                    if (string.Equals(key, "startTime")) objs = objs.Where((mhh, p) => mhh.ReExaminationDate >= DateTime.Parse(value));
                    if (string.Equals(key, "endTime")) objs = objs.Where((mhh, p) => mhh.ReExaminationDate <= DateTime.Parse(value));
                    if (string.Equals(key, "birthday"))
                    {
                        var birthday = DateTime.Parse(value);
                        objs = objs.Where((mhh, p) => p.BirthDate == birthday.Day);
                        objs = objs.Where((mhh, p) => p.BirthMonth == birthday.Month);
                        objs = objs.Where((mhh, p) => p.BirthYear == birthday.Year);
                    }

                    if (string.Equals(key, "birthdayTo"))
                    {
                        var birthday = DateTime.Parse(value);
                        //objs = objs.Where((mhh, p) => new DateTime(p.BirthYear, (p.BirthMonth != null ? p.BirthMonth.Value : 12), (p.BirthDate != null ? p.BirthDate.Value : 28)) <= birthday);
                        //objs = objs.Where((mhh, p) => DateTime.ParseExact(  ((p.BirthDate != null ? p.BirthDate.ToString() : "28") + (p.BirthMonth != null ? p.BirthMonth.ToString() : "12") + p.BirthYear.ToString()) , "dd-MM-yyyy", CultureInfo.InvariantCulture) <= birthday);
                        //objs = objs.Where((mhh, p) => p.BirthYear <= birthday.Year && (p.BirthMonth != null ? p.BirthMonth : 12) <= birthday.Month && (p.BirthMonth != null ? p.BirthMonth : 1) >= birthday.Day);
                        objs = objs.Where((mhh, p) => mhh.BirthDay <= DateTime.Parse(value));
                    }

                    if (string.Equals(key, "birthdayFrom"))
                    {
                        var birthday = DateTime.Parse(value);
                        //objs = objs.Where((mhh, p) => new DateTime(p.BirthYear, (p.BirthMonth != null ? p.BirthMonth.Value : 1), (p.BirthDate != null ? p.BirthDate.Value : 1)) <= birthday);
                        //objs = objs.Where((mhh, p) => DateTime.ParseExact(((p.BirthDate != null ? p.BirthDate.ToString() : "1") + (p.BirthMonth != null ? p.BirthMonth.ToString() : "1") + p.BirthYear.ToString()), "dd-MM-yyyy", CultureInfo.InvariantCulture) >= birthday);
                        //objs = objs.Where((mhh, p) => p.BirthYear >= birthday.Year && (p.BirthMonth != null ? p.BirthMonth : 1) >= birthday.Month && (p.BirthDate != null ? p.BirthDate : 1) >= birthday.Day);
                        objs = objs.Where((mhh, p) => mhh.BirthDay >= DateTime.Parse(value));
                    }

                    if (string.Equals(key, "status"))
                    {
                        if (value == "1") objs = objs.Where((mhh, p) => mhh.IsReExamination == 1);
                        else objs = objs.Where((mhh, p) => mhh.IsReExamination != 1);
                    }

                    if (string.Equals(key, "statusB"))
                    {
                        if (value == "1") objs = objs.Where((mhh, p) => mhh.IsBirthDay == 1);
                        else objs = objs.Where((mhh, p) => mhh.IsBirthDay != 1);
                    }
                }

                if ((male == true && female == false) || (male == false && female == true))
                {
                    objs = objs.Where((mhh, p) => p.Gender == (male ? 1 : 0));
                }
            }

            //objs = objs.w;

            var _objs = objs.Select((mhh, p) => new MedicalHealthcareHistoriesViewModel(mhh, _connectionString));


            //if (sorting != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            //    {
            //        if (!Utils.PropertyExists<MedicalHealthcareHistories>(key)) continue;
            //        _objs = value == "asc" ? _objs.OrderBy(mhh => key) : _objs.OrderByDesc(mhh => key);
            //    }
            //}

            return Json(new ActionResultDto { Result = new { Items = _objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = _objs.Count() } });
            //return Json(new ActionResultDto { Result = new { Items = objs.Select((mhh, p) => new MedicalHealthcareHistoriesViewModel(mhh, _connectionString)).TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Select((mhh, p) => new MedicalHealthcareHistoriesViewModel()).Count() } });
        }

        [HttpPost]
        [Route("api/infosms")]
        public IActionResult InfoSms([FromBody] SmsInfoInputViewModel infoInput)
        {
            var packages = _context.Query<SmsPackagesDistribute>().Where(pd => pd.HealthFacilitiesId == infoInput.healthFacilitiesId && pd.Year >= DateTime.Now.Year && pd.MonthEnd >= DateTime.Now.Month && pd.IsDelete == 0).Select(u => new PackageDistributeViewModel(u, _connectionString)).ToList();
            if (packages.Count == 0 || infoInput.healthFacilitiesId == null) return StatusCode(422, _excep.Throw("Tài khoản chưa đăng ký gói SMS nào."));

            List<int> lstPackageId = new List<int>();

            foreach (var p in packages)
            {
                lstPackageId.Add(p.SmsPackageId);
            }

            var smsPackageUsed = _context.Query<SmsPackageUsed>().Where(pu => lstPackageId.Contains(pu.SmsPackageId)).ToList();
            int totalSms = 0;
            int totalSmsSend = infoInput.lstPatient.Count;

            foreach (var s in smsPackageUsed)
            {
                totalSms += s.Quantityused;
            }

            if (totalSms < totalSmsSend) return StatusCode(422, _excep.Throw("Không đủ số lượng tin nhắn."));

            List<SmsPackageUsed> lstSmsPackageUsed = new List<SmsPackageUsed>();
            List<BrandForPackage> lstBrandForPackages = new List<BrandForPackage>();
            
            //tru so luong tin nhan
            foreach (var s in smsPackageUsed)
            {
                if (totalSmsSend > 0)
                {
                    SmsPackageUsed smsPU = new SmsPackageUsed();
                    smsPU.HealthFacilitiesId = s.HealthFacilitiesId;
                    smsPU.SmsPackageId = s.SmsPackageId;
                    smsPU.SmsPackageUsedId = s.SmsPackageUsedId;
                    //BrandForPackage brandForPackage = new BrandForPackage();
                    //smsPU.SmsPackageId = s.SmsPackageId;

                    if (totalSmsSend >= s.Quantityused)
                    {
                        smsPU.Quantityused = 0;
                        totalSmsSend -= s.Quantityused;
                    }
                    else
                    {
                        totalSmsSend = 0;
                        smsPU.Quantityused = s.Quantityused - totalSmsSend;
                    }

                    lstSmsPackageUsed.Add(smsPU);
                }               
            }

            string code = "";
            string content = "";
            int templateId = 0;

            switch (infoInput.type)
            {
                case 1:
                    code = "A01.SMSTAIKHAM";
                    break;
                case 2:
                    code = "A02.SMSSINHNHAT";
                    break;
            }

            if (string.IsNullOrEmpty(infoInput.content) && infoInput.smsTemplateId == null)
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

            foreach (var p in infoInput.lstPatient)
            {
                SmsContent scontent = new SmsContent();

                content = RepalaceContentSms(content, p, packages[0]);
                scontent.Message = content;
                scontent.PhoneNumber = p.PhoneNumber;
                scontent.Brand = packages[0].SmsBrandsName;

                scontent.HealthFacilitiesId = infoInput.healthFacilitiesId.Value;
                scontent.SmsTemplateId = templateId;
                scontent.SmsPackagesDistributeId = packages[0].Id;

                lstContent.Add(scontent);
            }

            var Result = Utils.SendListSMS(_configuration, lstContent, lstSmsPackageUsed, infoInput.lstMedicalHealthcareHistories, infoInput.type);

            return Json(new ActionResultDto { Result = Result.Message });
        }

        public static string RepalaceContentSms(string content, Patient patient, PackageDistributeViewModel package)
        {
            string _content = content;
            if (!string.IsNullOrEmpty(content))
            {
                _content = _content
                    .Replace("<PHONGKHAM>", package.HealthFacilitiesName)
                    .Replace("<NGAYSINH>", patient.BirthYear.ToString())
                    .Replace("<HOTEN>", patient.FullName)
                    .Replace("<EMAIL>", patient.Email)
                    .Replace("<GIOITINH>", patient.Gender == 1 ? "Nam" : "Nữ")
                    //.Replace("<NGAYHIENTAI>", "")
                    //.Replace("<NGAYTAIKHAM>", "")
                    ;
            }

            return _content;
        }
    }

    public class BrandForPackage
    {
        public int SmsPackageId { get; set; }
        public int Quantity { get; set; }
    }
}