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
            HealthFacilitiesId = obj.HealthFacilitiesId;

            var Doctor = context.JoinQuery<BookingDoctorsCalendars, Doctor>((o, o1) => new object[]
                {
                    JoinType.InnerJoin, o.DoctorId == o1.DoctorId
                })
                .Where((o, o1) => o.CalendarId == obj.CalendarId)
                .Select((o, o1) => o1).FirstOrDefault();

            var BookingDoctorsCalendars = context.JoinQuery<BookingDoctorsCalendars, BookingTimeslots>((o, o1) => new object[]
                {
                    JoinType.InnerJoin, o.TimeSlotId == o1.TimeSlotId
                })
                .Where((o, o1) => o.CalendarId == obj.CalendarId)
                .Select((o, o1) => o1).FirstOrDefault();

            var HealthFacilities = context.JoinQuery<BookingDoctorsCalendars, HealthFacilities>((d, h) => new object[]
                       {
                            JoinType.InnerJoin, d.HealthFacilitiesId == h.HealthFacilitiesId
                       })
                        .Where((d, h) => d.CalendarId == obj.CalendarId)
                        .Select((d, h) => h).FirstOrDefault();

            FullName = Doctor != null ? Doctor.FullName : "";
            HoursStart = BookingDoctorsCalendars != null ? BookingDoctorsCalendars.HoursStart : "";
            MinuteStart = BookingDoctorsCalendars != null ? BookingDoctorsCalendars.MinuteStart : "";
            HoursEnd = BookingDoctorsCalendars != null ? BookingDoctorsCalendars.HoursEnd : "";
            MinuteEnd = BookingDoctorsCalendars != null ? BookingDoctorsCalendars.MinuteEnd : "";
            HealthFacilitiesName = HealthFacilities != null ? HealthFacilities.Name : "";
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
        public int HealthFacilitiesId { set; get; }
        public string HealthFacilitiesName { set; get; }        
    }
}
