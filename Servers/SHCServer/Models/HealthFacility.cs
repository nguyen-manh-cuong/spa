using System;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("cats_healthfacilities")]
    public class HealthFacility
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int HealthFacilitiesId { get; set; }

        public string Name { get; set; }
        public string Code { get; set; }

        public string Address { get; set; }
        public string ProvinceCode { get; set; }
        public string DistrictCode { get; set; }
        public string WardCode { get; set; }
        public string HealthFacilitiesRoute { get; set; }
        public string HealthFacilitiesClass { get; set; }
        public int GroupId { get; set; }
        public string HealthFacilitiesParentCode { get; set; }
        public string GoverningBodyId { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Fax { get; set; }
        public bool IsExternalCapacity { get; set; }
        public bool IsRegisterInitialMedicalExamination { get; set; }
        public bool IsContract { get; set; }
        public bool AllowSearch { get; set; } = true;
        public bool AllowBooking { get; set; } = true;
        public bool AllowFilter { get; set; } = true;
        public bool IsDelete { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public int? CreateUserId { get; set; }
        public DateTime CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime?UpdateDate { get; set; }
        public bool IsSync { get; set; } = true;
        public string Avatar { get; set; }
    }
}
