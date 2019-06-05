using System;
using System.Collections.Generic;
using System.Linq;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer
{
    public class SMS
    {
        public static string SaveInfoSMS(string configuration, List<SmsRespone> resps, int type)
        {
            DbContext _context = new MySqlContext(new MySqlConnectionFactory(configuration));
            List<SmsLogs> lstSmsLog = new List<SmsLogs>();
            List<string> lstSmsUsed = new List<string>();
            int fail = 0;
            string result = "";

            foreach (var resp in resps)
            {
                SmsLogs smsLog = new SmsLogs();
                smsLog.PhoneNumber = resp.PhoneNumber;
                smsLog.Message = resp.Message;
                smsLog.ResultMessage = resp.Result;
                smsLog.Status = resp.Code == 0 ? 0 : 1;
                smsLog.HealthFacilitiesId = resp.HealthFacilitiesId;
                smsLog.SmsTemplateId = resp.SmsTemplateId;
                //smsLog.SmsTemplateCode = resp.SmsTemplateCode;
                smsLog.SmsPackagesDistributeId = resp.SmsPackagesDistributeId;
                smsLog.SentDate = DateTime.Now;
                smsLog.LogType = 1;
                smsLog.Telco = resp.Telco;
                smsLog.ObjectId = resp.PatientId;
                smsLog.ObjectType = resp.ObjectType;
                lstSmsLog.Add(smsLog);

                result = resp.Result;
                if (resp.Code == 0) fail++;
                if (lstSmsUsed.IndexOf(resp.SmsPackageUsedId.ToString()) < 0 && resp.Code != 0)//
                {
                    lstSmsUsed.Add(resp.SmsPackageUsedId.ToString());
                }
                if (type == 1)
                {
                    _context.Update<MedicalHealthcareHistories>(m => m.PatientHistoriesId == resp.PatientHistoriesId, a => new MedicalHealthcareHistories
                    {
                        IsReExamination = true
                    });
                }
                else if (type == 2)
                {
                    _context.Update<MedicalHealthcareHistories>(m => m.PatientHistoriesId == resp.PatientHistoriesId, a => new MedicalHealthcareHistories
                    {
                        IsBirthDay = true
                    });
                }
            }

            foreach (string smsUsedId in lstSmsUsed)
            {
                int totalSms = 0;

                foreach (var resp in resps)
                {
                    if (smsUsedId == resp.SmsPackageUsedId.ToString()) totalSms++;
                }

                _context.Update<SmsPackageUsed>(u => u.SmsPackageUsedId == int.Parse(smsUsedId), pu => new SmsPackageUsed
                {
                    Quantityused = pu.Quantityused - totalSms
                });
            }

            _context.InsertRange(lstSmsLog);

            return "Tổng số SMS đã gửi/Số sms gửi lỗi:  " + resps.Count + "/" + fail + "<br> Thông tin lỗi: " + result;
        }
    }
}