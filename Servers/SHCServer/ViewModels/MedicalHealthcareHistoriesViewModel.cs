using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class MedicalHealthcareHistoriesViewModel
    {
        protected DbContext context;

        public MedicalHealthcareHistoriesViewModel()
        {
        }

        public MedicalHealthcareHistoriesViewModel(MedicalHealthcareHistories obj, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            PatientHistoriesId = obj.PatientHistoriesId;
            HealthFacilitiesId = obj.HealthFacilitiesId;
            HealthInsuranceNumber = obj.HealthInsuranceNumber;
            DoctorId = obj.DoctorId;
            PatientId = obj.PatientId;
            ReExaminationDate = obj.ReExaminationDate;
            IsReExamination = obj.IsReExamination;
            IsBirthDay = obj.IsBirthDay;
            Patient = context.Query<Patient>().Where(p => p.PatientId == obj.PatientId).FirstOrDefault();
        }

        public int PatientHistoriesId { set; get; }
        public int? HealthFacilitiesId { set; get; }
        public string HealthInsuranceNumber { set; get; }
        public int DoctorId { set; get; }
        public int PatientId { set; get; }
        public DateTime? ReExaminationDate { get; set; }
        public Patient Patient { get; set; }
        //public DateTime CreateDate { get; set; }

        public int IsReExamination { set; get; }
        public int IsBirthDay { set; get; }
    }
}