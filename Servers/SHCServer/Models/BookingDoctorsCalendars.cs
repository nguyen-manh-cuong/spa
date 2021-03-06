﻿using System;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("booking_doctors_calendars")]
    public class BookingDoctorsCalendars //: IEntity
    {
        public BookingDoctorsCalendars()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int CalendarId { set; get; }
        public int TimeSlotId { set; get; }
        public int DoctorId { set; get; }
        public DateTime CalendarDate { set; get; }
        public int Status { set; get; }
        public string Address { set; get; }
        public bool IsActive { set; get; }
        public bool IsDelete { set; get; }
        public int? ApproveUserId { set; get; }
        public DateTime? ApproveDate { set; get; }
        public int HealthFacilitiesId { set; get; }

        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateUserId { get; set; }
    }
}