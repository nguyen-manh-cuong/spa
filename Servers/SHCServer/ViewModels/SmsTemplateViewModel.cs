using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel;

namespace SHCServer.ViewModels
{
    public class SmsTemplateViewModel
    {
        protected DbContext context;

        public SmsTemplateViewModel()
        {
        }

        public SmsTemplateViewModel(SmsTemplate obj, string connectionString) : this()
        {
            //Id = obj.Id;
            SmsTemplateName = obj.SmsTemplateName;
            MessageType = obj.MessageType;
            SmsContent = obj.SmsContent;
            Status = obj.Status;
            ApplyAllSystem = obj.ApplyAllSystem;
            IsDelete = obj.IsDelete;
            CreateUserId = obj.CreateUserId;
            UpdateUserId = obj.UpdateUserId;
            TypeNumber = obj.TypeNumber;
            OrganizationCode = obj.OrganizationCode;
            HealthFacilitiesConfigs = context.JoinQuery<SmsTemplate, HealthFacilitiesConfigs>((t, h) => new object[]
                       {
                            JoinType.InnerJoin, t.Id == h.Values
                       })
                        .Where((t, h) => t.Id == obj.Id)
                        .Select((t, h) => h).Count();
        }

        public int Id { set; get; }

        public string SmsTemplateName { set; get; }

        public int? HealthFacilitiesId { set; get; }

        public int? MessageType { set; get; }

        public string SmsContent { set; get; }

        public bool? Status { set; get; }

        public bool? ApplyAllSystem { set; get; }

        public bool IsDelete { set; get; }

        public int? CreateUserId { set; get; }

        public int? UpdateUserId { set; get; }

        public DateTime? UpdateDate { set; get; }

        public DateTime? CreateDate { set; get; }

        public string TypeNumber { set; get; }

        public string OrganizationCode { set; get; }

        public string OrganizationName { set; get; }

        public int HealthFacilitiesConfigs { set; get; }
    }

    //them sua
    public class SmsTemplateInputViewModel
    {
        public int? Id { set; get; }

        public string SmsTemplateName { set; get; }

        public int? HealthFacilitiesId { set; get; }

        public int? MessageType { set; get; }

        public string SmsContent { set; get; }

        public bool? Status { set; get; }

        public bool? ApplyAllSystem { set; get; }

        public bool IsDelete { set; get; }

        public int? CreateUserId { set; get; }

        public int? UpdateUserId { set; get; }

        public DateTime? UpdateDate { set; get; }

        public DateTime? CreateDate { set; get; }

        public string TypeNumber { set; get; }

        public string OrganizationCode { set; get; }

        public string OrganizationName { set; get; }

        public int? UserId { set; get; }
    }
}
