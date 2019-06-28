using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class PackageDistributeViewModel : SmsPackagesDistributeBase
    {
        protected DbContext context;

        public PackageDistributeViewModel()
        {
        }

        public PackageDistributeViewModel(SmsPackagesDistribute PackagesDistribute, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            Id = PackagesDistribute.Id;
            SmsPackageId = PackagesDistribute.SmsPackageId;
            HealthFacilitiesId = PackagesDistribute.HealthFacilitiesId;

            SmsBrandsId = PackagesDistribute.SmsBrandsId;
            YearStart = PackagesDistribute.YearStart;
            YearEnd = PackagesDistribute.YearEnd;
            MonthStart = PackagesDistribute.MonthStart;
            MonthEnd = PackagesDistribute.MonthEnd;
            IsActive = PackagesDistribute.IsActive;

            var Packages = context.JoinQuery<SmsPackagesDistribute, SmsPackage>((d, p) => new object[]
                       {
                            JoinType.InnerJoin, d.SmsPackageId == p.Id
                       })
                        .Where((d, p) => d.Id == PackagesDistribute.Id)
                        .Select((d, p) => p).FirstOrDefault();

            var pack = context.Query<SmsPackage>().Where(p => p.Id == PackagesDistribute.SmsPackageId).FirstOrDefault();
                        

            var HealthFacilities = context.JoinQuery<SmsPackagesDistribute, HealthFacilities>((d, h) => new object[]
                       {
                            JoinType.InnerJoin, d.HealthFacilitiesId == h.HealthFacilitiesId
                       })
                        .Where((d, h) => d.Id == PackagesDistribute.Id && d.IsDelete==false && h.IsDelete==false && h.IsActive==true)
                        .Select((d, h) => h).FirstOrDefault();

            var health = context.Query<HealthFacilities>().Where(h => h.HealthFacilitiesId == PackagesDistribute.HealthFacilitiesId).FirstOrDefault();

            SmsBrand = context.JoinQuery<SmsPackagesDistribute, SmsBrands>((d, b) => new object[]
                       {
                            JoinType.InnerJoin, d.SmsBrandsId == b.SmsBrandId
                       })
                        .Where((d, b) => d.Id == PackagesDistribute.Id && d.IsDelete==false)
                        .Select((d, b) => b).FirstOrDefault();

            SmsPackageUsed = context.JoinQuery<SmsPackagesDistribute, SmsPackageUsed>((d, u) => new object[]
                       {
                            JoinType.InnerJoin, d.Id==u.SmsPackageDistributeId
                       })
                        .Where((d, u) => d.Id == Id && d.IsDelete == false && d.IsActive==true && u.IsDelete==false).Select((d, u) => u).FirstOrDefault();

            PackageName = pack != null ? pack.Name : "";
            Quantity = Packages != null ? Packages.Quantity : 0;
            Cost = Packages != null ? Packages.Cost : 0;
            HealthFacilitiesName = health != null ? health.Name : "";
            HealthFacilitiesCode = health != null ? health.Code : "";
            SmsBrandsName = SmsBrand != null ? SmsBrand.BrandName : "";
        }

        //public override int Id { set; get; }

        public string Locality { set; get; }

        public long Quantity { get; set; }
        public long QuantityUsed { get; set; }

        public long Amount { get; set; }

        public string PackageName { get; set; }

        public long Cost { get; set; }

        public string HealthFacilitiesName { get; set; }

        public string HealthFacilitiesCode { get; set; }

        public SmsBrands SmsBrand { get; set; }

        public SmsPackageUsed SmsPackageUsed { get; set; }

        public string SmsBrandsName { get; set; }
    }

    public class PackageDistributeInputViewModelArray
    {
        public int? Id { set; get; }
        public int SmsPackageId { set; get; }
        public int SmsBrandsId { set; get; }
        public List<int> HealthFacilitiesId { set; get; }
        public int MonthStart { get; set; }
        public int MonthEnd { get; set; }
        public int YearStart { get; set; }
        public int YearEnd { get; set; }
        public bool IsActive { set; get; }
        public int UserId { set; get; }

        public static explicit operator int(PackageDistributeInputViewModelArray v)
        {
            throw new NotImplementedException();
        }
    }

    public class PackageDistributeInputViewModel
    {
        public int? Id { set; get; }
        public int SmsPackageId { set; get; }
        public int SmsBrandsId { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int MonthStart { get; set; }
        public int MonthEnd { get; set; }
        public int YearStart { get; set; }
        public int YearEnd { get; set; }
        public bool IsActive { set; get; }
        public int UserId { set; get; }

        public static explicit operator int(PackageDistributeInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}
