using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_healthfacilities")]
    public class HealthFacilities //: IEntity
    {
        public HealthFacilities()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int HealthFacilitiesId { set; get; }
        public string Name { set; get; }
        public string Code { set; get; }
        public string DistrictCode { set; get; }
        public string ProvinceCode { set; get; }
        public string Address { set; get; }
        public int? Specialist { set; get; }
        public bool AllowSearch { set; get; }
        public bool AllowBooking { set; get; }
        public bool AllowFilter { set; get; }
        public bool IsActive { set; get; }
        public bool IsDelete { set; get; }
    }
}