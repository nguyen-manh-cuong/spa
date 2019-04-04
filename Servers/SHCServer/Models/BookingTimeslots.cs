using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("booking_timeslots")]
    public class BookingTimeslots //: IEntity
    {
        public BookingTimeslots()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int TimeSlotId { set; get; }
        public string HoursStart { set; get; }
        public string MinuteStart { set; get; }

        public string HoursEnd { set; get; }
        public string MinuteEnd { set; get; }
    }
}