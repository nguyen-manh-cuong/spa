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
        public int type { set; get; }
        public string content { set; get; }
    }
}