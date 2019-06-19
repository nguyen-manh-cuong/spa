using System;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_users")]
    public class UserMDM //: IEntity
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int UserId { get; set; }

        public string UserName { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public int AccountType { get; set; }
        public int Sex { get; set; }
        public DateTime? BirthDay { get; set; }
        public DateTime? UpdateDate { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public int? UpdateUserId { get; set; }
        public int? Status { get; set; }

        // Location
        public string ProvinceCode { get; set; }

        public string DistrictCode { get; set; }
        public string WardCode { get; set; }
        public string Address { get; set; }

        public string Identification { get; set; }
        public string CertificationCode { get; set; }
        public string Insurrance { get; set; }
        public string LisenceCode { get; set; }
        public bool? IsDelete { get; set; }
    }
}