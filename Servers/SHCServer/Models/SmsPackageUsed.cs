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
        public int HealthFacilitiesId { set; get; }
        public int SmsPackageId { set; get; }
        public int Quantityused { set; get; }
    }
}