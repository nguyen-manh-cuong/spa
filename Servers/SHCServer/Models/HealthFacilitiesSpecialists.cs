using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_healthfacilities_specialists")]
    public class HealthFacilitiesSpecialists //: IEntity
    {
        public HealthFacilitiesSpecialists()
        {

        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { get; set; }
        public int HealthFacilitiesId { set; get; }
        public string SpecialistCode { set; get; }
        public bool? IsDelete { get; set; }
    }
}