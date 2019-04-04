using System;
using SHCServer.Models;

namespace SHCServer.ViewModels
{
    public class SmsPackageDetailViewModel
    {
        public SmsPackageDetailViewModel()
        {

        }

        public SmsPackageDetailViewModel(SmsPackageDetail obj) : this()
        {
            Id          = obj.Id;
            SmsPackageId = obj.SmsPackageId;
            SmsFrom = obj.SmsFrom;
            SmsTo = obj.SmsTo;
            Cost = obj.Cost;
        }

        public virtual int Id { get; set; }

        public int SmsPackageId { get; set; }

        public int SmsFrom { get; set; }

        public int SmsTo { get; set; }

        public int Cost { get; set; }
    }

    public class PackageDetailInputViewModel
    {
        //public virtual int Id { get; set; }

        //public int SmsPackageId { get; set; }

        public int SmsFrom { get; set; }

        public int SmsTo { get; set; }

        public int Cost { get; set; }

        public int Index { get; set; }

        public static explicit operator int(PackageDetailInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}