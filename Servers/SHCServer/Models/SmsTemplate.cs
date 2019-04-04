﻿using System;
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
            MessageType = sms.MessageType;
            SmsContent = sms.SmsContent;
            Status = sms.Status;
            ApplyAllSystem = sms.ApplyAllSystem;
            IsDelete = sms.IsDelete;
            CreateUser = sms.CreateUser;
            UpdateUser = sms.UpdateUser;
            //UpdateDate = sms.UpdateDate;
            TypeNumber = sms.TypeNumber;
            OrganizationCode = sms.OrganizationCode;
            OrganizationName = sms.OrganizationName;
            HealthFacilitiesId = sms.HealthFacilitiesId;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }

        public string SmsTemplateName { set; get; }

        public int? MessageType { set; get; }

        public int? HealthFacilitiesId { set; get; }

        public string SmsContent { set; get; }

        public bool? Status { set; get; }

        public bool? ApplyAllSystem { set; get; }

        public bool IsDelete { set; get; }

        public string CreateUser { set; get; }

        public string UpdateUser { set; get; }

        //public DateTime UpdateDate { set; get; }

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