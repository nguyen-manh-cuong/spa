using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel;
using Viettel.MySql;


namespace SHCServer.ViewModels
{
    public class BookingDoctorsViewModel
    {
        protected DbContext context;

        public BookingDoctorsViewModel()
        {
        }

        public BookingDoctorsViewModel(BookingTimeslots ts, int doctorId, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            HoursStart = ts.HoursStart;
            MinuteStart = ts.MinuteStart;
            HoursEnd = ts.HoursEnd;
            MinuteEnd = ts.MinuteEnd;
            TimeSlotId = ts.TimeSlotId;
            DoctorCalendar = ConvertListString(context.Query<BookingDoctorsCalendars>().Where(dc => dc.TimeSlotId == ts.TimeSlotId && dc.DoctorId == doctorId).ToList());
        }

        public string HoursStart { set; get; }
        public string MinuteStart { set; get; }
        public string HoursEnd { set; get; }
        public string MinuteEnd { set; get; }
        public int TimeSlotId { set; get; }
        public string Date { set; get; }
        public List<string> DoctorCalendar { set; get; }

        public List<string> ConvertListString(List<BookingDoctorsCalendars> doctorCalendar)
        {
            List<string> lstDate = new List<string>();

            foreach (var item in doctorCalendar)
            {
                lstDate.Add(item.CalendarDate != null ? item.CalendarDate.ToString("dd/MM/yyyy") : "");
            }

            return lstDate;
        }
    }

    public class BookingDoctorsInputViewModel
    {
        public string Address { set; get; }
        public int Doctor { set; get; }
        public string EndTime { set; get; }
        public string StartTime { set; get; }
        public int Healthfacilities { set; get; }
        public int UserId { set; get; }
        public int Status { set; get; }
        public List<TimeSlotInputViewModel> LstTimeSlot { set; get; }

    }

    public class TimeSlotInputViewModel
    {
        public int TimeSlotId { set; get; }
        public string Date { set; get; }
        public string DateTime { set; get; }
    }
}
