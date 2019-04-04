using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_doctors")]
    public class Doctor //: IEntity
    {
        public Doctor()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int DoctorId { set; get; }
        public int? AcademicId { set; get; }
        public int? DegreeId { set; get; }
        public string FullName { set; get; }
        public string Avatar { set; get; }
        public string Description { set; get; }
    }
}