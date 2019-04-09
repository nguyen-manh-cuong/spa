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
        public int IsReExamination { set; get; }
        public int IsBirthDay { set; get; }
        //patient
        public string Code { set; get; }
        public string FullName { set; get; }
        public int BirthDate { set; get; }
        public int BirthMonth { set; get; }
        public int BirthYear { set; get; }
        public int Gender { set; get; }
        public string PhoneNumber { set; get; }
        public string Address { set; get; }
        public string Email { set; get; }
    }
}