using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel;
using Viettel.MySql;


namespace SHCServer.ViewModels
{
    public class BookingDoctorsCalendarsViewModel
    {
        protected DbContext context;

        public BookingDoctorsCalendarsViewModel()
        {
        }

        public BookingDoctorsCalendarsViewModel(BookingDoctorsCalendars obj, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            CalendarId = obj.CalendarId;
            TimeSlotId = obj.TimeSlotId;
            DoctorId = obj.DoctorId;
            CalendarDate = obj.CalendarDate;

            var bookingDoctorsCalendars = context.JoinQuery<BookingDoctorsCalendars, BookingTimeslots>((o, o1) => new object[]
                {
                    JoinType.InnerJoin, o.TimeSlotId == o1.TimeSlotId
                })
                .Where((o, o1) => o.CalendarId == obj.CalendarId)
                .Select((o, o1) => o1).FirstOrDefault();

            HoursStart = bookingDoctorsCalendars != null ? bookingDoctorsCalendars.HoursStart : "";
            MinuteStart = bookingDoctorsCalendars != null ? bookingDoctorsCalendars.MinuteStart : "";
        }

        public int CalendarId { set; get; }
        public int TimeSlotId { set; get; }
        public int DoctorId { set; get; }
        public string HoursStart { set; get; }
        public string MinuteStart { set; get; }
        public DateTime CalendarDate { set; get; }
    }
}
