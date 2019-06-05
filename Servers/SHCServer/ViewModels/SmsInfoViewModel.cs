using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class SmsInfoViewModel
    {

    }

    public class SmsInfoInputViewModel
    {
        public List<MedicalHealthcareHistoriesViewModel> lstMedicalHealthcareHistories { set; get; }
        public int? healthFacilitiesId { set; get; }
        public int? smsTemplateId { set; get; }
        public string SmsTemplateCode { get; set; }
        public int type { set; get; }
        public string content { set; get; }
        public int? objectType { get; set; }
        public int? patientId { get; set; }

    }

    //public class SmsInfoInputPhoneNumberViewModel
    //{
    //    public int? healthFacilitiesId { set; get; }
    //    public List<string> lstPhoneNumber { set; get; }
    //    public string ticketId { set; get; }
    //}
}