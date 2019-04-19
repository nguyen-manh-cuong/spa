using System;
using System.Collections.Generic;
using System.Linq;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class SmsPackageViewModel
    {
        protected DbContext context;

        public SmsPackageViewModel()
        {
        }

        public SmsPackageViewModel(SmsPackage obj, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            Id          = obj.Id;
            Name        = obj.Name;
            Description = obj.Description;
            Cost = obj.Cost;
            Quantity = obj.Quantity;
            IsActive = obj.IsActive;

            Details = context.JoinQuery<SmsPackage, SmsPackageDetail>((package, pd) => new object[] { JoinType.InnerJoin, package.Id == pd.SmsPackageId })
                             .Where((p, pd) => p.Id == obj.Id)
                             .Select((p, pd) => new SmsPackageDetailViewModel(pd))
                             .ToList();

            //Distribute = context.Query<SmsPackagesDistribute>().Where(pd => pd.SmsPackageId == obj.Id).Count();
            IsDeleteDistribute = context.Query<SmsPackagesDistribute>().Where(pd => pd.SmsPackageId == obj.Id && pd.IsDelete == false).Count();
        }

        public int Id { set; get; }

        public string Name { set; get; }

        public string Description { set; get; }

        public long Cost { set; get; }

        public int Quantity { set; get; }

        public bool? IsActive { set; get; }

        public IList<SmsPackageDetailViewModel> Details { get; set; }

        public int Distribute { get; set; }

        public int? IsDeleteDistribute { set; get; }
    }

    public class PackageInputViewModel
    {
        public int? Id { set; get; }

        public string Name { set; get; }

        public string Description { set; get; }

        public long Cost { set; get; }

        public int Quantity { set; get; }

        public bool? IsActive { set; get; }

        public int? UserId { set; get; }

        public List<PackageDetailInputViewModel> Details { set; get; }

        public static explicit operator int(PackageInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}