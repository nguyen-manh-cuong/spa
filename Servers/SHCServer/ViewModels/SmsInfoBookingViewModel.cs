using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class SmsInfoBookingViewModel
    {

    }

    public class SmsInfoBookingInputViewModel
    {
        public List<BookingInformationsViewModel> lstMedicalHealthcareHistories { set; get; }
        public int? healthFacilitiesId { set; get; }
        public int? smsTemplateId { set; get; }
        public int type { set; get; }
        public string content { set; get; }
        public int? objectType { get; set; }

    }

    //public class SmsInfoInputPhoneNumberViewModel
    //{
    //    public int? healthFacilitiesId { set; get; }
    //    public List<string> lstPhoneNumber { set; get; }
    //    public string ticketId { set; get; }
    //}
}