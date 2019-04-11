using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class DoctorViewModel
    {
        protected DbContext context;

        public DoctorViewModel()
        {
        }

        public DoctorViewModel(Doctor obj, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            DoctorId = obj.DoctorId;
            FullName = obj.FullName;
            Avatar = obj.Avatar;
            AcademicId = obj.AcademicId;
            DegreeId = obj.DegreeId;
            Description = obj.Description;

            var academic = context.JoinQuery<Doctor, CategoryCommon>((d, c) => new object[]
                {
                    JoinType.InnerJoin, d.AcademicId == c.Id
                })
                .Where((d, c) => d.DoctorId == obj.DoctorId)
                .Select((d, c) => c).FirstOrDefault();

            var degree = context.JoinQuery<Doctor, CategoryCommon>((d, c) => new object[]
                {
                    JoinType.InnerJoin, d.DegreeId == c.Id
                })
                .Where((d, c) => d.DoctorId == obj.DoctorId)
                .Select((d, c) => c).FirstOrDefault();

            Specialist = context.JoinQuery<Doctor, DoctorSpecialists>((d, ds) => new object[]
                {
                    JoinType.InnerJoin, d.DoctorId == ds.DoctorId
                })
                .Where((d, ds) => d.DoctorId == obj.DoctorId)
                .Select((d, ds) => new DoctorSpecialistsViewModel(ds, connectionString)).ToList();

            Academic = academic != null ? academic.Name : "";
            Degree = degree != null ? degree.Name : "";


        }

        public string Academic { set; get; }
        public string Degree { set; get; }
        public List<DoctorSpecialistsViewModel> Specialist { set; get; }
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
        public string SpecialistCode { get; set; }
    }
}