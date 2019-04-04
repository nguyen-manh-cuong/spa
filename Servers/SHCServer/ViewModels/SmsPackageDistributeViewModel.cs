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
            Year = PackagesDistribute.Year;
            MonthStart = PackagesDistribute.MonthStart;
            MonthEnd = PackagesDistribute.MonthEnd;
            Status = PackagesDistribute.Status;

            var Packages = context.JoinQuery<SmsPackagesDistribute, SmsPackage>((d, p) => new object[]
                       {
                            JoinType.InnerJoin, d.SmsPackageId == p.Id
                       })
                        .Where((d, p) => d.Id == PackagesDistribute.Id)
                        .Select((d, p) => p).FirstOrDefault();

            var HealthFacilities = context.JoinQuery<SmsPackagesDistribute, HealthFacilities>((d, h) => new object[]
                       {
                            JoinType.InnerJoin, d.HealthFacilitiesId == h.HealthFacilitiesId
                       })
                        .Where((d, h) => d.Id == PackagesDistribute.Id)
                        .Select((d, h) => h).FirstOrDefault();

            var SmsBrands = context.JoinQuery<SmsPackagesDistribute, SmsBrands>((d, b) => new object[]
                       {
                            JoinType.InnerJoin, d.SmsBrandsId == b.SmsBrandId
                       })
                        .Where((d, b) => d.Id == PackagesDistribute.Id)
                        .Select((d, b) => b).FirstOrDefault();

            PackageName = Packages.Name;
            Quantity = Packages.Quantity;
            Cost = Packages.Cost;
            HealthFacilitiesName = HealthFacilities.Name;
            SmsBrandsName = SmsBrands.BrandName;
        }

        //public override int Id { set; get; }

        public string Locality { set; get; }

        public int Quantity { get; set; }

        public string PackageName { get; set; }

        public int Cost { get; set; }

        public string HealthFacilitiesName { get; set; }

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
        public int Year { get; set; }
        public int Status { set; get; }

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
        public int Year { get; set; }
        public int Status { set; get; }

        public static explicit operator int(PackageDistributeInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}
