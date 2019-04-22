using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sms_logs")]
    public class SmsLogs : IEntity
    {
        public SmsLogs()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int SmsTemplateId { set; get; }
        public int SmsPackagesDistributeId { set; get; }
        public string PhoneNumber { set; get; }
        public string Message { set; get; }
        public int? Status { set; get; }
        public DateTime SentDate { set; get; }
        public int? LogType { set; get; }
        public string Telco { set; get; }
        public string ResultMessage { set; get; }
    }
}