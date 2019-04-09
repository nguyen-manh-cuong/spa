using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_doctors")]
    public class Doctor //: IEntity
    {
        public Doctor()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int DoctorId { set; get; }
        public string HisId { get; set; }
        public string FullName { set; get; }
        public int? BirthDate { get; set; }
        public int? BirthMonth { get; set; }
        public int BirthYear { get; set; }
        public int Gender { get; set; }
        public string TitleCode { get; set; }
        public string PositionCode { get; set; }
        public string NationCode { get; set; }
        public string EthnicityCode { get; set; }
        public DateTime? CertificationDate { set; get; }
        public int? AcademicId { get; set; }
        public int? DegreeId { set; get; }
        public string Email { get; set; }
        public string CertificationCode { get; set; }
        public string Address { get; set; }
        public string ProvinceCode { get; set; }
        public string DistrictCode { get; set; }
        public string PhoneNumber { get; set; }
        public string EducationCountryCode { get; set; }
        public string Avatar { get; set; }
        public string Description { set; get; }
        public int? PriceFrom { get; set; }
        public int? PriceTo { get; set; }
        public string PriceDescription { get; set; }
        public string Summary { get; set; }
        public bool? IsSync { get; set; }
        public bool? IsDelete { get; set; }
        public bool? IsActive { get; set; }
        public bool? AllowSearch { get; set; }
        public bool? AllowBooking { get; set; }
        public bool? AllowFilter { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}