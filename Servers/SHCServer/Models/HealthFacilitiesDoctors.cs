using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_healthfacilities_doctors")]
    public class HealthFacilitiesDoctors : IEntity
    {
        public HealthFacilitiesDoctors()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int DoctorId { set; get; }
    }
}