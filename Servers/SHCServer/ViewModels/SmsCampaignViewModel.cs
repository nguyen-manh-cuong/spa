using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class SmsCampaignViewModel
    {
        protected DbContext context;
        public SmsCampaignViewModel(SmsCampaign obj,string connectionString)
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            CampaignId = obj.CampaignId;
            CampaignName = obj.CampaignName;
            SendType = obj.SendType;
            SendDate = obj.SendDate;
            SendHour = obj.SendHour;
            SendMinute = obj.SendMinute;
            IsDelete = obj.IsDelete;
            Status = obj.Status;

            HealthFacilities = context.Query<HealthFacilities>().Where(h => h.HealthFacilitiesId == obj.HealthFacilitiesId && h.IsDelete == false && h.IsActive == true).FirstOrDefault();

            MessageType = context.Query<CategoryCommon>().Where(cc => cc.Code.Equals("CSKH") && cc.Type.Equals("LOAITINNHAN") && cc.IsDelete==false && cc.IsActive==true).FirstOrDefault();

            SmsBrand = context.Query<SmsBrand>().Where(sb => sb.SmsBrandId == obj.SmsBrandId && sb.IsDelete == false && sb.IsActive == true).FirstOrDefault();

            SmsPackageUsed = context.Query<SmsPackageUsed>()
                .Where(spu => spu.HealthFacilitiesId == obj.HealthFacilitiesId && spu.IsDelete==false)
                .OrderByDesc(spu=>spu.CreateDate).ToList();
            //Lấy tổng số sms còn lại 

            SmsContent = context.Query<SmsTemplate>()
                .Where(st => st.SmsTemplateCode == obj.SmsContent && st.IsDelete==false && st.IsActive==true).FirstOrDefault();

            var campaignDetails = context.Query<SmsCampaign>()
                .Where(sc => sc.CampaignId == obj.CampaignId && sc.IsDelete == false)
                .InnerJoin<SmsCampaignDetail>((sc, scd) => sc.CampaignId == scd.CampaignlId && IsDelete == false);

            CampaignDetails = new List<SmsCampaignDetail>();

            foreach(var item in campaignDetails.Select((sc,scd)=>scd).ToList())
            {
                CampaignDetails.Add(item);
            }

        }
        public int? CampaignId { get; set; }
        public HealthFacilities HealthFacilities { get; set; }
        public string CampaignName { get; set; }
        public CategoryCommon MessageType { get; set; }
        public SmsBrand SmsBrand { get; set; }
        public List<SmsPackageUsed> SmsPackageUsed { get; set; }
        public SmsTemplate SmsContent { get; set; }
        public int? SendType { get; set; }
        public DateTime? SendDate { get; set; }
        public int? SendHour { get; set; }
        public int? SendMinute { get; set; }
        public bool? IsDelete { get; set; }
        public int? Status { get; set; }
        public List<SmsCampaignDetail> CampaignDetails { get; set; }
    }
}
