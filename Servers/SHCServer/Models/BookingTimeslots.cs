using System;
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

        public string Code { get; set; }
        public string Name { get; set; }

        public int? HealthFacilitiesId { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }
        /// <summary>
        /// pro common
        /// </summary>        
        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool IsDelete { get; set; }




    }
}