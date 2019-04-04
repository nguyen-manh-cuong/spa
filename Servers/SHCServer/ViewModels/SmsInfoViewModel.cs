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
        public List<Patient> lstPatient { set; get; }  
        public List<MedicalHealthcareHistories> lstMedicalHealthcareHistories { set; get; }
        public int? healthFacilitiesId { set; get; }       
        public int type { set; get; }
        public string content { set; get; }
        public int? smsTemplateId { set; get; }
    }
}