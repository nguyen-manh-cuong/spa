using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_patients")]
    public class Patient //: IEntity
    {
        public Patient()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int PatientId { set; get; }
        public string Code { set; get; }
        public string FullName { set; get; }
        public int? BirthDate { set; get; }
        public int? BirthMonth { set; get; }
        public int BirthYear { set; get; }
        public int Gender { set; get; }
        public int? Identification { set; get; }
        public string Address { set; get; }
        public string PhoneNumber { set; get; }
        public string Email { set; get; }

        public string ProvinceCode { set; get; }
        public string DistrictCode { set; get; }
        public string WardCode { set; get; }
    }
}