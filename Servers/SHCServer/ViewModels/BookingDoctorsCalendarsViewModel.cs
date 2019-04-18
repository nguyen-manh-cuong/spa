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
            Address = obj.Address;
            Status = obj.Status;
            StrCalendarDate = obj.CalendarDate.ToString("dd/MM/yyyy");

            var Doctor = context.JoinQuery<BookingDoctorsCalendars, Doctor>((o, o1) => new object[]
                {
                    JoinType.InnerJoin, o.DoctorId == o1.DoctorId
                })
                .Where((o, o1) => o.CalendarId == obj.CalendarId)
                .Select((o, o1) => o1).FirstOrDefault();

            var bookingDoctorsCalendars = context.JoinQuery<BookingDoctorsCalendars, BookingTimeslots>((o, o1) => new object[]
                {
                    JoinType.InnerJoin, o.TimeSlotId == o1.TimeSlotId
                })
                .Where((o, o1) => o.CalendarId == obj.CalendarId)
                .Select((o, o1) => o1).FirstOrDefault();

            FullName = Doctor != null ? Doctor.FullName : "";
            HoursStart = bookingDoctorsCalendars != null ? bookingDoctorsCalendars.HoursStart : "";
            MinuteStart = bookingDoctorsCalendars != null ? bookingDoctorsCalendars.MinuteStart : "";
            HoursEnd = bookingDoctorsCalendars != null ? bookingDoctorsCalendars.HoursEnd : "";
            MinuteEnd = bookingDoctorsCalendars != null ? bookingDoctorsCalendars.MinuteEnd : "";
        }

        public int CalendarId { set; get; }
        public int TimeSlotId { set; get; }
        public int DoctorId { set; get; }
        public string FullName { set; get; }
        public string HoursStart { set; get; }
        public string MinuteStart { set; get; }
        public string HoursEnd { set; get; }
        public string MinuteEnd { set; get; }
        public DateTime CalendarDate { set; get; }
        public string StrCalendarDate { set; get; }
        public int Status { set; get; }
        public string Address { set; get; }
    }
}
