using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer
{
    public class InfoSms
    {
        public static void SaveInfoSms(IConfiguration configuration, SmsContent content, List<SmsPackageUsed> lstSmsPackageUsed, List<MedicalHealthcareHistories> lstMedicalHealthcareHistories, long status, int type)
        {
            DbContext _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            if (_context != null)
            {
                SmsLogs smsLog = new SmsLogs();
                smsLog.PhoneNumber = content.PhoneNumber;
                smsLog.Message = content.Message;//result.message;
                smsLog.Status = Convert.ToInt32(status);
                smsLog.HealthFacilitiesId = content.HealthFacilitiesId;
                smsLog.SmsTemplateId = content.SmsTemplateId;
                smsLog.SmsPackagesDistributeId = content.SmsPackagesDistributeId;
                smsLog.SentDate = DateTime.Now;
                smsLog.LogType = 1;

                foreach (var smsPackageUsed in lstSmsPackageUsed)
                {
                    _context.Update<SmsPackageUsed>(p => p.SmsPackageUsedId == smsPackageUsed.SmsPackageUsedId, a => new SmsPackageUsed
                    {
                        Quantityused = smsPackageUsed.Quantityused
                    });
                }

                foreach (var medicalHealthcareHistories in lstMedicalHealthcareHistories)
                {
                    if (type == 1)
                    {
                        _context.Update<MedicalHealthcareHistories>(m => m.PatientHistoriesId == medicalHealthcareHistories.PatientHistoriesId, a => new MedicalHealthcareHistories
                        {
                            IsReExamination = 1
                        });
                    }
                    else if (type == 2)
                    {
                        _context.Update<MedicalHealthcareHistories>(m => m.PatientHistoriesId == medicalHealthcareHistories.PatientHistoriesId, a => new MedicalHealthcareHistories
                        {
                            IsBirthDay = 1
                        });
                    }
                }

                _context.Insert(smsLog);
            }
        }
    }
}