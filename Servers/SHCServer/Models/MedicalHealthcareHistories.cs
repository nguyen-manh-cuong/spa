using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("medical_healthcare_histories")]
    public class MedicalHealthcareHistories
    {
        public MedicalHealthcareHistories()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int PatientHistoriesId { set; get; }
        public int? HealthFacilitiesId { set; get; }
        public string HealthInsuranceNumber { set; get; }
        public int DoctorId { set; get; }
        public int PatientId { set; get; }
        public DateTime? ReExaminationDate { set; get; }
        public DateTime CreateDate { set; get; }
        public DateTime BirthDay { set; get; }
        public int IsReExamination { set; get; }
        public int IsBirthDay { set; get; }
    }
}