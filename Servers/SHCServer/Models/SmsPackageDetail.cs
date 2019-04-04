using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sms_packages_detail")]
    public class SmsPackageDetail
    {
        public SmsPackageDetail()
        {

        }

        public SmsPackageDetail(SmsPackageDetail packages): this()
        {
            SmsPackageId = packages.SmsPackageId;
            SmsFrom = packages.SmsFrom;
            SmsTo = packages.SmsTo;
            Cost = packages.Cost;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public virtual int Id { get; set; }
        public int SmsPackageId { get; set; }
        public int SmsFrom { get; set; }
        public int SmsTo { get; set; }
        public int Cost { get; set; }
    }
}