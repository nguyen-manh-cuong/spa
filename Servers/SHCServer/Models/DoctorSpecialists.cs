using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_doctors_specialists")]
    public class DoctorSpecialists //: IEntity
    {
        public DoctorSpecialists()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int DoctorId { set; get; }
        public string SpecialistCode { set; get; }
    }
}