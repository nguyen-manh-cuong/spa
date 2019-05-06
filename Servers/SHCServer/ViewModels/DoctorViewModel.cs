using SHCServer.Models;
using System;
using System.Collections.Generic;
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
            AcademicId = obj.AcademicId;
            Address = obj.Address;
            AllowBooking = obj.AllowBooking;
            AllowFilter = obj.AllowFilter;
            AllowSearch = obj.AllowSearch;
            Avatar = obj.Avatar;
            BirthDate = obj.BirthDate;
            BirthMonth = obj.BirthMonth;
            BirthYear = obj.BirthYear;
            CertificationCode = obj.CertificationCode;
            CertificationDate = obj.CertificationDate;
            CreateUserId = obj.CreateUserId;
            DegreeId = obj.DegreeId;
            Description = obj.Description;
            DistrictCode = obj.DistrictCode;
            DoctorId = obj.DoctorId;
            EducationCountryCode = obj.EducationCountryCode;
            Email = obj.Email;
            EthnicityCode = obj.EthnicityCode;
            FullName = obj.FullName;
            Gender = obj.Gender;
            IsActive = obj.IsActive;
            IsDelete = obj.IsDelete;
            IsSync = obj.IsSync;
            NationCode = obj.NationCode;
            PhoneNumber = obj.PhoneNumber;
            PositionCode = obj.PositionCode;
            PriceFrom = obj.PriceFrom;
            PriceTo = obj.PriceTo;
            PriceDescription = obj.PriceDescription;
            ProvinceCode = obj.ProvinceCode;
            Summary = obj.Summary;
            TitleCode = obj.TitleCode;
            CreateDate = obj.CreateDate;
            UpdateDate = obj.UpdateDate;
            UpdateUserId = obj.UpdateUserId;
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
                }).Where((d,ds)=>ds.IsDelete==false && ds.IsActive==true && ds.DoctorId==obj.DoctorId).Select((d, ds) => new DoctorSpecialists() {
                    DoctorId = ds.DoctorId,
                    SpecialistCode = ds.SpecialistCode
                }).ToList();

            HealthFacilities = context.JoinQuery<Doctor, HealthFacilitiesDoctors>((d, hf) => new object[]
               {
                    JoinType.InnerJoin,d.DoctorId==hf.DoctorId
               }).Where((d,hf)=>hf.IsDelete==false && hf.IsActive==true && hf.DoctorId==obj.DoctorId).Select((d, hf) => new HealthFacilitiesDoctors()
               {
                   DoctorId=hf.DoctorId,
                   HealthFacilitiesId=hf.HealthFacilitiesId
               }).ToList();

            Academic = academic != null ? academic.Name : "";
            Degree = degree != null ? degree.Name : "";
        }

        public string Academic { set; get; }
        public string Degree { set; get; }
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
        public List<HealthFacilitiesDoctors> HealthFacilities { set; get; }
        public List<DoctorSpecialists> Specialist { set; get; }
    }

    public class DoctorInputViewModel
    {
        public DoctorInputViewModel()
        {
        }


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
        public string CertificationDate { set; get; }
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
        public List<HealthFacilitiesDoctors> HealthFacilities { set; get; }
        public List<DoctorSpecialists> Specialist { set; get; }
        public string Healths { get; set; }
        public string Specials { get; set; }
    }

}