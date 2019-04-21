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
    public class BookingInformationsController : BaseController
    {
        private readonly string _connectionString;

        public BookingInformationsController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        //[HttpPost]
        //[Route("api/infosms")]
        //public IActionResult InfoSms([FromBody] SmsInfoInputPhoneNumberViewModel infoInput)
        //{
        //    //
        //    var packages = _context.Query<SmsPackagesDistribute>().Where(pd => pd.HealthFacilitiesId == infoInput.healthFacilitiesId && pd.YearEnd >= DateTime.Now.Year && pd.MonthEnd >= DateTime.Now.Month && pd.IsDelete == false && pd.IsActive == true).Select(u => new PackageDistributeViewModel(u, _connectionString)).ToList();
        //    if (packages.Count == 0) return StatusCode(422, _excep.Throw("Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại. Mời bạn mua thêm gói SMS"));

        //    long totalSms = 0;
        //    int totalSmsSend = infoInput.lstPhoneNumber.Count;

        //    foreach (var s in packages)
        //    {
        //        totalSms += s.SmsPackageUsed.Quantityused;
        //    }

        //    if (totalSms < 1) return StatusCode(422, _excep.Throw("Không thể gửi tin do số lượng tin nhắn vượt quá gói SMS hiện tại. Mời bạn mua thêm gói SMS"));  

        //    //Xu ly tin nhan
        //    int indexM = 0;
        //    int indexUsed = 0;

        //    //danh sach sms content
        //    List<SmsContent> lstContent = new List<SmsContent>();

        //    foreach (var phoneNumber in infoInput.lstPhoneNumber)
        //    {
        //        indexM++;
        //        if (indexM > packages[indexUsed].SmsPackageUsed.Quantityused)
        //        {
        //            indexM = 0;
        //            indexUsed++;
        //        }

        //        SmsContent scontent = new SmsContent();
        //        scontent.SmsBrand = packages[indexUsed].SmsBrand;
        //        scontent.Message = "Mã đặt khám của bạn là: " + infoInput.ticketId;
        //        scontent.PhoneNumber = phoneNumber;

        //        if(infoInput.healthFacilitiesId != null)
        //        {
        //            scontent.HealthFacilitiesId = infoInput.healthFacilitiesId.Value;
        //            //scontent.SmsTemplateId = templateId;
        //            scontent.SmsPackagesDistributeId = packages[indexUsed].Id;
        //            scontent.SmsPackageUsedId = packages[indexUsed].SmsPackageUsed.SmsPackageUsedId;
        //            //scontent.PatientHistoriesId = m.PatientHistoriesId;
        //        }

        //        lstContent.Add(scontent);
        //    }

        //    var sendSMS = Utils.SendListSMS(lstContent, 3);
        //    var infoSms = SMS.SaveInfoSMS(_connectionString, sendSMS, 3);

        //    return Json(new ActionResultDto { Result = infoSms });
        //}

        [HttpPost]
        [Route("api/bookinginformations")]
        public IActionResult Create([FromBody] BookingInformationsInputViewModel bi)
        {
            var result = _context.Insert(new BookingInformations(bi));

            return Json(new ActionResultDto { Result = result });
        }


        /// <summary>
        /// GetAll
        /// </summary>
        /// <param name="skipCount"></param>
        /// <param name="maxResultCount"></param>
        /// <param name="sorting"></param>
        /// <param name="filter"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/bookinginformations")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<BookingInformations>().Where(b => b.BookingServiceType == 1);
            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "healthfacilities") && !string.IsNullOrWhiteSpace(value))
                        objs = objs.Where(b => b.HealthFacilitiesId.ToString() == value.Trim() || b.HealthFacilitiesId.ToString() == null);
                    if (string.Equals(key, "doctor") && !string.IsNullOrWhiteSpace(value))
                        objs = objs.Where(b => b.DoctorId.ToString() == value.Trim());
                    if (string.Equals(key, "status") && !string.IsNullOrWhiteSpace(value))
                    {
                        if (Convert.ToInt32(value) != 4)
                        {
                            objs = objs.Where(b => b.Status.ToString() == value.Trim());
                        }
                    }

                    if (string.Equals(key, "startTime")) objs = objs.Where(b => b.ExaminationDate>= DateTime.Parse(value));
                    if (string.Equals(key, "endTime")) objs = objs.Where(b => b.ExaminationDate <= DateTime.Parse(value));

                }

            }
            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<BookingInformations>(key))
                        continue;

                    objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
                }
            }
            else
            {
                objs = objs.OrderByDesc(b => b.CreateDate);
            }


            var rs = objs.GroupBy(p => p.DoctorId).Select(p => new BookingInformationsViewModel(p, _connectionString) {
                Quantity = objs.Where(o=>o.DoctorId==p.DoctorId).Count(),
                QuantityByStatusPending = objs.Where(o => o.Status == 1).Count(),
                QuantityByStatusDone = objs.Where(o => o.Status == 2).Count(),
                QuantityByStatusCancel = objs.Where(o => o.Status == 3).Count(),
                QuantityByStatusNew = objs.Where(o => o.Status == 0).Count(),
                QuantityByGenderMale = objs.Where(o => o.Gender == 1).Count(),//Nam
                QuantityByGenderFemale = objs.Where(o => o.Gender == 2).Count(),//Nu               
            });           
            return Json(new ActionResultDto { Result = new { Items = rs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList(), TotalCount = objs.Count() } });
        }


    }
}