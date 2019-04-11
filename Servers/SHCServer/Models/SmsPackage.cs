using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sms_packages")]
    public class SmsPackage
    {
        public SmsPackage()
        {

        }

        public SmsPackage(PackageInputViewModel packages): this()
        {
            Name = packages.Name;
            Description = packages.Description;
            Quantity = packages.Quantity;
            Cost = packages.Cost;
            IsActive = packages.IsActive;
            CreateDate = DateTime.Now;
            CreateUserId = packages.UserId;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public virtual int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public long Cost { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDelete { get; set; }

        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateUserId { get; set; }
    }
}