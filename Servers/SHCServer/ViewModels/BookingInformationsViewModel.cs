using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel;
using Viettel.MySql;


namespace SHCServer.ViewModels
{
    public class BookingInformationsViewModel
    {
        protected DbContext context;

        public BookingInformationsViewModel()
        {

        }
       


    }

    public class BookingInformationsInputViewModel
    {
        public string address { set; get; }
        public int? birthDay { set; get; }
        public int? birthMonth { set; get; }
        public int birthYear { set; get; }
        public string bookingRepresent { set; get; }
        public string bookingSecondUser { set; get; }
        public int bookingType { set; get; }
        public string bookingUser { set; get; }
        public string districtCode { set; get; }
        public string districtCodeExamination { set; get; }
        public int? doctorId { set; get; }
        public string email { set; get; }
        public string emailRepresent { set; get; }
        public string examinationDate { set; get; }
        public string examinationTime { set; get; }
        public int? examinationWorkingTime { set; get; }
        public int gender { set; get; }
        public int healthfacilitiesId { set; get; }
        //public string healthfacilitiesSearch { set; get; }
        public string phoneNumber { set; get; }
        public string phoneRepresent { set; get; }
        public string phoneSecondNumber { set; get; }
        public string provinceCode { set; get; }
        public string provinceCodeExamination { set; get; }
        public string reason { set; get; }
        public int relationshipId { set; get; }
        //public int? specialists { set; get; }
        public string ticketId { set; get; }
        public int? timeSlotId { set; get; }       
        public string wardCode { set; get; }

        public static explicit operator int(BookingInformationsInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}
