using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

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
    }
}