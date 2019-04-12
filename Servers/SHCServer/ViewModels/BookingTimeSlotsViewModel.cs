using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class BookingTimeSlotsViewModel
    {
        protected DbContext context;
        public BookingTimeSlotsViewModel()
        {
        }

        public BookingTimeSlotsViewModel(BookingTimeslots bookingTimeslots, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));
             
            var HealthFacilities = context.JoinQuery<BookingTimeslots, HealthFacilities>((b, h) => new object[]
                      {
                            JoinType.InnerJoin, b.HealthFacilitiesId == h.HealthFacilitiesId
                      })
                       .Where((b, h) => b.TimeSlotId == bookingTimeslots.TimeSlotId)
                       .Select((b, h) => h).FirstOrDefault();
            if(HealthFacilities != null)
            {
                HealthFacilitiesName = HealthFacilities.Name;
            }
            else
            {
                HealthFacilitiesName = "";
            }
            HoursStart = bookingTimeslots.HoursStart;
            MinuteStart = bookingTimeslots.MinuteStart;
            HoursEnd = bookingTimeslots.HoursEnd;
            MinuteEnd = bookingTimeslots.MinuteEnd;
            Code = bookingTimeslots.Code;
            Name = bookingTimeslots.Name;
            IsActive = bookingTimeslots.IsActive;
            IsDefault = bookingTimeslots.IsDefault;
            TimeSlotId = bookingTimeslots.TimeSlotId;
        }
        public int TimeSlotId { set; get; }
        public string HoursStart { set; get; }
        public string MinuteStart { set; get; }
        public string HoursEnd { set; get; }
        public string MinuteEnd { set; get; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int? HealthFacilitiesId { get; set; }
        public string HealthFacilitiesName { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }

        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool IsDelete { get; set; }
    }
}
