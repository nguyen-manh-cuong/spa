using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sms_package_used")]
    public class SmsPackageUsed //: IEntity
    {
        public SmsPackageUsed()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int SmsPackageUsedId { set; get; }
        public int SmsPackageDistributeId { get; set; }
        public long Quantityused { set; get; }
        public bool IsDelete { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateUserId { get; set; }
    }
}