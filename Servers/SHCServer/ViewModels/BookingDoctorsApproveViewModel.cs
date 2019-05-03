using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel;
using Viettel.MySql;


namespace SHCServer.ViewModels
{
    public class BookingDoctorsApproveViewModel
    {
        protected DbContext context;

        public BookingDoctorsApproveViewModel()
        {
        }

        public BookingDoctorsApproveViewModel(BookingDoctorsCalendars dc, BookingTimeslots ts) : this()
        {
            Title = ts != null ? (ts.HoursStart + "h" + ts.MinuteStart + " - " + ts.HoursEnd + "h" + ts.MinuteEnd) : "";
            Start = new DateTime(dc.CalendarDate.Year, dc.CalendarDate.Month, dc.CalendarDate.Day, int.Parse(ts.HoursStart), int.Parse(ts.MinuteStart), 0);
            End = new DateTime(dc.CalendarDate.Year, dc.CalendarDate.Month, dc.CalendarDate.Day, int.Parse(ts.HoursEnd), int.Parse(ts.MinuteEnd), 0);
            Color = dc.Status == 1 ? "bisque" : (dc.Status == 2 ? "deepskyblue" : "aquamarine");
            TextColor = dc.Status == 2 ? "red" : "black";
            ClassName = dc.Status == 2 ? "del" : "";
            Description = dc.Address;
            //AllDay = true;
            //DisplayEventTime = false;
        }

        public string Title { set; get; }
        public DateTime Start { set; get; }
        public DateTime End { set; get; }
        public string Color { set; get; }
        public string TextColor { set; get; }
        public string ClassName { set; get; }
        public string Description { set; get; }
        //public bool AllDay { set; get; }
        //public bool DisplayEventTime { set; get; }
    }
}
