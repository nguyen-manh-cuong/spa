using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sms_template")]
    public class SmsTemplate : IEntity
    {
        public SmsTemplate()
        {

        }

        public SmsTemplate(SmsTemplateInputViewModel sms)
        {
            SmsTemplateName = sms.SmsTemplateName;
            SmsTemplateCode = sms.SmsTemplateCode;
            MessageType = sms.MessageType;
            SmsContent = sms.SmsContent;
            IsActive = sms.IsActive;
            ApplyAllSystem = sms.ApplyAllSystem;
            IsDelete = sms.IsDelete;
            CreateUserId = sms.UserId;
            CreateDate = DateTime.Now;

            TypeNumber = sms.TypeNumber;
            OrganizationCode = sms.OrganizationCode;
            OrganizationName = sms.OrganizationName;
            HealthFacilitiesId = sms.HealthFacilitiesId;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }

        public string SmsTemplateName { set; get; }

        public string SmsTemplateCode { get; set; }

        public int? MessageType { set; get; }

        public int? HealthFacilitiesId { set; get; }

        public string SmsContent { set; get; }

        public bool? IsActive { set; get; }

        public bool? ApplyAllSystem { set; get; }

        public bool IsDelete { set; get; }

        public int? CreateUserId { set; get; }

        public int? UpdateUserId { set; get; }

        public DateTime? UpdateDate { set; get; }

        public DateTime? CreateDate { set; get; }

        public string TypeNumber { set; get; }

        public string OrganizationCode { set; get; }

        public string OrganizationName { set; get; }
    }

    public class SmsTemplateMapBase<TUser> : EntityTypeBuilder<TUser> where TUser : SmsTemplate
    {
        public SmsTemplateMapBase()
        {
            // Ignore(o => o.UserGroups);
            Property(o => o.Id).IsAutoIncrement().IsPrimaryKey();
        }
    }

    public class SmsTemplateMap : SmsTemplateMapBase<SmsTemplate>
    {
        public SmsTemplateMap()
        {
            MapTo("sys_sms_template");
            // Ignore(a => a.UserGroups);
        }
    }
}
