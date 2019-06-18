using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sms_campaigns")]
    public class SmsCampaign
    {
        public int CampaignId { get; set; }
        public string CampaignName { get; set; }
        public string SmsContent { get; set; }
        public int? MessageType { get; set; }
        public int HealthFacilitiesId { get; set; }
        public int? SmsBrandId { get; set; }
        public int SendType { get; set; }
        public DateTime SendDate { get; set; }
        public int SendHour { get; set; }
        public int SendMinute { get; set; }
        public int Status { get; set; }
        public bool IsDelete { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
