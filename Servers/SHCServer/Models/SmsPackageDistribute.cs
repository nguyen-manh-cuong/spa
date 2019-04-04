using SHCServer.ViewModels;
using Viettel.Annotations;

namespace SHCServer.Models
{
    public class SmsPackagesDistributeBase : IEntity
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public int SmsPackageId { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int SmsBrandsId { set; get; }
        public int Year { set; get; }
        public int MonthStart { set; get; }
        public int MonthEnd { set; get; }
        public int Status { set; get; }
        public int IsDelete { set; get; }
    }

    [Table("sms_packages_distribute")]
    public class SmsPackagesDistribute : SmsPackagesDistributeBase
    {
        public SmsPackagesDistribute()
        {

        }

        public SmsPackagesDistribute(PackageDistributeInputViewModel obj) : this()
        {
            SmsPackageId = obj.SmsPackageId;
            HealthFacilitiesId = obj.HealthFacilitiesId;
            Status = obj.Status;
        }
    }
}
