using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sms_campaigns_details")]
    public class SmsCampaignDetail
    {
        public int CampaignDetailId { get; set; }
        public int CampaignlId { get; set; }
        public int? PatientId { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime SendDate { get; set; }
        public int Status { get; set; }
        public bool IsDelete { get; set; }
        public int CreateUserId { get; set; }
        public DateTime CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
