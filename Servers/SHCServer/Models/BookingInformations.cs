﻿using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("booking_informations")]
    public class BookingInformations //: IEntity
    {
        public BookingInformations()
        {

        }

        public BookingInformations(BookingInformationsInputViewModel obj)
        {
            Email = obj.email;
            Address = obj.address;
            Reason = obj.reason;

            BookingRepresent = obj.bookingRepresent;
            
            Status = obj.status;
            CreateDate = DateTime.Now;
            BookingServiceType = 1;
            ReasonReject = obj.reasonReject;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int BookingId { set; get; }
        public string TicketId { set; get; }
        public int BookingType { set; get; }
        //public int BookingSource { set; get; }
        public string BookingRepresent { set; get; }
        public string PhoneRepresent { set; get; }
        public string EmailRepresent { set; get; }
        public int RelationshipId { set; get; }
        public string BookingUser { set; get; }
        public string PhoneNumber { set; get; }
        public string Email { set; get; }
        public int? Gender { set; get; }
        public int? BirthDate { set; get; }
        public int? BirthMonth { set; get; }
        public int BirthYear { set; get; }
        public string Address { set; get; }
        public string ProvinceCode { set; get; }
        public string DistrictCode { set; get; }
        public string Reason { set; get; }
        public string ProvinceCodeExamination { set; get; }
        public string DistrictCodeExamination { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int? DoctorId { set; get; }
        public DateTime ExaminationDate { set; get; }
        public string ExaminationTime { set; get; }
        public int? ExaminationWorkingTime { set; get; }
        public int? TimeSlotId { set; get; }
        public int Status { set; get; }
        public bool IsDelete { set; get; }
        public DateTime CreateDate { set; get; }
        public DateTime UpdateDate { set; get; }
        public int UpdateUserId { set; get; }
        public int? BookingServiceType { get; set; }
        public string ReasonReject { get; set; }

    }
}